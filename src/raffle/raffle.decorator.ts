import {registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { Raffle } from "./entities/raffle.entity";
import { Repository } from "typeorm";

@ValidatorConstraint({ async: true })
export class IsEntryPossibleDate implements ValidatorConstraintInterface {
    constructor(
        @InjectRepository(Raffle)
        private raffleRepository: Repository<Raffle>,
    ) {}

    async validate(raffleId: number): Promise<boolean> {
        const raffle = await this.raffleRepository.findOne({ where: { id: raffleId } });

        if (!raffle) {
            return false;
        }

        const currentDate = new Date();
        return currentDate <= raffle.entry_end_date;
    }

    defaultMessage(): string {
        return '응모 기간이 종료되었습니다.';
    }
}

export function IsEntryPossible(validationOptions?: ValidationOptions ) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isEntryPossible',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsEntryPossibleDate,
        });
    };
}