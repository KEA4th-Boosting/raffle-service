import {
  IsInt,
  IsNumber,
  IsString,
  IsBoolean,
  IsDate,
  IsOptional,
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
  participant_cnt: number;

  @IsInt()
  winner_cnt: number;

  @IsBoolean()
  raffle_status: boolean;

  @IsInt()
  raffle_waiting_cnt;

  @IsInt()
  @IsOptional()
  current_waiting_number?: number;

  @IsNumber()
  discount_rate: number;

  @IsDate()
  entry_start_date: Date;

  @IsDate()
  entry_end_date: Date;
}
