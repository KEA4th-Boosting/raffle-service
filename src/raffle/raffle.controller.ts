import {Body, Controller, Post, Put} from '@nestjs/common';
import { Raffle } from './entities/raffle.entity';
import { RaffleService } from './raffle.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';

@Controller('raffle')
export class RaffleController {
  constructor(private raffleService: RaffleService) {}

  @Post()
  async create(@Body() createRaffleDto: CreateRaffleDto): Promise<Raffle> {
    return await this.raffleService.create(createRaffleDto);
  }

  /*
  @Put()
  async raffle(@Body() raffleRaffleDto: RaffleRaffleDto): Promise<Raffle> {
    return await this.raffleService.raffle(raffleRaffleDto);
  }
   */
}
