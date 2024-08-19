import { Test, TestingModule } from '@nestjs/testing';
import { RaffleController } from './raffle.controller';
import { RaffleService } from './raffle.service';

describe('RaffleController', () => {
  let controller: RaffleController;
  let service: RaffleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaffleController],
      providers: [
        {
          provide: RaffleService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RaffleController>(RaffleController);
    service = module.get<RaffleService>(RaffleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a raffle', async () => {
    const result = { systemCode: 201, message: '추첨이 생성되었습니다.' };
    jest.spyOn(service, 'create').mockResolvedValueOnce(result as any);

    expect(await controller.create({} as any)).toEqual(result);
  });

  it('should return all raffles', async () => {
    const result = { systemCode: 200, message: '추첨 정보 조회에 성공하였습니다.', data: [] };
    jest.spyOn(service, 'findAll').mockResolvedValueOnce(result.data);

    expect(await controller.findAll()).toEqual(result);
  });

  it('should return a single raffle by id', async () => {
    const result = { systemCode: 200, message: '추첨 정보 조회에 성공하였습니다.', data: {} as any };
    jest.spyOn(service, 'findOne').mockResolvedValueOnce(result.data);

    expect(await controller.findOne(1)).toEqual(result);
  });

  it('should update a raffle', async () => {
    const result = { systemCode: 200, message: '추첨 정보 수정에 성공하였습니다.', data: {} as any };
    jest.spyOn(service, 'update').mockResolvedValueOnce(result.data);

    expect(await controller.update(1, {} as any)).toEqual(result);
  });

  it('should delete a raffle', async () => {
    const result = { systemCode: 200, message: '추첨 삭제에 성공하였습니다.' };
    jest.spyOn(service, 'remove').mockResolvedValueOnce(1);

    expect(await controller.remove(1)).toEqual(result);
  });
});
