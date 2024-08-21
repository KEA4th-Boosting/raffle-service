import {forwardRef, HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import {DataSource, Repository} from 'typeorm';

import { Entry } from "./entities/entry.entity";
import { CreateEntryDto } from "./dto/create-entry.dto";
import {RaffleService} from "../raffle/raffle.service";
import {EnterRaffleDto} from "../raffle/dto/enter-raffle.dto";
import {WinnerService} from "../winner/winner.service";
import {UserEntryDto} from "./dto/user-entry.dto";
import {ConfigService} from "@nestjs/config";
import {lastValueFrom} from "rxjs";
import {HttpService} from "@nestjs/axios";
import {CancellationNoShow} from "../winner/dto/update-winner.dto";

@Injectable()
export class EntryService {
    constructor(
        @InjectRepository(Entry)
        private entryRepository: Repository<Entry>,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly dataSource: DataSource,
        @Inject(forwardRef(() => RaffleService))
        private raffleService: RaffleService,
        @Inject(forwardRef(() => WinnerService))
        private winnerService: WinnerService,
    ) {}

    async create(createEntryDto: CreateEntryDto): Promise<Entry> {
        const { raffle_id, user_id, raffle_index } = createEntryDto;

        return await this.dataSource.transaction(async manager => {
            const isOngoing = await this.raffleService.isRaffleOngoing(raffle_id);
            if (!isOngoing) {
                throw new Error('추첨이 진행중이지 않습니다.');
            }

            const existingEntry = await this.entryRepository.findOne({
                where: { raffle_id, user_id },
            });
            if (existingEntry) {
                throw new Error('해당 추첨에 이미 응모하였습니다.');
            }

            if (raffle_index <= 0) {
                throw new Error('추첨 지수는 0보다 커야 합니다.');
            }

            const newEntry = this.entryRepository.create(createEntryDto);
            await manager.save(newEntry);

            const enterRaffleDto: EnterRaffleDto = {
                raffle_id: createEntryDto.raffle_id,
                entry_id: newEntry.id,
                raffle_index: createEntryDto.raffle_index,
                entry_time: Math.floor(newEntry.created_date.getTime() / 1000)
            };

            const tx = await this.raffleService.enterRaffle(enterRaffleDto);

            const raffle = await this.raffleService.findOne(raffle_id);
            const updateRaffleDto = { participant_cnt: raffle.participant_cnt + 1 };
            await this.raffleService.update(raffle_id, updateRaffleDto);

            return newEntry;
        });
    }

    async findOne(entryId: number): Promise<Entry> {
        return await this.entryRepository.findOne({
            where: {
                id: entryId,
            },
        });
    }

    async findUserEntries(userId: number): Promise<UserEntryDto[]>{
        const entries = await this.entryRepository.find({
            where: { user_id: userId },
            order: { created_date: 'DESC' },
        });

        const productURL = this.configService.get<string>('PRODUCT_SERVICE_URL')
        const results = await Promise.all(entries.map(async entry => {
            const raffle = await this.raffleService.findOne(entry.raffle_id);
            const winner = await this.winnerService.findOneByEntryId(entry.id);
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
                id: entry.id,
                raffle_id: entry.raffle_id,
                user_id: entry.user_id,
                check_in: raffle.check_in,
                check_out: raffle.check_out,
                raffle_date: raffle.raffle_date,
                current_waiting_number: raffle.current_waiting_number,
                waiting_number: winner?.waiting_number ?? null,
                cancellation_noshow_status: winner?.cancellation_noshow_status as CancellationNoShow ?? null,
                roomName: roomDetails.roomName,
                roomType: roomDetails.roomType,
                room_area: roomDetails.room_area,
                standardPeople: roomDetails.standardPeople,
                images: roomDetails.images.map(image => ({
                    roomFileId: image.roomFileId,
                    roomId: image.roomId,
                    fileName: image.fileName,
                    filePath: image.filePath,
                })),
            };
        }));
        return results;
    }

    async getCompetition(raffleId: number, userId: number): Promise<number> {
        const entries:Entry[] = await this.entryRepository.find({ where: { raffle_id: raffleId } });
        const totalRaffleIndex:number = entries.reduce((sum, entry) => sum + entry.raffle_index, 0);
        const userEntry:Entry = entries.find(entry => Number(entry.user_id) === userId);
        if (!userEntry) {
            throw new Error('유저가 해당 추첨에 응모한 내역이 없습니다.');
        }

        return (userEntry.raffle_index / totalRaffleIndex) * 100;
    }

    async remove(entryId: number): Promise<number> {
        await this.entryRepository.delete(entryId);
        return entryId;
    }
}
