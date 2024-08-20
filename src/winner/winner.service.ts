import {forwardRef, HttpException, HttpStatus, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Winner} from "./entities/winner.entity";
import {Repository} from "typeorm";
import {CreateWinnerDto} from "./dto/create-winner.dto";
import {UpdateWinnerDto} from "./dto/update-winner.dto";
import {RaffleService} from "../raffle/raffle.service";
import {HttpService} from "@nestjs/axios";
import {UserWinnerDto} from "./dto/user-winner.dto";
import {ConfigService} from "@nestjs/config";
import {EntryService} from "../entry/entry.service";
import {lastValueFrom} from "rxjs";
import {ClientKafka} from "@nestjs/microservices";

@Injectable()
export class WinnerService {
    constructor(
        @InjectRepository(Winner)
        private winnerRepository: Repository<Winner>,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        @Inject(forwardRef(() => RaffleService))
        private raffleService: RaffleService,
        @Inject(forwardRef(() => EntryService))
        private entryService: EntryService,
        @Inject('WINNER_PRODUCER') private readonly kafkaProducer: ClientKafka,
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

    async findUserWinners(userId: number): Promise<UserWinnerDto[]>{
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const winners = await this.winnerRepository.find({
            where: { user_id: userId },
            order: { created_date: 'DESC' },
        });

        const productURL = this.configService.get<string>('PRODUCT_SERVICE_URL')
        const results = await Promise.all(winners.map(async winner => {
            const raffle = await this.raffleService.findOne(winner.raffle_id);
            const entry = await this.entryService.findOne(winner.entry_id);
            let roomDetails;
            try {
                const response = await lastValueFrom(
                    this.httpService.get(`${productURL}/product/room/${raffle.room_id}`)
                );
                roomDetails = response.data.data;
            } catch (error) {
                throw new HttpException('방 데이터 조회에 실패하였습니다.', HttpStatus.BAD_REQUEST);
            }
            return {
                id: winner.id,
                raffle_id: winner.raffle_id,
                entry_id: winner.entry_id,
                user_id: winner.user_id,
                benefit_value: winner.benefit_value,
                waiting_number: winner.waiting_number,
                check_in: raffle.check_in,
                check_out: raffle.check_out,
                current_waiting_number: raffle.current_waiting_number,
                entry_date: entry.created_date,
                roomName: roomDetails.roomName,
                roomType: roomDetails.roomType,
                room_area: roomDetails.room_area,
                standardPeople: roomDetails.standardPeople,
                images: (roomDetails.images || []).map(image => ({
                    roomFileId: image.roomFileId,
                    roomId: image.roomId,
                    fileName: image.fileName,
                    filePath: image.filePath,
                })),
            };
        }));
        return results;
    }

    async findOneByEntryId(entryId: number): Promise<Winner | null> {
        const winner = await this.winnerRepository.findOne({
            where: { entry_id: entryId },
        });
        return winner || null;
    }

    async update(winnerId: number, updateWinnerDto: UpdateWinnerDto): Promise<Winner> {
        const currentTime = new Date();
        const updatedWinner = {
            ...updateWinnerDto,
            cancellation_noshow_time: currentTime,
        };

        await this.winnerRepository.update(winnerId, updatedWinner);

        const winner = await this.findOne(winnerId);
        const raffle = await this.raffleService.findOne(winner.raffle_id);
        let updatedWaitingNumber = winner.waiting_number + 1;

        if (updatedWaitingNumber >= raffle.raffle_waiting_cnt) {
            await this.raffleService.update(winner.raffle_id, {current_waiting_number: updatedWaitingNumber})
            const nextWinner = await this.winnerRepository.findOne({
                where: {
                    raffle_id: winner.raffle_id,
                    waiting_number: updatedWaitingNumber,
                }
            });
            if (nextWinner) {
                this.kafkaProducer.emit('winner.cancel', {
                    userId: nextWinner.user_id,
                    raffleId: nextWinner.raffle_id,
                    winnerId: nextWinner.id,
                    message: '순서가 돌아와 예약이 가능합니다.',
                })
                    .subscribe({
                        next: (response) => {
                            console.log('Message sent successfully:', response);
                        },
                        error: (err) => {
                            console.error('Error sending message:', err);
                        }
                    });
            }
        }

        return this.findOne(winnerId);
    }
}
