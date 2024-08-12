import {forwardRef, Inject, Injectable} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

import { Entry } from "./entities/entry.entity";
import { CreateEntryDto } from "./dto/create-entry.dto";
import {RaffleService} from "../raffle/raffle.service";
import {CreateWinnerDto} from "../winner/dto/create-winner.dto";
import {EnterRaffleDto} from "../raffle/dto/enter-raffle.dto";

@Injectable()
export class EntryService {
    constructor(
        @InjectRepository(Entry)
        private entryRepository: Repository<Entry>,
        @Inject(forwardRef(() => RaffleService))
        private raffleService: RaffleService,
    ) {}

    async create(createEntryDto: CreateEntryDto): Promise<Entry> {
        const { raffle_id } = createEntryDto;

        const isOngoing = await this.raffleService.isRaffleOngoing(raffle_id);
        if (!isOngoing) {
            throw new Error('추첨이 진행중이지 않습니다.');
        }

        const newEntry = this.entryRepository.create(createEntryDto);
        await this.entryRepository.save(newEntry);

        const enterRaffleDto: EnterRaffleDto = {
            raffle_id: createEntryDto.raffle_id,
            entry_id: newEntry.id,
            raffle_index: createEntryDto.raffle_index,
        }
        return await this.raffleService.enterRaffle(enterRaffleDto);
    }

    async findOne(entryId: number): Promise<Entry> {
        return await this.entryRepository.findOne({
            where: {
                id: entryId,
            },
        });
    }

    //async findUserEntries(userId: number): Promise<>{

    //}

    async remove(entryId: number): Promise<number> {
        await this.entryRepository.delete(entryId);
        return entryId;
    }
}
