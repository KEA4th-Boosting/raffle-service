import {Controller, Get, HttpStatus, Param} from '@nestjs/common';
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {WinnerService} from "./winner.service";
import {Winner} from "./entities/winner.entity";

@ApiTags('winner')
@Controller('winner')
export class WinnerController {
    constructor(private winnerService: WinnerService) {}

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
}
