import {
  IsInt,
  IsNumber,
  IsString,
  IsDate,
} from 'class-validator';

export class CreateRaffleDto {
  @IsInt()
  accommodation_id: number;

  @IsInt()
  room_id: number;

  @IsString()
  raffle_name: string;

  @IsDate()
  raffle_date: Date;

  @IsDate()
  check_in: Date;

  @IsDate()
  check_out: Date;

  @IsInt()
  schedule: number;

  @IsInt()
  winner_cnt: number;

  @IsInt()
  raffle_waiting_cnt: number;

  @IsNumber()
  discount_rate: number;

  @IsDate()
  entry_start_date: Date;

  @IsDate()
  entry_end_date: Date;
}
