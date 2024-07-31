import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

import { Entry } from "./entities/entry.entity";
import { CreateEntryDto } from "./dto/create-entry.dto";

@Injectable()
export class EntryService {
    constructor(
        @InjectRepository(Entry)
        private entryRepository: Repository<Entry>,
    ) {}

    async create(createEntryDto: CreateEntryDto): Promise<Entry> {
        const newEntry = this.entryRepository.create(createEntryDto);
        return await this.entryRepository.save(newEntry);
    }
}
