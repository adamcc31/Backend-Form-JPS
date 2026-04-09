import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { DynamicForm } from '@prisma/client';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto): Promise<DynamicForm> {
    return this.prisma.dynamicForm.create({
      data: {
        organization_id: createFormDto.organization_id,
        schema_config: createFormDto.schema_config as any,
        is_active: createFormDto.is_active ?? true,
      },
    });
  }

  async findAll(organizationId?: string): Promise<DynamicForm[]> {
    const where = organizationId ? { organization_id: organizationId } : {};
    return this.prisma.dynamicForm.findMany({
      where,
    });
  }

  async findOne(id: string): Promise<DynamicForm> {
    const form = await this.prisma.dynamicForm.findUnique({
      where: { id },
    });
    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }
    return form;
  }

  async update(id: string, updateFormDto: UpdateFormDto): Promise<DynamicForm> {
    await this.findOne(id); // Ensure it exists
    return this.prisma.dynamicForm.update({
      where: { id },
      data: {
        ...(updateFormDto.organization_id && { organization_id: updateFormDto.organization_id }),
        ...(updateFormDto.schema_config && { schema_config: updateFormDto.schema_config as any }),
        ...(updateFormDto.is_active !== undefined && { is_active: updateFormDto.is_active }),
      },
    });
  }

  async remove(id: string): Promise<DynamicForm> {
    await this.findOne(id);
    return this.prisma.dynamicForm.update({
      where: { id },
      data: { is_active: false },
    });
  }
}
