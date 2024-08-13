import { PartialType } from '@nestjs/mapped-types';
import {CreateRaffleDto} from "./create-raffle.dto";
import {ApiProperty} from "@nestjs/swagger";
import {IsInt, IsOptional} from "class-validator";

export class UpdateRaffleDto extends PartialType(CreateRaffleDto) {
    @IsInt()
    @IsOptional()
    @ApiProperty({ description: '현재 대기 순번', example: 0 })
    readonly current_waiting_number?: number;

    @IsInt()
    @IsOptional()
    @ApiProperty({ description: '추첨 인원수', example: 0 })
    readonly participant_cnt?: number;
}