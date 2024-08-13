import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Entry} from "./entities/entry.entity";
import {EntryController} from "./entry.controller";
import {EntryService} from "./entry.service";
import {RaffleModule} from "../raffle/raffle.module";
import {HttpModule} from "@nestjs/axios";
import {WinnerModule} from "../winner/winner.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Entry]),
        forwardRef(() => RaffleModule),
        forwardRef(() => WinnerModule),
        HttpModule,
    ],
    exports: [EntryService],
    controllers: [EntryController],
    providers: [EntryService],
})
export class EntryModule {}
