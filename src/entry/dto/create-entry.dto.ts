import {
    IsInt, IsNotEmpty,
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
}
