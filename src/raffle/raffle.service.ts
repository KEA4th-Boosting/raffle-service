import { Injectable } from '@nestjs/common';
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
}
