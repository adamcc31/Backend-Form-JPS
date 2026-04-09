import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController, SuperAdminController } from './organizations.controller';

@Module({
  providers: [OrganizationsService],
  controllers: [OrganizationsController, SuperAdminController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
