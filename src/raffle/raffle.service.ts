import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

import {LessThanOrEqual, MoreThanOrEqual, Repository} from 'typeorm';

import { Raffle } from './entities/raffle.entity';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import {Entry} from "../entry/entities/entry.entity";
import {UpdateRaffleDto} from "./dto/update-raffle.dto";

const raffleAbi = [
  // 위에서 제공한 ABI 배열
];

@Injectable()
export class RaffleService {
  private provider: ethers.providers.JsonRpcProvider;

  constructor(
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,
    private readonly configService: ConfigService
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(this.configService.get<string>('ALL_THAT_NODE_URL'));
  }

  async create(createRaffleDto: CreateRaffleDto): Promise<Raffle> {
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

  async deployRaffle(createRaffleDto: CreateRaffleDto): Promise<Raffle> {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.provider);

    const raffleFactory = new ethers.ContractFactory(raffleAbi, bytecode, wallet);
    const raffleContract = await raffleFactory.deploy();

    await raffleContract.deployed();

    const raffle = new Raffle();
    raffle.contractAddress = raffleContract.address;
    raffle.createdAt = new Date();
    await this.raffleRepository.save(raffle);

    return raffle;
  }
}
