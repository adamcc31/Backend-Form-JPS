import { IsString, IsNotEmpty, IsObject, IsOptional, IsEnum } from 'class-validator';
import { RegistrationStatus } from '@prisma/client';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  organization_id: string;

  @IsString()
  @IsNotEmpty()
  passport_number: string;

  @IsObject()
  @IsOptional()
  dynamic_data?: Record<string, any>;
}

export class UpdateRegistrationDto {
  @IsObject()
  @IsOptional()
  dynamic_data?: Record<string, any>;

  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;

  @IsString()
  @IsOptional()
  assigned_agent_id?: string;
}
