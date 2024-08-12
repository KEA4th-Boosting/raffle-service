import {forwardRef, HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

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
        @Inject(forwardRef(() => RaffleService))
        private raffleService: RaffleService,
        private winnerService: WinnerService,
    ) {}

    async create(createEntryDto: CreateEntryDto): Promise<Entry> {
        const { raffle_id } = createEntryDto;

        const isOngoing = await this.raffleService.isRaffleOngoing(raffle_id);
        if (!isOngoing) {
            throw new Error('추첨이 진행중이지 않습니다.');
        }

        const newEntry = this.entryRepository.create(createEntryDto);
        await this.entryRepository.save(newEntry);

        const enterRaffleDto: EnterRaffleDto = {
            raffle_id: createEntryDto.raffle_id,
            entry_id: newEntry.id,
            raffle_index: createEntryDto.raffle_index,
        }
        return await this.raffleService.enterRaffle(enterRaffleDto);
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
                    this.httpService.get(`${productURL}/room/${raffle.accommodation_id}/${raffle.room_id}`)
                );
                roomDetails = response.data;
            } catch (error) {
                throw new HttpException('Unable to fetch room details', HttpStatus.BAD_REQUEST);
            }
            return {
                id: entry.id,
                raffle_id: entry.raffle_id,
                user_id: entry.user_id,
                check_in: raffle.check_in,
                check_out: raffle.check_out,
                raffle_date: raffle.raffle_date,
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

    async remove(entryId: number): Promise<number> {
        await this.entryRepository.delete(entryId);
        return entryId;
    }
}
