import {forwardRef, Module} from '@nestjs/common';
import { RaffleService } from './raffle.service';
import { RaffleController } from './raffle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './entities/raffle.entity';
import { EntryModule } from "../entry/entry.module";
import { WinnerModule } from "../winner/winner.module";
import {HttpModule} from "@nestjs/axios";
import {ClientsModule, Transport} from "@nestjs/microservices";

@Module({
  imports: [
      TypeOrmModule.forFeature([Raffle]),
      forwardRef(() => EntryModule),
      forwardRef(() => WinnerModule),
      HttpModule,
      ClientsModule.register([
          {
              name: 'RAFFLE_PRODUCER',
              transport: Transport.KAFKA,
              options: {
                  client: {
                      brokers: ['210.109.53.237:9092'],
                  },
                  consumer: {
                      groupId: 'group_1',
                  },
              },
          },
      ]),
  ],
  exports: [RaffleService],
  controllers: [RaffleController],
  providers: [RaffleService],
})
export class RaffleModule {}
