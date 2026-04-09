import { IsString, IsBoolean, IsOptional, IsArray, ValidateNested, IsObject, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

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
  type: string; // e.g., 'text', 'radio', 'select', 'checkbox'

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormOptionDto)
  @IsOptional()
  options?: FormOptionDto[];
}

export class FormSchemaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];
}

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  organization_id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => FormSchemaDto)
  schema_config: FormSchemaDto;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
