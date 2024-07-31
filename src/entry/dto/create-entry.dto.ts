import {
    IsInt, IsNotEmpty, Validate,
} from 'class-validator';
import { IsEntryPossible } from "../../raffle/raffle.decorator";

export class CreateEntryDto {
    @IsInt()
    @IsNotEmpty()
    @Validate(IsEntryPossible, {
        message: '응모 가능 기간이 아닙니다.',
    })
    readonly raffle_id: number;

    @IsInt()
    @IsNotEmpty()
    readonly user_id: number;
}
