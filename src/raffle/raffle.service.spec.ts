import { Test, TestingModule } from '@nestjs/testing';
import { RaffleService } from './raffle.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Raffle } from './entities/raffle.entity';
import { Repository } from 'typeorm';

describe('RaffleService', () => {
  let service: RaffleService;
  let repository: Repository<Raffle>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RaffleService,
        {
          provide: getRepositoryToken(Raffle),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RaffleService>(RaffleService);
    repository = module.get<Repository<Raffle>>(getRepositoryToken(Raffle));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a raffle', async () => {
    const raffle = { id: 1, raffle_name: 'Test Raffle' } as Raffle;
    jest.spyOn(repository, 'save').mockResolvedValueOnce(raffle);

    const result = await service.create(raffle);
    expect(result).toEqual(raffle);
  });

  it('should return all raffles', async () => {
    const raffles = [{ id: 1, raffle_name: 'Test Raffle' }] as Raffle[];
    jest.spyOn(repository, 'find').mockResolvedValueOnce(raffles);

    const result = await service.findAll();
    expect(result).toEqual(raffles);
  });

  it('should return a single raffle by id', async () => {
    const raffle = { id: 1, raffle_name: 'Test Raffle' } as Raffle;
    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(raffle);

    const result = await service.findOne(1);
    expect(result).toEqual(raffle);
  });

  it('should update a raffle', async () => {
    const raffle = { id: 1, raffle_name: 'Updated Raffle' } as Raffle;
    jest.spyOn(repository, 'save').mockResolvedValueOnce(raffle);

    const result = await service.update(1, raffle);
    expect(result).toEqual(raffle);
  });

  it('should delete a raffle', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValueOnce({ affected: 1 } as any);

    const result = await service.remove(1);
    expect(result).toEqual(1);
  });
});
