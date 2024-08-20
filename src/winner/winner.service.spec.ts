import { Test, TestingModule } from '@nestjs/testing';
import { WinnerService } from './winner.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Winner } from './entities/winner.entity';
import { Repository } from 'typeorm';
import { RaffleService } from '../raffle/raffle.service';
import { EntryService } from '../entry/entry.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { mock, MockProxy } from 'jest-mock-extended';
import {HttpException, HttpStatus, NotFoundException} from '@nestjs/common';
import {lastValueFrom, of, throwError} from 'rxjs';
import {Raffle} from "../raffle/entities/raffle.entity";
import {Entry} from "../entry/entities/entry.entity";
import {AxiosResponse} from "@nestjs/terminus/dist/health-indicator/http/axios.interfaces";
import {CancellationNoShow} from "./dto/update-winner.dto";

describe('WinnerService', () => {
  let service: WinnerService;
  let winnerRepository: MockProxy<Repository<Winner>>;
  let raffleService: MockProxy<RaffleService>;
  let entryService: MockProxy<EntryService>;
  let httpService: MockProxy<HttpService>;
  let configService: MockProxy<ConfigService>;

  beforeEach(async () => {
    winnerRepository = mock<Repository<Winner>>();
    raffleService = mock<RaffleService>();
    entryService = mock<EntryService>();
    httpService = mock<HttpService>();
    configService = mock<ConfigService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WinnerService,
        { provide: getRepositoryToken(Winner), useValue: winnerRepository },
        { provide: RaffleService, useValue: raffleService },
        { provide: EntryService, useValue: entryService },
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<WinnerService>(WinnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a winner', async () => {
      const createWinnerDto = { raffle_id: 1, entry_id: 1, user_id: 1, benefit_value: 100, waiting_number: 0 };
      const result: Winner = {
        id: 1,
        raffle_id: 1,
        entry_id: 1,
        user_id: 1,
        waiting_number: 1,
        benefit_value: 100,
        cancellation_noshow_status: null,
        cancellation_noshow_time: null,
        created_date: new Date(),
        updated_date: new Date(),
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      };

      winnerRepository.create.mockReturnValue(result);
      winnerRepository.save.mockResolvedValue(result);

      const winner = await service.create(createWinnerDto);

      expect(winner).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a winner', async () => {
      const winnerId = 1;
      const result: Winner = {
        id: winnerId,
        raffle_id: 1,
        entry_id: 1,
        user_id: 1,
        waiting_number: 1,
        benefit_value: 100,
        cancellation_noshow_status: null,
        cancellation_noshow_time: null,
        created_date: new Date(),
        updated_date: new Date(),
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      };
      winnerRepository.findOne.mockResolvedValue(result);

      const winner = await service.findOne(winnerId);

      expect(winner).toEqual(result);
    });

    it('should throw NotFoundException if winner does not exist', async () => {
      const winnerId = 1;
      winnerRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(winnerId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWinners', () => {
    it('should return winners for a raffle', async () => {
      const raffleId = 1;
      const results: Winner[] = [
        {
          id: 1,
          raffle_id: raffleId,
          entry_id: 1,
          user_id: 1,
          waiting_number: 1,
          benefit_value: 100,
          cancellation_noshow_status: null,
          cancellation_noshow_time: null,
          created_date: new Date(),
          updated_date: new Date(),
          setUpdatedDateBeforeInsert: jest.fn(),
          setUpdatedDateBeforeUpdate: jest.fn(),
        }
      ];
      winnerRepository.find.mockResolvedValue(results);

      const winners = await service.getWinners(raffleId);

      expect(winners).toEqual(results);
    });

    it('should throw NotFoundException if no winners found', async () => {
      const raffleId = 1;
      winnerRepository.find.mockResolvedValue([]);

      await expect(service.getWinners(raffleId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserWinners', () => {
    it('should return user winners with room details', async () => {
      const userId = 1;
      const winners = [{
        id: 1,
        raffle_id: 1,
        entry_id: 1,
        user_id: userId,
        benefit_value: 100,
        waiting_number: 1,
        cancellation_noshow_status: null,
        cancellation_noshow_time: null,
        created_date: new Date(),
        updated_date: new Date(),
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      }];
      const raffle: Raffle = {
        id: 1,
        check_in: new Date(),
        check_out: new Date(),
        accommodation_id: 1,
        room_id: 1,
        raffle_name: 'Sample Raffle',
        raffle_date: new Date(),
        created_date: new Date(),
        updated_date: new Date(),
        schedule: 2,
        participant_cnt: 5,
        winner_cnt: 1,
        raffle_status: false,
        raffle_waiting_cnt: 1,
        current_waiting_number: 0,
        discount_rate: 35.5,
        entry_start_date: new Date(),
        entry_end_date: new Date(),
        contract_address: '0x49C94e13B124164012987bc1F264E707CB63291E',
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      };
      const entry: Entry = {
        id: 1,
        raffle_id: 1,
        user_id: 1,
        raffle_index: 1,
        created_date: new Date(),
        updated_date: new Date(),
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      };
      const roomDetails = {
        roomName: '디럭스',
        roomType: '스위트',
        room_area: 50,
        standardPeople: 2,
        images: []
      };
      const axiosResponse: AxiosResponse = {
        data: { data: roomDetails },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      winnerRepository.find.mockResolvedValue(winners);
      raffleService.findOne.mockResolvedValue(raffle);
      entryService.findOne.mockResolvedValue(entry);
      httpService.get.mockReturnValue(of(axiosResponse));

      const results = await service.findUserWinners(userId);

      expect(results).toEqual([{
        id: 1,
        raffle_id: 1,
        entry_id: 1,
        user_id: userId,
        benefit_value: 100,
        check_in: raffle.check_in,
        check_out: raffle.check_out,
        entry_date: entry.created_date,
        roomName: roomDetails.roomName,
        roomType: roomDetails.roomType,
        room_area: roomDetails.room_area,
        standardPeople: roomDetails.standardPeople,
        images: roomDetails.images,
      }]);
    });

    it('should throw HttpException if room data retrieval fails', async () => {
      const userId = 1;
      const winners: Winner[] = [{
        id: 1,
        raffle_id: 1,
        entry_id: 1,
        user_id: userId,
        benefit_value: 100,
        waiting_number: 1,
        cancellation_noshow_status: null,
        cancellation_noshow_time: null,
        created_date: new Date(),
        updated_date: new Date(),
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      }];
      const raffle: Raffle = {
        id: 1,
        check_in: new Date(),
        check_out: new Date(),
        accommodation_id: 1,
        room_id: 1,
        raffle_name: 'Sample Raffle',
        raffle_date: new Date(),
        created_date: new Date(),
        updated_date: new Date(),
        schedule: 2,
        participant_cnt: 5,
        winner_cnt: 1,
        raffle_status: false,
        raffle_waiting_cnt: 1,
        current_waiting_number: 0,
        discount_rate: 35.5,
        entry_start_date: new Date(),
        entry_end_date: new Date(),
        contract_address: '0x49C94e13B124164012987bc1F264E707CB63291E',
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      };
      const entry: Entry = {
        id: 1,
        raffle_id: 1,
        user_id: 1,
        raffle_index: 1,
        created_date: new Date(),
        updated_date: new Date(),
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      };
      raffleService.findOne.mockResolvedValue(raffle);
      entryService.findOne.mockResolvedValue(entry);
      httpService.get.mockReturnValue(throwError(() => new Error('Failed to fetch')));

      await expect(service.findUserWinners(userId)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update and return a winner', async () => {
      const winnerId = 1;
      const updateWinnerDto = { cancellation_noshow_status: CancellationNoShow.CANCELLATION };
      const currentTime = new Date();
      const existingWinner: Winner = {
        id: winnerId,
        raffle_id: 1,
        entry_id: 1,
        user_id: 1,
        waiting_number: 1,
        benefit_value: 100,
        cancellation_noshow_status: null,
        cancellation_noshow_time: null,
        created_date: new Date(),
        updated_date: new Date(),
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      };
      const updatedWinner: Winner = {
        ...existingWinner,
        ...updateWinnerDto,
        cancellation_noshow_time: currentTime,
        updated_date: currentTime,
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      };

      winnerRepository.update.mockResolvedValue(undefined);
      winnerRepository.findOne.mockResolvedValue(existingWinner);
      winnerRepository.findOne.mockResolvedValue(updatedWinner);

      const result = await service.update(winnerId, updateWinnerDto);

      expect(result).toEqual(updatedWinner);
    });
  });
});
