import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { timestamp } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async healthCheck() {
    return {status: 'OK', timestamp: new Date().toISOString()}
  }
}
