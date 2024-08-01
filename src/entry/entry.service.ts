import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

import { Entry } from "./entities/entry.entity";
import { CreateEntryDto } from "./dto/create-entry.dto";
import {RaffleService} from "../raffle/raffle.service";

@Injectable()
export class EntryService {
    constructor(
        @InjectRepository(Entry)
        private entryRepository: Repository<Entry>,
        private raffleService: RaffleService,
    ) {}

    async create(createEntryDto: CreateEntryDto): Promise<Entry> {
        const { raffle_id } = createEntryDto;

        const isOngoing = await this.raffleService.isRaffleOngoing(raffle_id);
        if (!isOngoing) {
            throw new Error('추첨이 진행중이지 않습니다.');
        }

        const newEntry = this.entryRepository.create(createEntryDto);
        return await this.entryRepository.save(newEntry);
    }

    async findOne(entryId: number): Promise<Entry> {
        return await this.entryRepository.findOne({
            where: {
                id: entryId,
            },
        });
    }
}
