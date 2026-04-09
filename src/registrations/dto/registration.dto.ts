import { IsString, IsNotEmpty, IsObject, IsOptional, IsEnum } from 'class-validator';
import { RegistrationStatus } from '@prisma/client';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  organization_id: string;

  @IsString()
  @IsNotEmpty()
  dynamic_form_id: string;

  @IsString()
  @IsNotEmpty()
  passport_number: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsObject()
  @IsOptional()
  dynamic_data?: Record<string, any>;

  @IsObject()
  @IsOptional()
  documents?: Record<string, any>;
}

export class UpdateRegistrationDto {
  @IsObject()
  @IsOptional()
  dynamic_data?: Record<string, any>;

  @IsObject()
  @IsOptional()
  documents?: Record<string, any>;

  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;

  @IsString()
  @IsOptional()
  assigned_agent_id?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  passport_number?: string;
}

export class SubmitRegistrationDto {
  @IsObject()
  @IsOptional()
  dynamic_data?: Record<string, any>;

  @IsObject()
  @IsOptional()
  documents?: Record<string, any>;
}
