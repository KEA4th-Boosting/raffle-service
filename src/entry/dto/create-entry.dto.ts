import {
    IsInt,
} from 'class-validator';

export class CreateEntryDto {
    @IsInt()
    readonly raffle_id: number;

    @IsInt()
    readonly user_id: number;
}
