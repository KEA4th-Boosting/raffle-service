import {
    IsArray,
    IsDate, IsEnum,
    IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested,
} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";
import {CancellationNoShow} from "../../winner/dto/update-winner.dto";

class ImageDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '방 파일 ID', example: 4 })
    readonly roomFileId: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '방 ID', example: 6 })
    readonly roomId: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '파일 이름', example: 'e4d35605-9071-4bc6-b96c-58b6e7d1f196.jpg' })
    readonly fileName: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '파일 경로', example: '/images/e4d35605-9071-4bc6-b96c-58b6e7d1f196.jpg' })
    readonly filePath: string;
}

export class UserEntryDto {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '응모 아이디', example: '1' })
    readonly id: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '추첨 아이디', example: '1' })
    readonly raffle_id: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '유저 아이디', example: '1' })
    readonly user_id: number;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    @ApiProperty({ description: '체크인 날짜', example: '2024-07-31' })
    check_in: Date;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    @ApiProperty({ description: '체크아웃 날짜', example: '2024-07-31' })
    check_out: Date;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    @ApiProperty({ description: '추첨 일자', example: '2024-07-31T12:08:24.228Z' })
    raffle_date: Date;

    @IsInt()
    @IsOptional()
    @ApiProperty({ description: '대기 순번', example: 0 })
    readonly waiting_number?: number;

    @IsEnum(CancellationNoShow)
    @IsOptional()
    @ApiProperty({ description: '취소노쇼구분', example: CancellationNoShow.CANCELLATION })
    readonly cancellation_noshow_status?: CancellationNoShow;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '방 이름', example: 'string11111' })
    readonly roomName: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '방 종류', example: 'Single' })
    readonly roomType: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ description: '방 면적', example: 25 })
    readonly room_area: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '기준 인원 수', example: 0 })
    readonly standardPeople: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageDto)
    @IsOptional()
    @ApiProperty({
        description: '방 이미지 리스트',
        type: [ImageDto],
    })
    readonly images: ImageDto[];
}
