import {
    IsNotEmpty,
    IsEnum,
} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export enum CancellationNoShow {
    CANCELLATION = 'cancellation',
    NOSHOW = 'noshow'
}

export class UpdateWinnerDto {
    @IsEnum(CancellationNoShow)
    @IsNotEmpty()
    @ApiProperty({description: '취소 노쇼 여부', example: CancellationNoShow.CANCELLATION})
    readonly cancellation_noshow_status: CancellationNoShow;
}