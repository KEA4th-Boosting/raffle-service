import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
      private health: HealthCheckService,
      private db: TypeOrmHealthIndicator, // DB 상태 체크
      private disk: DiskHealthIndicator,  // Disk 상태 체크
    ) {}

    @Get('liveness')
    @HealthCheck()
    checkLiveness() {
        return this.health.check([
            async () => this.db.pingCheck('database'), // DB 연결 상태 확인
            async () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }), // 디스크 상태 확인
        ]);
    }

    @Get('readiness')
    @HealthCheck()
    checkReadiness() {
        return this.health.check([
            async () => this.db.pingCheck('database'), // DB 연결 상태 확인
            async () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }), // 디스크 상태 확인
        ]);
    }
}