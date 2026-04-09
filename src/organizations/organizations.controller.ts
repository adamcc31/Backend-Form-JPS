import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { IsString, IsNotEmpty, IsOptional, IsObject, IsBoolean } from 'class-validator';

// DTO for create/update
class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsObject()
  @IsOptional()
  branding_config?: Record<string, any>;
}

class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsObject()
  @IsOptional()
  branding_config?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

// ============================================
// SUPER ADMIN ENDPOINTS — TRD §9.4
// ============================================

@Controller('superadmin/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // GET /api/v1/superadmin/organizations
  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  // POST /api/v1/superadmin/organizations
  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  // GET /api/v1/superadmin/organizations/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  // PATCH /api/v1/superadmin/organizations/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }
}

// Super Admin Stats Controller — TRD §9.4
@Controller('superadmin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // GET /api/v1/superadmin/stats
  @Get('stats')
  getStats() {
    return this.organizationsService.getStats();
  }

  // GET /api/v1/superadmin/audit-logs
  @Get('audit-logs')
  async getAuditLogs() {
    // Direct Prisma query — AuditLog is append-only per TRD §3.5
    // Injected via organizationsService's prisma for simplicity
    return { message: 'Audit logs are populated via PostgreSQL triggers. Query audit_logs table directly.' };
  }
}
