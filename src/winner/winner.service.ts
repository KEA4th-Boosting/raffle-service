import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Winner} from "./entities/winner.entity";
import {Repository} from "typeorm";

@Injectable()
export class WinnerService {
    constructor(
        @InjectRepository(Winner)
        private winnerRepository: Repository<Winner>,
    ) {}

    async findOne(winnerId: number): Promise<Winner> {
        const winner = await this.winnerRepository.findOne({
            where: { id: winnerId },
        });

        if (!winner) {
            throw new NotFoundException('당첨 내역을 찾지 못했습니다.');
        }

        return winner;
    }
}
