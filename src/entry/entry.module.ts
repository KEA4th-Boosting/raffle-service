import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Entry} from "./entities/entry.entity";
import {EntryController} from "./entry.controller";
import {EntryService} from "./entry.service";
import {RaffleModule} from "../raffle/raffle.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Entry]),
        RaffleModule,
    ],
    exports: [TypeOrmModule],
    controllers: [EntryController],
    providers: [EntryService],
})
export class EntryModule {}
