import {Body, Controller, Get, HttpStatus, Param, Post, Put} from '@nestjs/common';
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {WinnerService} from "./winner.service";
import {Winner} from "./entities/winner.entity";
import {CreateWinnerDto} from "./dto/create-winner.dto";
import {UpdateRaffleDto} from "../raffle/dto/update-raffle.dto";
import {UpdateWinnerDto} from "./dto/update-winner.dto";

@ApiTags('winner')
@Controller('winner')
export class WinnerController {
    constructor(private winnerService: WinnerService) {}

    @ApiOperation({ summary: '당첨 생성', description: '당첨 내역을 생성합니다.'})
    @Post()
    async create(@Body() createWinnerDto: CreateWinnerDto): Promise<{ systemCode: number, message: string }> {
        await this.winnerService.create(createWinnerDto);
        return {
            systemCode: HttpStatus.CREATED,
            message: "당첨 내역이 생성되었습니다."
        };
    }

    @ApiOperation({ summary: '당첨 조회', description: '당첨 아이디로 당첨 정보를 조회합니다.'})
    @Get('/:winnerId')
    async findOne(@Param('winnerId') winnerId: number): Promise<{ systemCode: number, message: string, data: Winner }> {
        const winner: Winner = await this.winnerService.findOne(winnerId);
        return {
            systemCode: HttpStatus.OK,
            message: "당첨 조회에 성공하였습니다.",
            data: winner
        }
    }

    @ApiOperation({ summary: '예약 취소', description: '사용자의 예약 취소를 진행합니다.' })
    @Put('/:winnerId')
    async update(
        @Param('winnerId') winnerId: number,
        @Body() updateWinnerDto: UpdateWinnerDto
    ): Promise<{ systemCode: number, message: string, data: Winner }> {
        const updatedWinner: Winner = await this.winnerService.update(winnerId, updateWinnerDto);
        return {
            systemCode: HttpStatus.OK,
            message: "예약 취소에 성공하였습니다.",
            data: updatedWinner
        };
    }
}
