import {Body, Controller, Get, HttpStatus, Param, Post, Put} from '@nestjs/common';
import { Raffle } from './entities/raffle.entity';
import { RaffleService } from './raffle.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {Entry} from "../entry/entities/entry.entity";

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

  @ApiOperation({ summary: '추첨 정보 조회', description: '추첨 아이디로 추첨 정보를 조회합니다.'})
  @Get('/:raffleId')
  async findOne(@Param('raffleId') raffleId: number): Promise<{ systemCode: number, message: string, data: Raffle }> {
    const raffle: Raffle = await this.raffleService.findOne(raffleId);
    return {
      systemCode: HttpStatus.OK,
      message: "추첨 정보 조회에 성공하였습니다.",
      data: raffle
    }
  }

  @ApiOperation({ summary: '진행중인 추첨 숙소 최신순 조회', description: '진행중인 추첨의 숙소 아이디를 최신순으로 조회합니다.' })
  @Get('/ongoing/latest')
  async findOngoingRafflesLatest(): Promise<{ systemCode: number, message: string, data: number[] }> {
    const ongoingRafflesLatest: Raffle[] = await this.raffleService.findOngoingRafflesLatest();
    const accommodationIds = ongoingRafflesLatest.map(raffle => raffle.accommodation_id);
    return {
      systemCode: HttpStatus.OK,
      message: "진행중인 추첨 숙소 최신순 조회에 성공하였습니다.",
      data: accommodationIds,
    };
  }

  @ApiOperation({ summary: '진행중인 추첨 숙소 인기순 조회', description: '진행중인 추첨의 숙소 아이디를 인기순으로 조회합니다.' })
  @Get('/ongoing/popular')
  async findOngoingRafflesPopular(): Promise<{ systemCode: number, message: string, data: number[] }> {
    const ongoingRafflesPopular: Raffle[] = await this.raffleService.findOngoingRafflesPopular);
    const accommodationIds = ongoingRafflesPopular.map(raffle => raffle.accommodation_id);
    return {
      systemCode: HttpStatus.OK,
      message: "진행중인 추첨 숙소 인기순 조회에 성공하였습니다.",
      data: accommodationIds,
    };
  }



  /*
  @Put()
  async raffle(@Body() raffleRaffleDto: RaffleRaffleDto): Promise<Raffle> {
    return await this.raffleService.raffle(raffleRaffleDto);
  }
   */
}
