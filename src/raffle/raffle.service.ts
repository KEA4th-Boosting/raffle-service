import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Raffle } from './entities/raffle.entity';
import { CreateRaffleDto } from './dto/create-raffle.dto';

@Injectable()
export class RaffleService {
  constructor(
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,
  ) {}

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

  async isRaffleOngoing(raffleId: number): Promise<boolean> {
    const raffle = await this.findOne(raffleId);

    const now = new Date();
    const isOngoing =
        now >= raffle.entry_start_date && now <= raffle.entry_end_date;

    return isOngoing;
  }

/*
  async raffle(raffleRaffleDto: raffleRaffleDto): Promise<Raffle> {

  }
 */
}
