import {Body, Controller, HttpStatus, Post, Put} from '@nestjs/common';
import {EntryService} from "./entry.service";
import {Entry} from "./entities/entry.entity";
import {CreateEntryDto} from "./dto/create-entry.dto";
import {ApiOperation, ApiTags} from "@nestjs/swagger";

@ApiTags('entry')
@Controller('entry')
export class EntryController {
    constructor(private entryService: EntryService) {}

    @ApiOperation({ summary: '응모 생성', description: '새로운 응모 항목을 생성합니다.'})
    @Post()
    async create(@Body() createEntryDto: CreateEntryDto): Promise<{ message: string, statusCode: number }> {
        await this.entryService.create(createEntryDto);
        return {
            message: "추첨이 생성되었습니다.",
            statusCode: HttpStatus.CREATED,
        }
    }
}

