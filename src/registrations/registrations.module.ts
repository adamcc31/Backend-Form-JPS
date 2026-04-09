import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsPublicController, RegistrationsAdminController } from './registrations.controller';
import { StorageService } from './storage.service';

@Module({
  providers: [RegistrationsService, StorageService],
  controllers: [RegistrationsPublicController, RegistrationsAdminController],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
