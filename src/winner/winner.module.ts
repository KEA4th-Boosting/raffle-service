import {forwardRef, Module} from '@nestjs/common';
import { WinnerService } from './winner.service';
import {Winner} from "./entities/winner.entity";
import {WinnerController} from "./winner.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {RaffleModule} from "../raffle/raffle.module";
import {HttpModule} from "@nestjs/axios";

@Module({
  imports: [
      TypeOrmModule.forFeature([Winner]),
      forwardRef(() => RaffleModule),
      HttpModule,
  ],
  exports: [WinnerService],
  controllers: [WinnerController],
  providers: [WinnerService],
})

export class WinnerModule {}
