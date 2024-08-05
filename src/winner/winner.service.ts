import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Winner} from "./entities/winner.entity";
import {Repository} from "typeorm";
import {CreateWinnerDto} from "./dto/create-winner.dto";
import {UpdateWinnerDto} from "./dto/update-winner.dto";

@Injectable()
export class WinnerService {
    constructor(
        @InjectRepository(Winner)
        private winnerRepository: Repository<Winner>,
    ) {}

    async create(createWinnerDto: CreateWinnerDto): Promise<Winner> {
        const newWinner = this.winnerRepository.create(createWinnerDto);
        return await this.winnerRepository.save(newWinner);
    }

    async findOne(winnerId: number): Promise<Winner> {
        const winner = await this.winnerRepository.findOne({
            where: { id: winnerId },
        });

        if (!winner) {
            throw new NotFoundException('당첨 내역을 찾지 못했습니다.');
        }

        return winner;
    }

    async update(winnerId: number, updateWinnerDto: UpdateWinnerDto): Promise<Winner> {
        await this.winnerRepository.update(winnerId, updateWinnerDto);
        return this.findOne(winnerId);
    }
}
