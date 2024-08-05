import { Module } from '@nestjs/common';
import { WinnerService } from './winner.service';
import {Winner} from "./entities/winner.entity";
import {WinnerController} from "./winner.controller";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Winner])],
  exports: [TypeOrmModule],
  controllers: [WinnerController],
  providers: [WinnerService],
})

export class WinnerModule {}
