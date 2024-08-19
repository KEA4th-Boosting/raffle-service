import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, TypeOrmHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { HealthCheckResult, HealthIndicatorResult } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: jest.Mocked<HealthCheckService>;
  let dbIndicator: jest.Mocked<TypeOrmHealthIndicator>;
  let diskIndicator: jest.Mocked<DiskHealthIndicator>;

  beforeEach(async () => {
    healthService = {
      check: jest.fn(),
    } as any;

    dbIndicator = {
      pingCheck: jest.fn(),
    } as any;

    diskIndicator = {
      checkStorage: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthService },
        { provide: TypeOrmHealthIndicator, useValue: dbIndicator },
        { provide: DiskHealthIndicator, useValue: diskIndicator },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkLiveness', () => {
    it('should return health check result', async () => {
      const healthCheckResponse: HealthCheckResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          disk: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          disk: { status: 'up' },
        },
      };
      healthService.check.mockResolvedValue(healthCheckResponse);

      // @ts-ignore
      dbIndicator.pingCheck.mockResolvedValue({ status: 'up' });
      // @ts-ignore
      diskIndicator.checkStorage.mockResolvedValue({ status: 'up' });

      const response = await controller.checkLiveness();

      expect(healthService.check).toHaveBeenCalledWith([
        expect.any(Function),
        expect.any(Function),
      ]);
      expect(response).toEqual(healthCheckResponse);
    });
  });

  describe('checkReadiness', () => {
    it('should return health check result', async () => {
      const healthCheckResponse: HealthCheckResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          disk: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          disk: { status: 'up' },
        },
      };
      healthService.check.mockResolvedValue(healthCheckResponse);

      // @ts-ignore
      dbIndicator.pingCheck.mockResolvedValue({ status: 'up' });
      // @ts-ignore
      diskIndicator.checkStorage.mockResolvedValue({ status: 'up' });

      const response = await controller.checkReadiness();

      expect(healthService.check).toHaveBeenCalledWith([
        expect.any(Function),
        expect.any(Function),
      ]);
      expect(response).toEqual(healthCheckResponse);
    });
  });
});
