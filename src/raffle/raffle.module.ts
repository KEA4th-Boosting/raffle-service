import { Module } from '@nestjs/common';
import { RaffleService } from './raffle.service';
import { RaffleController } from './raffle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './entities/raffle.entity';
import {ScheduleModule} from "@nestjs/schedule";

@Module({
  imports: [
      TypeOrmModule.forFeature([Raffle]),
  ],
  exports: [RaffleService],
  controllers: [RaffleController],
  providers: [RaffleService],
})
export class RaffleModule {}
