import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, Res, Header } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { StorageService } from './storage.service';
import { CreateRegistrationDto, UpdateRegistrationDto, SubmitRegistrationDto } from './dto/registration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, RegistrationStatus } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Response } from 'express';

// ============================================
// PUBLIC ENDPOINTS — TRD §9.2
// ============================================

@Controller('registrations')
export class RegistrationsPublicController {
  constructor(
    private readonly registrationsService: RegistrationsService,
    private readonly storageService: StorageService,
  ) {}

  // POST /api/v1/registrations/public — Submit new registration (creates DRAFT)
  @Post('public')
  create(@Body() createRegistrationDto: CreateRegistrationDto) {
    return this.registrationsService.createPublic(createRegistrationDto);
  }

  // GET /api/v1/registrations/public/status/:tracking_code — Check status
  @Get('public/status/:tracking_code')
  findByTrackingCode(@Param('tracking_code') trackingCode: string) {
    return this.registrationsService.findByTrackingCode(trackingCode);
  }

  // PATCH /api/v1/registrations/public/:id/submit — Finalize DRAFT → PENDING
  @Patch('public/:id/submit')
  submit(@Param('id') id: string, @Body() dto: SubmitRegistrationDto) {
    return this.registrationsService.submitRegistration(id, dto);
  }

  // POST /api/v1/registrations/public/:id/documents/presign — TRD §9.2 Upload Presign
  @Post('public/:id/documents/presign')
  async presignDocument(
    @Param('id') id: string,
    @Body() body: { fileName: string; mimeType: string; docType: string }
  ) {
    return this.storageService.generatePresignedUrl(body.fileName, body.mimeType, id, body.docType);
  }
}

// ============================================
// ADMIN ENDPOINTS — TRD §9.3
// ============================================

@Controller('admin/registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationsAdminController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // GET /api/v1/admin/registrations — List with filters
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT)
  @Get()
  findAll(
    @GetUser() user: any,
    @Query('status') status?: string,
    @Query('agent_id') agentId?: string,
  ) {
    return this.registrationsService.findAll(user, { status, agent_id: agentId });
  }

  // GET /api/v1/admin/registrations/:id — Single detail
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT)
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.registrationsService.findOne(id, user);
  }

  // PATCH /api/v1/admin/registrations/:id/status — Update status per TRD §8
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: RegistrationStatus; notes?: string },
    @GetUser() user: any,
  ) {
    return this.registrationsService.updateStatus(id, body.status, user, body.notes);
  }

  // PATCH /api/v1/admin/registrations/:id/assign — Assign agent
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch(':id/assign')
  assignAgent(
    @Param('id') id: string,
    @Body() body: { agent_id: string },
    @GetUser() user: any,
  ) {
    return this.registrationsService.assignAgent(id, body.agent_id, user);
  }

  // PATCH /api/v1/admin/registrations/:id — General update (backward compat)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
    @GetUser() user: any,
  ) {
    return this.registrationsService.update(id, updateRegistrationDto, user);
  }

  // GET /api/v1/admin/export/registrations — CSV export per TRD §9.3
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('export/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="registrations.csv"')
  async exportCsv(@GetUser() user: any, @Res() res: Response) {
    const csv = await this.registrationsService.exportCsv(user);
    res.send(csv);
  }
}
