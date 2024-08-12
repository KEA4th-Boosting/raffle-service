import {forwardRef, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Winner} from "./entities/winner.entity";
import {Repository} from "typeorm";
import {CreateWinnerDto} from "./dto/create-winner.dto";
import {UpdateWinnerDto} from "./dto/update-winner.dto";
import {RaffleService} from "../raffle/raffle.service";

@Injectable()
export class WinnerService {
    constructor(
        @InjectRepository(Winner)
        private winnerRepository: Repository<Winner>,
        @Inject(forwardRef(() => RaffleService))
        private raffleService: RaffleService,
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

    async getWinners(raffleId: number): Promise<Winner[]> {
        const winners = await this.winnerRepository.find({ where: { raffle_id: raffleId } });
        if (winners.length === 0) {
            throw new NotFoundException('해당 추첨에 당첨된 응모가 없습니다.');
        }
        return winners;
    }

    async update(winnerId: number, updateWinnerDto: UpdateWinnerDto): Promise<Winner> {
        const currentTime = new Date();
        const updatedWinner = {
            ...updateWinnerDto,
            cancellation_noshow_time: currentTime,
        };

        await this.winnerRepository.update(winnerId, updatedWinner);

        const winner = await this.findOne(winnerId);
        let updatedWaitingNumber = 1;
        if (winner.waiting_number !== null && winner.waiting_number >= 1) {
            updatedWaitingNumber = winner.waiting_number + 1;
        }

        await this.raffleService.update(winner.raffle_id, { current_waiting_number: updatedWaitingNumber })
        return this.findOne(winnerId);
    }
}
