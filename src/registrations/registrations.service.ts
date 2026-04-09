import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto, UpdateRegistrationDto, SubmitRegistrationDto } from './dto/registration.dto';
import { Registration, RegistrationStatus, Role } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  // Generate a unique 12-character tracking code per TRD §3.3
  private generateTrackingCode(): string {
    return randomBytes(6).toString('hex').toUpperCase(); // 12 hex chars
  }

  // ============================================
  // PUBLIC METHODS — TRD §9.2
  // ============================================

  // POST /registrations/public — Create a new DRAFT registration
  async createPublic(dto: CreateRegistrationDto): Promise<Registration> {
    // Honeypot check for bots
    if (dto.dynamic_data && dto.dynamic_data.website_url) {
      throw new BadRequestException('Spam deteksi: Permintaan ditolak.');
    }

    // Verify organization exists
    const org = await this.prisma.organization.findUnique({ where: { id: dto.organization_id } });
    if (!org || !org.is_active) throw new NotFoundException('Organization not found or inactive');

    // Verify form exists
    const form = await this.prisma.dynamicForm.findUnique({ where: { id: dto.dynamic_form_id } });
    if (!form || !form.is_active) throw new NotFoundException('Form not found or inactive');

    // Generate unique tracking code
    let trackingCode: string;
    let isUnique = false;
    do {
      trackingCode = this.generateTrackingCode();
      const existing = await this.prisma.registration.findUnique({ where: { tracking_code: trackingCode } });
      isUnique = !existing;
    } while (!isUnique);

    return this.prisma.registration.create({
      data: {
        tracking_code: trackingCode,
        organization_id: dto.organization_id,
        dynamic_form_id: dto.dynamic_form_id,
        passport_number: dto.passport_number,
        full_name: dto.full_name,
        dynamic_data: dto.dynamic_data || {},
        documents: dto.documents || {},
        status: RegistrationStatus.DRAFT,
      },
    });
  }

  // GET /registrations/public/status/:tracking_code — Check status publicly
  async findByTrackingCode(trackingCode: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { tracking_code: trackingCode },
      select: {
        id: true,
        tracking_code: true,
        full_name: true,
        status: true,
        submitted_at: true,
        created_at: true,
        updated_at: true,
        organization: { select: { name: true } },
      },
    });

    if (!registration) {
      throw new NotFoundException(`Registration with tracking code '${trackingCode}' not found`);
    }

    return registration;
  }

  // PATCH /registrations/public/:id/submit — Finalize: DRAFT → PENDING
  async submitRegistration(id: string, dto?: SubmitRegistrationDto): Promise<Registration> {
    const registration = await this.prisma.registration.findUnique({ where: { id } });
    if (!registration) throw new NotFoundException(`Registration with ID ${id} not found`);

    if (registration.status !== RegistrationStatus.DRAFT && registration.status !== RegistrationStatus.REVISION_REQUIRED) {
      throw new BadRequestException(`Cannot submit registration in status ${registration.status}`);
    }

    const data: any = {
      status: RegistrationStatus.PENDING,
      submitted_at: new Date(),
    };

    if (dto?.dynamic_data) data.dynamic_data = dto.dynamic_data;
    if (dto?.documents) data.documents = dto.documents;

    return this.prisma.registration.update({
      where: { id },
      data,
    });
  }

  // ============================================
  // ADMIN METHODS — TRD §9.3
  // ============================================

  // GET /admin/registrations — List with access control
  async findAll(user: any, filters?: { status?: string; agent_id?: string }): Promise<Registration[]> {
    const where: any = {};

    if (user.role === Role.ADMIN) {
      where.organization_id = user.organization_id;
    } else if (user.role === Role.AGENT) {
      where.assigned_agent_id = user.userId;
    }
    // SUPER_ADMIN sees all

    if (filters?.status) where.status = filters.status;
    if (filters?.agent_id) where.assigned_agent_id = filters.agent_id;

    return this.prisma.registration.findMany({
      where,
      include: {
        organization: true,
        assigned_agent: { select: { id: true, name: true, email: true } },
        dynamic_form: { select: { id: true, title: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // GET /admin/registrations/:id — Single with access control
  async findOne(id: string, user: any): Promise<Registration> {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        organization: true,
        assigned_agent: { select: { id: true, name: true, email: true } },
        dynamic_form: true,
        document_files: true,
      },
    });

    if (!registration) throw new NotFoundException(`Registration with ID ${id} not found`);

    // Access control per TRD §4
    if (user.role === Role.ADMIN && registration.organization_id !== user.organization_id) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }
    if (user.role === Role.AGENT && registration.assigned_agent_id !== user.userId) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return registration;
  }

  // PATCH /admin/registrations/:id/status — Update status per TRD §8
  async updateStatus(id: string, newStatus: RegistrationStatus, user: any, notes?: string): Promise<Registration> {
    const registration = await this.findOne(id, user);

    this.validateStatusTransition(registration.status, newStatus, user.role);

    const data: any = { status: newStatus };
    if (notes) data.notes = notes;

    return this.prisma.registration.update({
      where: { id },
      data,
    });
  }

  // PATCH /admin/registrations/:id/assign — Assign agent
  async assignAgent(id: string, agentId: string, user: any): Promise<Registration> {
    const registration = await this.findOne(id, user);

    // Verify agent exists and belongs to same org
    const agent = await this.prisma.user.findUnique({ where: { id: agentId } });
    if (!agent || agent.role !== Role.AGENT) {
      throw new BadRequestException('Invalid agent: user not found or not an agent');
    }
    if (user.role === Role.ADMIN && agent.organization_id !== user.organization_id) {
      throw new BadRequestException('Agent does not belong to your organization');
    }

    return this.prisma.registration.update({
      where: { id },
      data: { assigned_agent_id: agentId },
    });
  }

  // General update (for backwards compatibility)
  async update(id: string, dto: UpdateRegistrationDto, user: any): Promise<Registration> {
    const registration = await this.findOne(id, user);

    if (dto.status) {
      this.validateStatusTransition(registration.status, dto.status, user.role);
    }

    const data: any = {};
    if (dto.dynamic_data) data.dynamic_data = dto.dynamic_data;
    if (dto.documents) data.documents = dto.documents;
    if (dto.status) data.status = dto.status;
    if (dto.assigned_agent_id) data.assigned_agent_id = dto.assigned_agent_id;
    if (dto.notes) data.notes = dto.notes;
    if (dto.full_name) data.full_name = dto.full_name;
    if (dto.passport_number) data.passport_number = dto.passport_number;

    return this.prisma.registration.update({
      where: { id },
      data,
    });
  }

  // ============================================
  // STATE MACHINE — TRD §8
  // ============================================

  private validateStatusTransition(
    currentStatus: RegistrationStatus,
    newStatus: RegistrationStatus,
    role: Role,
  ) {
    const validTransitions: Record<RegistrationStatus, RegistrationStatus[]> = {
      DRAFT: [RegistrationStatus.PENDING],
      PENDING: [RegistrationStatus.REVIEW_IN_PROGRESS],
      REVIEW_IN_PROGRESS: [RegistrationStatus.REVISION_REQUIRED, RegistrationStatus.APPROVED],
      REVISION_REQUIRED: [RegistrationStatus.PENDING],
      APPROVED: [RegistrationStatus.PROCESSED],
      PROCESSED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }

    // TRD §8: APPROVED only by Admin (not Agent)
    if (newStatus === RegistrationStatus.APPROVED && role === Role.AGENT) {
      throw new BadRequestException('Agents cannot approve registrations');
    }

    // TRD §8: PROCESSED only by Admin
    if (newStatus === RegistrationStatus.PROCESSED && role === Role.AGENT) {
      throw new BadRequestException('Agents cannot mark registrations as processed');
    }
  }

  // ============================================
  // EXPORT — TRD §9.3
  // ============================================

  async exportCsv(user: any): Promise<string> {
    const registrations = await this.findAll(user);

    const headers = ['Tracking Code', 'Full Name', 'Passport Number', 'Status', 'Organization', 'Agent', 'Submitted At', 'Created At'];
    const rows = registrations.map((r: any) => [
      r.tracking_code,
      r.full_name,
      r.passport_number,
      r.status,
      r.organization?.name || '',
      r.assigned_agent?.name || '',
      r.submitted_at ? new Date(r.submitted_at).toISOString() : '',
      new Date(r.created_at).toISOString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
