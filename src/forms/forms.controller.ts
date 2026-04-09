import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';

// ============================================
// PUBLIC ENDPOINTS — TRD §9.2
// ============================================

@Controller('forms')
export class FormsPublicController {
  constructor(private readonly formsService: FormsService) {}

  // GET /api/v1/forms/public/:org_slug — TRD §9.2
  @Get('public/:org_slug')
  async getPublicForm(@Param('org_slug') orgSlug: string) {
    return this.formsService.findActiveByOrgSlug(orgSlug);
  }
}

// ============================================
// ADMIN ENDPOINTS — TRD §9.3
// ============================================

@Controller('admin/forms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FormsAdminController {
  constructor(private readonly formsService: FormsService) {}

  // GET /api/v1/admin/forms — TRD §9.3
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get()
  findAll(@GetUser() user: any, @Query('organization_id') organizationId?: string) {
    if (user.role === Role.ADMIN) {
      return this.formsService.findAll(user.organization_id);
    }
    return this.formsService.findAll(organizationId);
  }

  // GET /api/v1/admin/forms/:id
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  // POST /api/v1/admin/forms — TRD §9.3
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  create(@Body() createFormDto: CreateFormDto, @GetUser() user: any) {
    if (user.role === Role.ADMIN) {
      createFormDto.organization_id = user.organization_id;
    }
    return this.formsService.create(createFormDto);
  }

  // PATCH /api/v1/admin/forms/:id — TRD §9.3
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto, @GetUser() user: any) {
    if (user.role === Role.ADMIN) {
      const form = await this.formsService.findOne(id);
      if (form.organization_id !== user.organization_id) {
        throw new Error('Unauthorized to update this form');
      }
      updateFormDto.organization_id = user.organization_id;
    }
    return this.formsService.update(id, updateFormDto);
  }

  // DELETE /api/v1/admin/forms/:id (soft delete)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: any) {
    if (user.role === Role.ADMIN) {
      const form = await this.formsService.findOne(id);
      if (form.organization_id !== user.organization_id) {
        throw new Error('Unauthorized to delete this form');
      }
    }
    return this.formsService.remove(id);
  }
}
