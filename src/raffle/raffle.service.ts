import { Injectable, NotFoundException } from '@nestjs/common';
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
import {EnterRaffleDto} from "./dto/enter-raffle.dto";

@Injectable()
export class RaffleService {
  private provider: JsonRpcProvider;
  private abi: any;
  private bytecode: string;

  constructor(
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,
    private readonly configService: ConfigService
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
    createRaffleDto.contract_address = await this.deployRaffle(createRaffleDto);
    const newRaffle = this.raffleRepository.create(createRaffleDto);
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
    await this.raffleRepository.update(raffleId, updateRaffleDto);
    return this.findOne(raffleId);
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

  async getRaffle(address: string) {
    const contract = new ethers.Contract(address, this.abi, this.provider);

    //await this.selectWinners(address);

    const raffleDate = (await contract.getRaffleDate()).toString();
    const blockTimestamp = (await contract.getCurrentTimestamp()).toString();
    //const winnerCnt = await contract.winnerCnt();
    //const raffleWaitingCnt = await contract.raffleWaitingCnt();
    const totalIndex = (await contract.totalIndex()).toString();
    //const owner = await contract.owner();
    const participants = await contract.getParticipants();
    const winners = await contract.getWinners();
    const waitingList = await contract.getWaitingList();
    const entry = (await contract.getEntryMap('1')).toString();

    return {
      raffleDate,
      blockTimestamp,
      //winnerCnt,
      //raffleWaitingCnt,
      totalIndex,
      //owner,
      participants,
      winners,
      waitingList,
      entry,
    };
  }

  async selectWinners(address: string) {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.provider);
    const contract = new ethers.Contract(address, this.abi, wallet);

    const tx = await contract.selectWinners();
    await tx.wait();

    return tx;
  }

  async enterRaffle(enterRaffleDto: EnterRaffleDto) {
    const raffle = await this.findOne(enterRaffleDto.raffle_id);

    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.provider);

    const contract = new ethers.Contract(raffle.contract_address, this.abi, wallet);

    const tx = await contract.enterRaffle(enterRaffleDto.user_id.toString(), enterRaffleDto.raffle_index);
    await tx.wait();
    //const tx = await contract.sendTransaction({
      //to: raffle.contract_address,
      //value: enterRaffleDto.raffle_index,
    //});

    return tx;
  }
}
