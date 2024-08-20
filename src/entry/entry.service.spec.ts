import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {DeleteResult, Repository} from 'typeorm';
import { EntryService } from './entry.service';
import { Entry } from './entities/entry.entity';
import { RaffleService } from '../raffle/raffle.service';
import { WinnerService } from '../winner/winner.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { CancellationNoShow } from '../winner/dto/update-winner.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import {AxiosResponse} from "@nestjs/terminus/dist/health-indicator/http/axios.interfaces";

describe('EntryService', () => {
  let service: EntryService;
  let entryRepository: jest.Mocked<Repository<Entry>>;
  let raffleService: jest.Mocked<RaffleService>;
  let winnerService: jest.Mocked<WinnerService>;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    entryRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<Entry>>;

    raffleService = {
      isRaffleOngoing: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      enterRaffle: jest.fn(),
    } as unknown as jest.Mocked<RaffleService>;

    winnerService = {
      findOneByEntryId: jest.fn(),
    } as unknown as jest.Mocked<WinnerService>;

    httpService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntryService,
        {provide: getRepositoryToken(Entry), useValue: entryRepository},
        {provide: RaffleService, useValue: raffleService},
        {provide: WinnerService, useValue: winnerService},
        {provide: ConfigService, useValue: configService},
        {provide: HttpService, useValue: httpService},
      ],
    }).compile();

    service = module.get<EntryService>(EntryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new entry and update raffle participants count', async () => {
      const createEntryDto: CreateEntryDto = {raffle_id: 1, user_id: 1, raffle_index: 1};
      const existingEntry = null;
      const raffle = {id: 1, participant_cnt: 1} as any;
      const newEntry = {id: 1, ...createEntryDto} as Entry;

      entryRepository.findOne.mockResolvedValue(existingEntry);
      entryRepository.create.mockReturnValue(newEntry);
      entryRepository.save.mockResolvedValue(newEntry);
      raffleService.isRaffleOngoing.mockResolvedValue(true);
      raffleService.findOne.mockResolvedValue(raffle);
      raffleService.update.mockResolvedValue({...raffle, participant_cnt: 2}); // Return updated raffle
      raffleService.enterRaffle.mockResolvedValue({});

      const result = await service.create(createEntryDto);

      expect(result).toEqual({});
      expect(entryRepository.save).toHaveBeenCalledWith(newEntry);
      expect(raffleService.update).toHaveBeenCalledWith(1, {participant_cnt: 2});
    });

    it('should throw an error if raffle is not ongoing', async () => {
      const createEntryDto: CreateEntryDto = {raffle_id: 1, user_id: 1, raffle_index: 1};

      raffleService.isRaffleOngoing.mockResolvedValue(false);

      await expect(service.create(createEntryDto)).rejects.toThrow('추첨이 진행중이지 않습니다.');
    });

    it('should throw an error if entry already exists', async () => {
      const createEntryDto: CreateEntryDto = {raffle_id: 1, user_id: 1, raffle_index: 1};
      const existingEntry = {id: 1} as Entry;

      entryRepository.findOne.mockResolvedValue(existingEntry);

      await expect(service.create(createEntryDto)).rejects.toThrow('해당 추첨에 이미 응모하였습니다.');
    });
  });

  describe('findOne', () => {
    it('should return an entry by id', async () => {
      const entryId = 1;
      const entry = {id: entryId} as Entry;

      entryRepository.findOne.mockResolvedValue(entry);

      const result = await service.findOne(entryId);

      expect(result).toBe(entry);
    });
  });

  describe('findUserEntries', () => {
    it('should return user entries with additional data', async () => {
      const userId = 1;
      const entries = [{id: 1, raffle_id: 1, user_id: userId}] as Entry[];
      const raffle = {id: 1, room_id: 1, check_in: new Date(), check_out: new Date(), raffle_date: new Date()} as any;
      const winner = {waiting_number: 1, cancellation_noshow_status: CancellationNoShow.NOSHOW} as any;
      const roomDetails: AxiosResponse<{
        data: {
          roomName: string;
          roomType: string;
          room_area: string;
          standardPeople: number;
          images: { roomFileId: number; roomId: number; fileName: string; filePath: string; }[];
        }
      }> = {
        data: {
          data: {
            roomName: 'Room 1',
            roomType: 'Type 1',
            room_area: 'Area 1',
            standardPeople: 2,
            images: [{roomFileId: 1, roomId: 1, fileName: 'file.jpg', filePath: 'path/to/file'}],
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };

      entryRepository.find.mockResolvedValue(entries);
      raffleService.findOne.mockResolvedValue(raffle);
      winnerService.findOneByEntryId.mockResolvedValue(winner);
      httpService.get.mockReturnValue(of(roomDetails));

      const result = await service.findUserEntries(userId);

      expect(result).toEqual([{
        id: 1,
        raffle_id: 1,
        user_id: userId,
        check_in: raffle.check_in,
        check_out: raffle.check_out,
        raffle_date: raffle.raffle_date,
        waiting_number: winner.waiting_number,
        cancellation_noshow_status: winner.cancellation_noshow_status,
        roomName: roomDetails.data.data.roomName,
        roomType: roomDetails.data.data.roomType,
        room_area: roomDetails.data.data.room_area,
        standardPeople: roomDetails.data.data.standardPeople,
        images: roomDetails.data.data.images,
      }]);
    });

    it('should throw an error if fetching room details fails', async () => {
      const userId = 1;
      const entries = [{id: 1, raffle_id: 1, user_id: userId}] as Entry[];
      const raffle = {id: 1, room_id: 1} as any;

      entryRepository.find.mockResolvedValue(entries);
      raffleService.findOne.mockResolvedValue(raffle);
      winnerService.findOneByEntryId.mockResolvedValue(null);
      httpService.get.mockReturnValue(throwError(() => new Error('Network Error')));

      await expect(service.findUserEntries(userId)).rejects.toThrow('방 데이터 조회에 실패하였습니다.');
    });
  });

  describe('getCompetition', () => {
    it('should return the competition percentage for a user', async () => {
      const raffleId = 1;
      const userId = 1;
      const entries = [{raffle_index: 10, user_id: userId}] as Entry[];
      const totalRaffleIndex = 20;

      entryRepository.find.mockResolvedValue(entries);

      const result = await service.getCompetition(raffleId, userId);

      expect(result).toBe(50);
    });

    it('should throw an error if user has not entered the raffle', async () => {
      const raffleId = 1;
      const userId = 1;

      entryRepository.find.mockResolvedValue([]);

      await expect(service.getCompetition(raffleId, userId)).rejects.toThrow('유저가 해당 추첨에 응모한 내역이 없습니다.');
    });
  });

  describe('remove', () => {
    it('should delete an entry and return the id', async () => {
      const entryId = 1;

      const deleteResult: DeleteResult = {
        affected: 1,
        raw: [],
      };

      entryRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.remove(entryId);

      expect(result).toBe(entryId);
      expect(entryRepository.delete).toHaveBeenCalledWith(entryId);
    });
  });
});
