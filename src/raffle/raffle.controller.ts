import {Body, Controller, HttpStatus, Post, Put} from '@nestjs/common';
import { Raffle } from './entities/raffle.entity';
import { RaffleService } from './raffle.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import {ApiOperation, ApiTags} from "@nestjs/swagger";

@ApiTags('raffle')
@Controller('raffle')
export class RaffleController {
  constructor(private raffleService: RaffleService) {}

  @ApiOperation({ summary: '추첨 생성', description: '새로운 숙소의 추첨을 생성합니다.'})
  @Post()
  async create(@Body() createRaffleDto: CreateRaffleDto): Promise<{ systemCode: number, message: string }> {
    await this.raffleService.create(createRaffleDto);
    return {
      systemCode: HttpStatus.CREATED,
      message: "추첨이 생성되었습니다."
    };
  }

  /*
  @Put()
  async raffle(@Body() raffleRaffleDto: RaffleRaffleDto): Promise<Raffle> {
    return await this.raffleService.raffle(raffleRaffleDto);
  }
   */
}
