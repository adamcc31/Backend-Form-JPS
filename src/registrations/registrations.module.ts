import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';

@Module({
  providers: [RegistrationsService],
  controllers: [RegistrationsController]
})
export class RegistrationsModule {}
