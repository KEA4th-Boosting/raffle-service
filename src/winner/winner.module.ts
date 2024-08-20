import {forwardRef, Module} from '@nestjs/common';
import { WinnerService } from './winner.service';
import {Winner} from "./entities/winner.entity";
import {WinnerController} from "./winner.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {RaffleModule} from "../raffle/raffle.module";
import {HttpModule} from "@nestjs/axios";
import {EntryModule} from "../entry/entry.module";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ClientsModule, Transport} from "@nestjs/microservices";

@Module({
  imports: [
      TypeOrmModule.forFeature([Winner]),
      forwardRef(() => RaffleModule),
      forwardRef(() => EntryModule),
      HttpModule,
      ConfigModule,
      ClientsModule.registerAsync([
          {
              name: 'WINNER_PRODUCER',
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: (configService: ConfigService) => ({
                  transport: Transport.KAFKA,
                  options: {
                      client: {
                          clientId: 'winner',
                          brokers: [configService.get<string>('KAFKA_CLUSTER_URL')],
                      },
                      consumer: {
                          groupId: 'group_1',
                      },
                  },
              }),
          },
      ]),
  ],
  exports: [WinnerService],
  controllers: [WinnerController],
  providers: [WinnerService],
})

export class WinnerModule {}
