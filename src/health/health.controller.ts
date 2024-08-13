import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
    ) {}

    @Get('liveness')
    @HealthCheck()
    checkLiveness() {
        return this.health.check([
            // 간단한 헬스 체크
            async () => this.http.pingCheck('liveness', 'http://localhost:3000/health/liveness'),
        ]);
    }

    @Get('readiness')
    @HealthCheck()
    checkReadiness() {
        return this.health.check([
            // 필요에 따라 다른 서비스나 데이터베이스를 체크
            async () => this.http.pingCheck('readiness', 'http://localhost:3000/health/readiness'),
        ]);
    }
}