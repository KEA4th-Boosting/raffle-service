import { Module } from '@nestjs/common';
import { WinnerService } from './winner.service';

@Module({
  providers: [WinnerService]
})
export class WinnerModule {}
