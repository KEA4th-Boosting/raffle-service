import {
  IsInt,
  IsNumber,
  IsString,
  IsDate, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import {ApiProperty} from "@nestjs/swagger";

export class CreateRaffleDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: '숙소 아이디', example: '1' })
  readonly accommodation_id: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: '방 아이디', example: '1' })
  readonly room_id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '추첨 이름', example: '6월 3주차 신라스테이 여수 스탠다드 더블 추첨' })
  readonly raffle_name: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ description: '추첨 일자', example: '2024-07-31T12:08:24.228Z' })
  readonly raffle_date: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ description: '체크인 날짜', example: '2024-07-31T12:08:24.228Z' })
  readonly check_in: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ description: '체크아웃 날짜', example: '2024-07-31T12:08:24.228Z' })
  readonly check_out: Date;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: '숙소 일정', example: '3' })
  readonly schedule: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: '추첨 당첨인원수', example: '5' })
  readonly winner_cnt: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: '추첨 대기자 수', example: '2' })
  readonly raffle_waiting_cnt: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '할인율', example: '35.5' })
  readonly discount_rate: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '컨트랙트 주소', example: '0x1234567890abcdef1234567890abcdef12345678' })
  readonly contract_address: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ description: '응모 시작 시간', example: '2024-07-31T12:08:24.228Z' })
  readonly entry_start_date: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ description: '응모 마감 시간', example: '2024-07-31T12:08:24.228Z' })
  readonly entry_end_date: Date;
}
