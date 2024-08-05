import {
    IsInt,
    IsNumber,
    IsDate,
    IsNotEmpty,
    IsEnum,
    IsOptional,
} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

enum CancellationNoShow {
    CANCELLATION = 'cancellation',
    NOSHOW = 'noshow'
}

export class CreateWinnerDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '추첨 아이디', example: '1' })
    readonly raffle_id: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '응모 아이디', example: '1' })
    readonly entry_id: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '사용자 아이디', example: '1' })
    readonly user_id: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '대기 순번', example: '0' })
    readonly waiting_number: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: '혜택 금액', example: '0' })
    readonly benefit_value: number;

    @IsEnum(CancellationNoShow)
    @IsNotEmpty()
    @ApiProperty({ description: '취소노쇼구분', enum: CancellationNoShow, example: 'cancellation' })
    readonly cancellation_noshow_status: CancellationNoShow;

    @IsDate()
    @IsOptional()
    @ApiProperty({ description: '취소노쇼시간', example: '2024-07-31T12:08:24.228Z' })
    readonly cancellation_noshow_time?: Date;
}
