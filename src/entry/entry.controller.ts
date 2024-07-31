import {Body, Controller, Post, Put} from '@nestjs/common';
import {EntryService} from "./entry.service";
import {Entry} from "./entities/entry.entity";
import {CreateEntryDto} from "./dto/create-entry.dto";

@Controller('entry')
export class EntryController {
    constructor(private entryService: EntryService) {}

    @Post()
    async create(@Body() createEntryDto: CreateEntryDto): Promise<Entry> {
        return await this.entryService.create(createEntryDto);
    }
}

