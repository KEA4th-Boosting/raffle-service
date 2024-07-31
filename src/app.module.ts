import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EntryModule } from './entry/entry.module';
import { RaffleModule } from './raffle/raffle.module';
import { Entry } from './entry/entities/entry.entity';
import { Raffle } from './raffle/entities/raffle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { WinnerController } from './winner/winner.controller';
import { WinnerModule } from './winner/winner.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
      entities: [Entry, Raffle],
      synchronize: Boolean(process.env.DB_SYNCHRONIZE),
    }),
    EntryModule,
    RaffleModule,
    WinnerModule,
  ],
  controllers: [AppController, WinnerController],
  providers: [AppService],
})
export class AppModule {}
