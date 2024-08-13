import {Body, Controller, Delete, Get, HttpStatus, Param, Post, Put} from '@nestjs/common';
import {EntryService} from "./entry.service";
import {Entry} from "./entities/entry.entity";
import {CreateEntryDto} from "./dto/create-entry.dto";
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {UserEntryDto} from "./dto/user-entry.dto";

@ApiTags('entry')
@Controller('entry')
export class EntryController {
    constructor(private entryService: EntryService) {}

    @ApiOperation({ summary: '응모 생성', description: '추첨에 응모를 생성합니다.'})
    @Post()
    async create(@Body() createEntryDto: CreateEntryDto): Promise<{ systemCode: number, message: string }> {
        await this.entryService.create(createEntryDto);
        return {
            systemCode: HttpStatus.CREATED,
            message: "응모가 완료되었습니다."
        }
    }

    @ApiOperation({ summary: '응모 조회', description: '응모 아이디로 응모를 조회합니다.'})
    @Get('/:entryId')
    async findOne(@Param('entryId') entryId: number): Promise<{ systemCode: number, message: string, data: Entry }> {
        const entry: Entry = await this.entryService.findOne(entryId);
        return {
            systemCode: HttpStatus.OK,
            message: "응모 조회에 성공하였습니다.",
            data: entry
        }
    }


    @ApiOperation({ summary: '개인이 응모한 내역 조회', description: '본인이 현재까지 응모한 내역들을 최신순으로 가져옵니다.'})
    @Get('/user/:userId')
    async findUserEntries(@Param('userId') userId: number): Promise<{ systemCode: number, message: string, data: UserEntryDto[] }> {
        const userEntries: UserEntryDto[] = await this.entryService.findUserEntries(userId);
        return {
            systemCode: HttpStatus.OK,
            message: "응모 조회에 성공하였습니다.",
            data: userEntries
        }
    }

    /*
    @ApiOperation({ summary: '경쟁률 조회', description: '특정 추첨의 경쟁률을 조회합니다.'})
    @Get('/competition/:raffleId')
    async getCompetition(@Param('raffleId') raffleId: number): Promise<{ systemCode: number, message: string, data: number }> {
        const competition = await this.entryService.getCompetition(raffleId);
        return {
            systemCode: HttpStatus.OK,
            message: "경쟁률 조회에 성공하였습니다.",
            data: competition
        }
    }
    */

    @ApiOperation({ summary: '응모 삭제', description: '응모를 삭제합니다.' })
    @Delete('/:entryId')
    async remove(@Param('entryId') entryId: number): Promise<{ systemCode: number, message: string }> {
        await this.entryService.remove(entryId);
        return {
            systemCode: HttpStatus.OK,
            message: "응모 삭제에 성공하였습니다.",
        };
    }
}