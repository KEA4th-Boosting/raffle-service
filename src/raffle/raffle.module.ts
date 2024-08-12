import {forwardRef, Module} from '@nestjs/common';
import { RaffleService } from './raffle.service';
import { RaffleController } from './raffle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './entities/raffle.entity';
import { EntryModule } from "../entry/entry.module";
import { WinnerModule } from "../winner/winner.module";

@Module({
  imports: [
      TypeOrmModule.forFeature([Raffle]),
      forwardRef(() => EntryModule),
      forwardRef(() => WinnerModule),
  ],
  exports: [RaffleService],
  controllers: [RaffleController],
  providers: [RaffleService],
})
export class RaffleModule {}
