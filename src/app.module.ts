import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EntryModule } from './entry/entry.module';
import { RaffleModule } from './raffle/raffle.module';
import { WinnerModule } from './winner/winner.module';
import { Entry } from './entry/entities/entry.entity';
import { Raffle } from './raffle/entities/raffle.entity';
import { Winner } from './winner/entities/winner.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Entry, Raffle, Winner],
      synchronize: Boolean(process.env.DB_SYNCHRONIZE),
    }),
    EntryModule,
    RaffleModule,
    WinnerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
