import {forwardRef, Inject, Injectable, NotFoundException} from '@nestjs/common';
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

@Injectable()
export class RaffleService {
  private provider: JsonRpcProvider;
  private abi: any;
  private bytecode: string;

  constructor(
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => EntryService))
    private entryService: EntryService,
    @Inject(forwardRef(() => WinnerService))
    private winnerService: WinnerService,
  ) {
    this.provider = new JsonRpcProvider(this.configService.get<string>('ALL_THAT_NODE_URL'));
    this.loadContract()
  }

  private loadContract() {
    const sourceCode = readFileSync(join(__dirname, '../../../contracts/Raffle.sol'), 'utf8');
    const input = {
      language: 'Solidity',
      sources: {
        'Raffle.sol': {
          content: sourceCode,
        },
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
    const wallet = new ethers.Wallet(privateKey, this.provider);
    const raffleDateTimestamp = Math.floor(createRaffleDto.raffle_date.getTime() / 1000);
    const raffleFactory = new ethers.ContractFactory(this.abi, this.bytecode, wallet);
    const contract = await raffleFactory.deploy(
        createRaffleDto.raffle_name,
        raffleDateTimestamp,
        createRaffleDto.winner_cnt,
        createRaffleDto.raffle_waiting_cnt
    );
    await contract.waitForDeployment();

    return await contract.getAddress();
  }

  async getContract(raffleId: number) {
    const raffle = await this.findOne(raffleId);
    const contract = new ethers.Contract(raffle.contract_address, this.abi, this.provider);

    const raffleDate = (await contract.getRaffleDate()).toString();
    const totalIndex = (await contract.getTotalIndex()).toString();
    const winnerIndex = (await contract.getWinnerIndex()).toString();
    const minIndex = (await contract.getMinIndex()).toString();
    const maxIndex = (await contract.getMaxIndex()).toString();
    const winners = await contract.getWinners();
    const waitingList = await contract.getWaitingList();
    const winnerCnt = (await contract.getWinnerCnt()).toString();
    const raffleWaitingCnt = (await contract.getRaffleWaitingCnt()).toString()
    const [participants, indexes, times] = await contract.getEntries();
    const parsedEntries = participants.map((participant: string, i: number) => ({
      participant,
      index: indexes[i].toString(),
      entryTime: times[i].toString(),
    }));

    return {
      raffleDate,
      totalIndex,
      winnerIndex,
      minIndex,
      maxIndex,
      winners,
      waitingList,
      entries: parsedEntries,
      winnerCnt,
      raffleWaitingCnt,
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
    const raffles = await this.raffleRepository.find({
      where: {
        raffle_status: false,
      },
    });

    const currentTime = Date.now();

    for (const raffle of raffles) {
      if (raffle.raffle_date.getTime() <= currentTime) {
        await this.selectWinners(raffle.contract_address);

        const raffleResult = await this.getContract(raffle.id);
        const winners = raffleResult.winners
        const waitingList = raffleResult.waitingList

        for (let i = 0; i < winners.length; i++) {
          const entry = await this.entryService.findOne(Number(winners[i]));
          const createWinnerDto: CreateWinnerDto = {
            raffle_id: raffle.id,
            entry_id: entry.id,
            user_id: entry.user_id,
            waiting_number: 0,
            benefit_value: raffle.discount_rate * 0,
          };
          await this.winnerService.create(createWinnerDto);
        }

        for (let i = 0; i < waitingList.length; i++) {
          const entry = await this.entryService.findOne(Number(waitingList[i]));
          const createWinnerDto: CreateWinnerDto = {
            raffle_id: raffle.id,
            entry_id: entry.id,
            user_id: entry.user_id,
            waiting_number: i + 1,
            benefit_value: raffle.discount_rate * 0,
          };
          await this.winnerService.create(createWinnerDto);
        }

        raffle.raffle_status = true;
        await this.raffleRepository.update(raffle.id, { raffle_status: true });
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
