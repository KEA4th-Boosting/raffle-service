import { Test, TestingModule } from '@nestjs/testing';
import { WinnerController } from './winner.controller';

describe('WinnerController', () => {
  let controller: WinnerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WinnerController],
    }).compile();

    controller = module.get<WinnerController>(WinnerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
