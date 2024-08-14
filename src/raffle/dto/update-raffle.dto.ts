import { PartialType } from '@nestjs/mapped-types';
import {CreateRaffleDto} from "./create-raffle.dto";
import {ApiProperty} from "@nestjs/swagger";
import {IsInt, IsOptional, IsString} from "class-validator";

export class UpdateRaffleDto extends PartialType(CreateRaffleDto) {
    @IsInt()
    @IsOptional()
    @ApiProperty({ description: '현재 대기 순번', example: 0 })
    readonly current_waiting_number?: number;

    @IsInt()
    @IsOptional()
    @ApiProperty({ description: '추첨 인원수', example: 0 })
    readonly participant_cnt?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: '컨트랙트 주소', example: '0x1234567890abcdef1234567890abcdef12345678' })
    contract_address?: string;
}