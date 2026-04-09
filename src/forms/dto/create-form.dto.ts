import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsObject, IsNotEmpty, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class FormValidationDto {
  @IsOptional()
  minLength?: number;

  @IsOptional()
  maxLength?: number;

  @IsString()
  @IsOptional()
  pattern?: string;

  @IsString()
  @IsOptional()
  patternMessage?: string;

  @IsOptional()
  minAge?: number;

  @IsOptional()
  maxAge?: number;
}

class FormOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  label: string;
}

class FormFieldDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  type: string; // text, textarea, number, tel, email, date, radio, checkbox, select, file_upload, section_divider, info_text

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormOptionDto)
  @IsOptional()
  options?: FormOptionDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => FormValidationDto)
  @IsOptional()
  validation?: FormValidationDto;

  @IsString()
  @IsOptional()
  content?: string; // For info_text and section_divider
}

export class FormSchemaDto {
  @IsString()
  @IsOptional()
  version?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];
}

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  organization_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  @ValidateNested()
  @Type(() => FormSchemaDto)
  schema_config: FormSchemaDto;

  @IsObject()
  @IsOptional()
  header_config?: Record<string, any>;

  @IsObject()
  @IsOptional()
  document_config?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsDateString()
  @IsOptional()
  published_at?: string;

  @IsDateString()
  @IsOptional()
  expires_at?: string;
}
