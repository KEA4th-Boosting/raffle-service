import {forwardRef, Module} from '@nestjs/common';
import { RaffleService } from './raffle.service';
import { RaffleController } from './raffle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './entities/raffle.entity';
import { EntryModule } from "../entry/entry.module";
import { WinnerModule } from "../winner/winner.module";
import {HttpModule} from "@nestjs/axios";
import {ClientProviderOptions, ClientsModule, Transport} from "@nestjs/microservices";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
  imports: [
      TypeOrmModule.forFeature([Raffle]),
      forwardRef(() => EntryModule),
      forwardRef(() => WinnerModule),
      HttpModule,
      ConfigModule,
      ClientsModule.registerAsync([
          {
              name: 'RAFFLE_PRODUCER',
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: (configService: ConfigService)=> ({
                  transport: Transport.KAFKA,
                  options: {
                      client: {
                          clientId: 'raffle',
                          brokers: [configService.get<string>('KAFKA_CLUSTER_URL')],
                      },
                      consumer: {
                          groupId: 'group_2',
                      },
                  },
              }),
          },
      ]),
  ],
  exports: [RaffleService],
  controllers: [RaffleController],
  providers: [RaffleService],
})
export class RaffleModule {}
