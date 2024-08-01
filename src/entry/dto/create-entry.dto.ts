import {
    IsInt, IsNotEmpty, IsNumber,
} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class CreateEntryDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '추첨 아이디', example: '1' })
    readonly raffle_id: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '유저 아이디', example: '1' })
    readonly user_id: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: '사용자 추첨 지수', example: '102.5' })
    readonly raffle_index: number;
}
