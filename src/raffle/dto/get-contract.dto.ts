import {
    IsInt,
    IsNumber,
    IsString,
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {ApiProperty} from "@nestjs/swagger";

class Transaction {
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '응모 아이디', example: 1 })
    entry_id: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '유저 이름', example: '홍길동' })
    user_name: string;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '응모 추첨 지수', example: 50 })
    raffle_index: number;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    @ApiProperty({ description: '응모 생성 시간', example: '2024-07-31T12:08:24.228' })
    entry_time: Date;
}

export class GetContractDto {
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    @ApiProperty({ description: '추첨 일자', example: '2024-07-31T12:08:24.228' })
    raffle_date: Date;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '컨트랙트 주소', example: '0x1234567890abcdef1234567890abcdef12345678' })
    contract_address: string;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '추첨 당첨인원수', example: '5' })
    winner_cnt: number;

    @IsInt()
    @IsNotEmpty()
    @ApiProperty({ description: '추첨 대기자 수', example: '2' })
    raffle_waiting_cnt: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ description: '응모자 평균 추첨 지수', example: '105.5' })
    average_index?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ description: '당첨자 평균 추첨 지수', example: '105.5' })
    winner_average_index?: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ description: '대기자 평균 추첨 지수', example: '105.5' })
    waiting_average_index?: number;

    @IsInt()
    @IsOptional()
    @ApiProperty({ description: '최고 추첨 지수', example: '105' })
    max_index?: number;

    @IsInt()
    @IsOptional()
    @ApiProperty({ description: '최저 추첨 지수', example: '105' })
    min_index?: number;

    @IsInt({ each: true })
    @IsArray()
    @IsOptional()
    @ApiProperty({ description: '당첨자 목록', example: [1, 2] })
    winners?: number[];

    @IsInt({ each: true })
    @IsArray()
    @IsOptional()
    @ApiProperty({ description: '대기자 목록', example: [1, 2] })
    waiting_list?: number[];

    @ValidateNested({ each: true })
    @Type(() => Transaction)
    @IsArray()
    @IsOptional()
    @ApiProperty({ description: '응모 내역', type: [Transaction] })
    entries?: Transaction[];
}
