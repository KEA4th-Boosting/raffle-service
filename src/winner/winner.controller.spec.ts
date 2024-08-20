import {Test, TestingModule} from '@nestjs/testing';
import {WinnerController} from './winner.controller';
import {WinnerService} from './winner.service';
import {Winner} from './entities/winner.entity';
import {CreateWinnerDto} from './dto/create-winner.dto';
import {CancellationNoShow, UpdateWinnerDto} from './dto/update-winner.dto';
import {UserWinnerDto} from './dto/user-winner.dto';
import {HttpStatus, NotFoundException} from '@nestjs/common';
import {mock, MockProxy} from 'jest-mock-extended';

describe('WinnerController', () => {
  let controller: WinnerController;
  let winnerService: MockProxy<WinnerService>;

  beforeEach(async () => {
    winnerService = mock<WinnerService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WinnerController],
      providers: [
        { provide: WinnerService, useValue: winnerService },
      ],
    }).compile();

    controller = module.get<WinnerController>(WinnerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a winner and return success response', async () => {
      const createWinnerDto: CreateWinnerDto = { raffle_id: 1, entry_id: 1, user_id: 1, benefit_value: 100, waiting_number: 0 };
      const newWinner: Winner = {
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
      winnerService.create.mockResolvedValue(newWinner);

      const response = await controller.create(createWinnerDto);

      expect(response).toEqual({
        systemCode: HttpStatus.CREATED,
        message: '당첨 내역이 생성되었습니다.',
      });
    });
  });

  describe('findOne', () => {
    it('should return a winner', async () => {
      const winnerId = 1;
      const winner: Winner = {
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
      winnerService.findOne.mockResolvedValue(winner);

      const response = await controller.findOne(winnerId);

      expect(response).toEqual({
        systemCode: HttpStatus.OK,
        message: '당첨 조회에 성공하였습니다.',
        data: winner,
      });
    });
  });

  describe('getWinners', () => {
    it('should return winners for a raffle', async () => {
      const raffleId = 1;
      const winners: Partial<Winner>[] = [
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
        },
        {
          id: 2,
          raffle_id: raffleId,
          entry_id: 2,
          user_id: 2,
          waiting_number: 2,
          benefit_value: 200,
          cancellation_noshow_status: null,
          cancellation_noshow_time: null,
          created_date: new Date(),
          updated_date: new Date(),
          setUpdatedDateBeforeInsert: jest.fn(),
          setUpdatedDateBeforeUpdate: jest.fn(),
        }
      ];
      winnerService.getWinners.mockResolvedValue(winners as Winner[]);

      const response = await controller.getWinners(raffleId);

      expect(response).toEqual({
        systemCode: HttpStatus.OK,
        message: '당첨 조회에 성공하였습니다.',
        data: winners,
      });
    });

    it('should return NotFoundException if no winners found', async () => {
      const raffleId = 1;
      winnerService.getWinners.mockResolvedValue([]);

      await expect(controller.getWinners(raffleId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserWinners', () => {
    it('should return user winners', async () => {
      const userId = 1;
      const userWinners: UserWinnerDto[] = [
        {
          id: 1,
          raffle_id: 1,
          entry_id: 1,
          user_id: userId,
          benefit_value: 100,
          check_in: new Date(),
          check_out: new Date(),
          entry_date: new Date(),
          roomName: '더블',
          roomType: '스위트',
          room_area: 50,
          standardPeople: 2,
          waiting_number: 0,
          current_waiting_number: 0,
          images: []
        }
      ];
      winnerService.findUserWinners.mockResolvedValue(userWinners);

      const response = await controller.findUserWinners(userId);

      expect(response).toEqual({
        systemCode: HttpStatus.OK,
        message: '당첨 조회에 성공하였습니다.',
        data: userWinners,
      });
    });
  });

  describe('update', () => {
    it('should update a winner and return success response', async () => {
      const winnerId = 1;
      const updateWinnerDto: UpdateWinnerDto = { cancellation_noshow_status: CancellationNoShow.CANCELLATION };
      const updatedWinner: Winner = {
        id: winnerId,
        raffle_id: 1,
        entry_id: 1,
        user_id: 1,
        waiting_number: 1,
        benefit_value: 200,
        cancellation_noshow_status: null,
        cancellation_noshow_time: new Date(),
        created_date: new Date(),
        updated_date: new Date(),
        setUpdatedDateBeforeInsert: jest.fn(),
        setUpdatedDateBeforeUpdate: jest.fn(),
      };
      winnerService.update.mockResolvedValue(updatedWinner);

      const response = await controller.update(winnerId, updateWinnerDto);

      expect(response).toEqual({
        systemCode: HttpStatus.OK,
        message: '예약 취소에 성공하였습니다.',
        data: updatedWinner,
      });
    });
  });
});