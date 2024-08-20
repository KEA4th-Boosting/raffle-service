import { Test, TestingModule } from '@nestjs/testing';
import { EntryController } from './entry.controller';
import { EntryService } from './entry.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UserEntryDto } from './dto/user-entry.dto';
import { Entry } from './entities/entry.entity';
import { HttpStatus } from '@nestjs/common';
import { mock, MockProxy } from 'jest-mock-extended';

describe('EntryController', () => {
  let controller: EntryController;
  let entryService: MockProxy<EntryService>;

  beforeEach(async () => {
    entryService = mock<EntryService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryController],
      providers: [
        { provide: EntryService, useValue: entryService },
      ],
    }).compile();

    controller = module.get<EntryController>(EntryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an entry and return success response', async () => {
      const createEntryDto: CreateEntryDto = { raffle_id: 1, user_id: 1, raffle_index: 1 };
      entryService.create.mockResolvedValue(undefined);

      const response = await controller.create(createEntryDto);

      expect(response).toEqual({
        systemCode: HttpStatus.CREATED,
        message: '응모가 완료되었습니다.',
      });
    });
  });

  describe('findOne', () => {
    it('should return an entry', async () => {
      const entryId = 1;

      const entry: Entry = {
        id: entryId,
        raffle_id: 1,
        user_id: 1,
        raffle_index: 1,
        created_date: new Date(),
        updated_date: new Date(),
        setUpdatedDateBeforeInsert: () => {},
        setUpdatedDateBeforeUpdate: () => {},
      };

      entryService.findOne.mockResolvedValue(entry);

      const response = await controller.findOne(entryId);

      expect(response).toEqual({
        systemCode: HttpStatus.OK,
        message: '응모 조회에 성공하였습니다.',
        data: entry,
      });
    });
  });

  describe('findUserEntries', () => {
    it('should return user entries', async () => {
      const userId = 1;
      const userEntries: UserEntryDto[] = [];
      entryService.findUserEntries.mockResolvedValue(userEntries);

      const response = await controller.findUserEntries(userId);

      expect(response).toEqual({
        systemCode: HttpStatus.OK,
        message: '응모 조회에 성공하였습니다.',
        data: userEntries,
      });
    });
  });

  describe('getCompetition', () => {
    it('should return competition percentage', async () => {
      const raffleId = 1;
      const userId = 1;
      const percentage = 50;
      entryService.getCompetition.mockResolvedValue(percentage);

      const response = await controller.getCompetition(raffleId, userId);

      expect(response).toEqual({
        systemCode: HttpStatus.OK,
        message: '확률 조회에 성공하였습니다.',
        data: percentage,
      });
    });
  });

  describe('remove', () => {
    it('should delete an entry and return success response', async () => {
      const entryId = 1;
      entryService.remove.mockResolvedValue(entryId);

      const response = await controller.remove(entryId);

      expect(response).toEqual({
        systemCode: HttpStatus.OK,
        message: '응모 삭제에 성공하였습니다.',
      });
    });
  });
});
