import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsPublicController, FormsAdminController } from './forms.controller';

@Module({
  providers: [FormsService],
  controllers: [FormsPublicController, FormsAdminController],
  exports: [FormsService],
})
export class FormsModule {}
