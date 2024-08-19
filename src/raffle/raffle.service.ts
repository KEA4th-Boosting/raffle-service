import {forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider } from 'ethers';
import * as solc from 'solc';
import { readFileSync } from 'fs';
import { join } from 'path';

import {LessThanOrEqual, MoreThanOrEqual, Repository} from 'typeorm';

import { Raffle } from './entities/raffle.entity';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from "./dto/update-raffle.dto";
import { EnterRaffleDto } from "./dto/enter-raffle.dto";
import { CreateWinnerDto } from "../winner/dto/create-winner.dto";
import { WinnerService } from "../winner/winner.service";
import { EntryService } from "../entry/entry.service";
import {GetContractDto} from "./dto/get-contract.dto";
import {lastValueFrom} from "rxjs";
import {HttpService} from "@nestjs/axios";
import {ClientKafka} from "@nestjs/microservices";

@Injectable()
export class RaffleService {
  private provider: JsonRpcProvider;
  private abi: any;
  private bytecode: string;

  constructor(
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => EntryService))
    private entryService: EntryService,
    @Inject(forwardRef(() => WinnerService))
    private winnerService: WinnerService,
    @Inject('RAFFLE_PRODUCER') private readonly kafkaProducer: ClientKafka,
  ) {
    this.provider = new JsonRpcProvider(this.configService.get<string>('ALL_THAT_NODE_URL'));
    this.loadContract()
  }

  private loadContract() {
    const raffleCode = readFileSync(join(__dirname, '../../../contracts/Raffle.sol'), 'utf8');
    const randomCode = readFileSync(join(__dirname, '../../../contracts/UpbitRandomGenerator.sol'), 'utf8');
    const input = {
      language: 'Solidity',
      sources: {
        'Raffle.sol': {
          content: raffleCode,
        },
        'UpbitRandomGenerator.sol': {
          content: randomCode,
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode.object'],
          },
        },
      },
    };
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contractOutput = output.contracts['Raffle.sol']['Raffle'];
    this.abi = contractOutput.abi;
    this.bytecode = contractOutput.evm.bytecode.object;
  }

  private convertToKST(date: Date): Date {
    const offset = 9 * 60 * 60 * 1000;
    return new Date(date.getTime() + offset);
  }

  async create(createRaffleDto: CreateRaffleDto): Promise<Raffle> {
    createRaffleDto.raffle_date = new Date(createRaffleDto.raffle_date);
    createRaffleDto.check_in = new Date(createRaffleDto.check_in);
    createRaffleDto.check_out = new Date(createRaffleDto.check_out);
    createRaffleDto.entry_start_date = new Date(createRaffleDto.entry_start_date);
    createRaffleDto.entry_end_date = new Date(createRaffleDto.entry_end_date);

    const contractAddress: string = await this.deployRaffle(createRaffleDto);
    const updateRaffleDto:UpdateRaffleDto = {
      ...createRaffleDto,
      contract_address: contractAddress,
    }

    const newRaffle = this.raffleRepository.create(updateRaffleDto);
    return await this.raffleRepository.save(newRaffle);
  }

  async findOne(raffleId: number): Promise<Raffle> {
    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId },
    });
    if (!raffle) {
      throw new NotFoundException('추첨을 찾지 못했습니다.');
    }
    return raffle;
  }

  async findAll(): Promise<Raffle[]> {
    return await this.raffleRepository.find();
  }

  async findOngoingRafflesLatest(): Promise<Raffle[]> {
    const now = new Date();
    return await this.raffleRepository.find({
      where: {
        entry_start_date: LessThanOrEqual(now),
        entry_end_date: MoreThanOrEqual(now),
      },
      order: { id: 'DESC' },
    });
  }

  async findOngoingRafflesPopular(): Promise<Raffle[]> {
    const now = new Date();
    return await this.raffleRepository.find({
      where: {
        entry_start_date: LessThanOrEqual(now),
        entry_end_date: MoreThanOrEqual(now),
        },
      order: { participant_cnt: 'DESC' },
    });
  }

  async update(raffleId: number, updateRaffleDto: UpdateRaffleDto): Promise<Raffle> {
    await this.findOne(raffleId);
    await this.raffleRepository.update(raffleId, updateRaffleDto);
    return await this.findOne(raffleId);
  }

  async remove(raffleId: number): Promise<number> {
    await this.raffleRepository.delete(raffleId);
    return raffleId;
  }

  async isRaffleOngoing(raffleId: number): Promise<boolean> {
    const raffle = await this.findOne(raffleId);
    const now = new Date();
    const isOngoing =
        now >= raffle.entry_start_date && now <= raffle.entry_end_date;
    return isOngoing;
  }

  async deployRaffle(createRaffleDto: CreateRaffleDto):Promise<string> {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const randomGenerator = this.configService.get<string>('RANDOM_GENERATOR');
    const wallet = new ethers.Wallet(privateKey, this.provider);
    const raffleDateTimestamp = Math.floor(createRaffleDto.raffle_date.getTime() / 1000);
    const raffleFactory = new ethers.ContractFactory(this.abi, this.bytecode, wallet);
    const contract = await raffleFactory.deploy(
        createRaffleDto.raffle_name,
        raffleDateTimestamp,
        createRaffleDto.winner_cnt,
        createRaffleDto.raffle_waiting_cnt,
        randomGenerator
    );
    await contract.waitForDeployment();
    return await contract.getAddress();
  }

  async getContract(raffleId: number) {
    const raffle = await this.findOne(raffleId);
    const contract = new ethers.Contract(raffle.contract_address, this.abi, this.provider);

    const raffleDate: Date = this.convertToKST(new Date(  Number(await contract.getRaffleDate()) * 1000));
    const totalIndex: number = Number(await contract.getTotalIndex());
    const winnerIndex: number = Number(await contract.getWinnerIndex());
    const waitingIndex: number = Number(await contract.getWaitingIndex());
    const minIndex: number = Number(await contract.getMinIndex());
    const maxIndex: number = Number(await contract.getMaxIndex());
    const winners = await contract.getWinners();
    const waitingList = await contract.getWaitingList();
    const winnerCnt: number = Number(await contract.getWinnerCnt());
    const raffleWaitingCnt: number = Number(await contract.getRaffleWaitingCnt());
    const [participants, indexes, times] = await contract.getEntries();
    const parsedEntries = participants.map((participant: string, i: number) => ({
      entry_id: participant,
      raffle_index: Number(indexes[i]),
      entry_time: this.convertToKST(new Date(Number(times[i]) * 1000)),
    }));

    const averageIndex = participants.length > 0 ? totalIndex / participants.length : 0;

    // Case 1: 응모가 없을 때
    if (participants.length === 0) {
      return {
        raffle_date: raffleDate,
        contract_address: raffle.contract_address,
        winner_cnt: winnerCnt,
        raffle_waiting_cnt: raffleWaitingCnt,
      };
    }

    // Case 2: 응모가 있지만 추첨이 진행되지 않았을 때
    if (winners.length === 0) {
      return {
        raffle_date: raffleDate,
        contract_address: raffle.contract_address,
        winner_cnt: winnerCnt,
        raffle_waiting_cnt: raffleWaitingCnt,
        average_index: averageIndex,
        min_index: minIndex,
        max_index: maxIndex,
        entries: parsedEntries,
      };
    }

    // Case 3: 추첨이 진행되었을 때
    const winnerAverageIndex: number = winners.length > 0 ? winnerIndex / winners.length : 0;
    const waitingAverageIndex: number = waitingList.length > 0 ? waitingIndex / waitingList.length : 0;

    return {
      raffle_date: raffleDate,
      contract_address: raffle.contract_address,
      winner_cnt: winnerCnt,
      raffle_waiting_cnt: raffleWaitingCnt,
      average_index: averageIndex,
      winner_average_index: winnerAverageIndex,
      waiting_average_index: waitingAverageIndex,
      min_index: minIndex,
      max_index: maxIndex,
      winners,
      waiting_list: waitingList,
      entries: parsedEntries,
    };
  }

  async enterRaffle(enterRaffleDto: EnterRaffleDto) {
    const raffle = await this.findOne(enterRaffleDto.raffle_id);

    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.provider);

    const contract = new ethers.Contract(raffle.contract_address, this.abi, wallet);

    const tx = await contract.enterRaffle(enterRaffleDto.entry_id.toString(), enterRaffleDto.raffle_index, enterRaffleDto.entry_time);
    await tx.wait();

    return tx;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async progressRaffle() {
    const productURL = this.configService.get<string>('PRODUCT_SERVICE_URL')
    const raffles = await this.raffleRepository.find({
      where: {
        raffle_status: false,
      },
    });

    const currentTime = Date.now();

    for (const raffle of raffles) {
      const blockCheck: GetContractDto = await this.getContract(raffle.id);
      if (blockCheck.winners && blockCheck.winners.length > 0) {
        continue;
      }
      if (raffle.raffle_date.getTime() <= currentTime) {
        await this.selectWinners(raffle.contract_address);
        const raffleResult: GetContractDto = await this.getContract(raffle.id);
        const winners: number[] = raffleResult.winners
        const waitingList: number[] = raffleResult.waiting_list

        let roomDetails;
        try {
          const response = await lastValueFrom(
              this.httpService.get(`${productURL}/product/room/${raffle.room_id}`)
          );
          roomDetails = response.data.data;
        } catch (error) {
          throw new HttpException('방 데이터 조회에 실패하였습니다.', HttpStatus.BAD_REQUEST);
        }

        for (let i = 0; i < winners.length; i++) {
          const entry = await this.entryService.findOne(Number(winners[i]));
          const createWinnerDto: CreateWinnerDto = {
            raffle_id: raffle.id,
            entry_id: entry.id,
            user_id: entry.user_id,
            waiting_number: 0,
            benefit_value: raffle.discount_rate * roomDetails.originalValue,
          };
          await this.winnerService.create(createWinnerDto);

          /*
          this.kafkaProducer.emit('raffle.winner', {
            userId: entry.user_id,
            raffleId: raffle.id,
            message: '추첨에 당첨되었습니다.',
          });
          */
        }

        for (let i = 0; i < waitingList.length; i++) {
          const entry = await this.entryService.findOne(Number(waitingList[i]));
          const createWinnerDto: CreateWinnerDto = {
            raffle_id: raffle.id,
            entry_id: entry.id,
            user_id: entry.user_id,
            waiting_number: i + 1,
            benefit_value: raffle.discount_rate * roomDetails.originalValue,
          };
          await this.winnerService.create(createWinnerDto);

          /*
          this.kafkaProducer.emit('raffle.waiting', {
            userId: entry.user_id,
            raffleId: raffle.id,
            waitingNumber: i + 1,
            message: `${i + 1}번째 대기자로 당첨되었습니다.`,
          });
           */
        }

        raffle.raffle_status = true;
        await this.raffleRepository.save(raffle);
      }
    }
  }

  async selectWinners(address: string) {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.provider);
    const contract = new ethers.Contract(address, this.abi, wallet);

    const tx = await contract.selectWinners();
    await tx.wait();

    return tx;
  }
}
