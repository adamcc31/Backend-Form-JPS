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
        title: createFormDto.title,
        schema_config: createFormDto.schema_config as any,
        header_config: (createFormDto.header_config as any) || {},
        document_config: (createFormDto.document_config as any) || {},
        is_active: createFormDto.is_active ?? true,
        published_at: createFormDto.published_at ? new Date(createFormDto.published_at) : null,
        expires_at: createFormDto.expires_at ? new Date(createFormDto.expires_at) : null,
      },
    });
  }

  async findAll(organizationId?: string): Promise<DynamicForm[]> {
    const where: any = {};
    if (organizationId) where.organization_id = organizationId;
    return this.prisma.dynamicForm.findMany({
      where,
      include: { organization: true },
    });
  }

  async findOne(id: string): Promise<DynamicForm> {
    const form = await this.prisma.dynamicForm.findUnique({
      where: { id },
      include: { organization: true },
    });
    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }
    return form;
  }

  // TRD §9.2: GET /forms/public/:org_slug — get active form by org slug
  async findActiveByOrgSlug(orgSlug: string): Promise<{ form: DynamicForm; organization: any }> {
    const organization = await this.prisma.organization.findUnique({
      where: { slug: orgSlug },
    });

    if (!organization || !organization.is_active) {
      throw new NotFoundException(`Organization with slug '${orgSlug}' not found or inactive`);
    }

    const now = new Date();
    const form = await this.prisma.dynamicForm.findFirst({
      where: {
        organization_id: organization.id,
        is_active: true,
        OR: [
          { expires_at: null },
          { expires_at: { gt: now } },
        ],
      },
      orderBy: { created_at: 'desc' },
    });

    if (!form) {
      throw new NotFoundException(`No active form found for organization '${orgSlug}'`);
    }

    return { form, organization };
  }

  async update(id: string, updateFormDto: UpdateFormDto): Promise<DynamicForm> {
    await this.findOne(id);
    const data: any = {};
    if (updateFormDto.organization_id) data.organization_id = updateFormDto.organization_id;
    if (updateFormDto.title) data.title = updateFormDto.title;
    if (updateFormDto.schema_config) data.schema_config = updateFormDto.schema_config as any;
    if (updateFormDto.header_config) data.header_config = updateFormDto.header_config as any;
    if (updateFormDto.document_config) data.document_config = updateFormDto.document_config as any;
    if (updateFormDto.is_active !== undefined) data.is_active = updateFormDto.is_active;
    if (updateFormDto.published_at) data.published_at = new Date(updateFormDto.published_at);
    if (updateFormDto.expires_at) data.expires_at = new Date(updateFormDto.expires_at);

    return this.prisma.dynamicForm.update({
      where: { id },
      data,
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
