import {
    IsInt,
    IsNumber,
    IsNotEmpty, IsDate,
} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";

export class EnterRaffleDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({description: '추첨 아이디', example: '1'})
    readonly raffle_id: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({description: '응모 아이디', example: '1'})
    readonly entry_id: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: '사용자 추첨 지수', example: '100.5' })
    readonly raffle_index: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: '응모 시간' })
    entry_time: number;
}