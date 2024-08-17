import {Body, Controller, Delete, Get, HttpStatus, Param, Post, Put} from '@nestjs/common';
import { Raffle } from './entities/raffle.entity';
import { RaffleService } from './raffle.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {UpdateRaffleDto} from "./dto/update-raffle.dto";
import {Contract} from "ethers";

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

  @ApiOperation({ summary: '전체 추첨 조회', description: '전체 추첨 정보를 조회합니다.'})
  @Get()
  async findAll(): Promise<{ systemCode: number, message: string, data: Raffle[] }> {
    const raffles: Raffle[] = await this.raffleService.findAll();
    return {
      systemCode: HttpStatus.OK,
      message: "추첨 정보 조회에 성공하였습니다.",
      data: raffles
    }
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
    const accommodationIds = Array.from(new Set(ongoingRafflesLatest.map(raffle => raffle.accommodation_id)));
    return {
      systemCode: HttpStatus.OK,
      message: "진행중인 추첨 숙소 최신순 조회에 성공하였습니다.",
      data: accommodationIds,
    };
  }

  @ApiOperation({ summary: '진행중인 추첨 숙소 인기순 조회', description: '진행중인 추첨의 숙소 아이디를 인기순으로 조회합니다.' })
  @Get('/ongoing/popular')
  async findOngoingRafflesPopular(): Promise<{ systemCode: number, message: string, data: number[] }> {
    const ongoingRafflesPopular: Raffle[] = await this.raffleService.findOngoingRafflesPopular();
    const accommodationIds = Array.from(new Set(ongoingRafflesPopular.map(raffle => raffle.accommodation_id)));
    return {
      systemCode: HttpStatus.OK,
      message: "진행중인 추첨 숙소 인기순 조회에 성공하였습니다.",
      data: accommodationIds,
    };
  }

  /*
  @ApiOperation({ summary: '컨트랙트 조회', description: '컨트랙트에 기록된 정보들을 조회합니다.'})
  @Get('/contract/:raffleId')
  async getContract(@Param('raffleId') raffleId: number): Promise<{ systemCode: number, message: string, data: number[] } {
    const contract: Contract = await this.raffleService.findOne(raffleId);
    return await this.raffleService.getContract(raffleId);
  }
  */

  @ApiOperation({ summary: '추첨 수정', description: '추첨의 정보를 수정합니다.' })
  @Put('/:raffleId')
  async update(
      @Param('raffleId') raffleId: number,
      @Body() updateRaffleDto: UpdateRaffleDto,
  ): Promise<{ systemCode: number, message: string, data: Raffle }> {
    const updatedRaffle: Raffle = await this.raffleService.update(raffleId, updateRaffleDto);
    return {
      systemCode: HttpStatus.OK,
      message: "추첨 정보 수정에 성공하였습니다.",
      data: updatedRaffle
    };
  }

  @ApiOperation({ summary: '추첨 삭제', description: '추첨을 삭제합니다.' })
  @Delete('/:raffleId')
  async remove(@Param('raffleId') raffleId: number): Promise<{ systemCode: number, message: string }> {
    await this.raffleService.remove(raffleId);
    return {
      systemCode: HttpStatus.OK,
      message: "추첨 삭제에 성공하였습니다.",
    };
  }
}
