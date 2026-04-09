import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto, UpdateRegistrationDto } from './dto/registration.dto';
import { Registration, RegistrationStatus, Role } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  async create(createRegistrationDto: CreateRegistrationDto): Promise<Registration> {
    return this.prisma.registration.create({
      data: {
        organization_id: createRegistrationDto.organization_id,
        passport_number: createRegistrationDto.passport_number,
        dynamic_data: createRegistrationDto.dynamic_data || {},
        status: RegistrationStatus.PENDING, // Initial status after DRAFT/submit
      },
    });
  }

  async findAll(user: any): Promise<Registration[]> {
    let where = {};
    if (user.role === Role.ADMIN) {
      where = { organization_id: user.organization_id };
    } else if (user.role === Role.AGENT) {
      where = { assigned_agent_id: user.userId };
    }
    // SUPER_ADMIN sees all

    return this.prisma.registration.findMany({
      where,
      include: { organization: true, assigned_agent: true },
    });
  }

  async findOne(id: string, user: any): Promise<Registration> {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: { organization: true, assigned_agent: true },
    });

    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    // Access control
    if (user.role === Role.ADMIN && registration.organization_id !== user.organization_id) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }
    if (user.role === Role.AGENT && registration.assigned_agent_id !== user.userId) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return registration;
  }

  async update(id: string, updateRegistrationDto: UpdateRegistrationDto, user: any): Promise<Registration> {
    const registration = await this.findOne(id, user);

    // State machine validation
    if (updateRegistrationDto.status) {
      this.validateStatusTransition(registration.status, updateRegistrationDto.status, user.role);
    }

    return this.prisma.registration.update({
      where: { id },
      data: {
        ...(updateRegistrationDto.dynamic_data && { dynamic_data: updateRegistrationDto.dynamic_data }),
        ...(updateRegistrationDto.status && { status: updateRegistrationDto.status }),
        ...(updateRegistrationDto.assigned_agent_id && { assigned_agent_id: updateRegistrationDto.assigned_agent_id }),
      },
    });
  }

  private validateStatusTransition(currentStatus: RegistrationStatus, newStatus: RegistrationStatus, role: Role) {
    const validTransitions: Record<RegistrationStatus, RegistrationStatus[]> = {
      DRAFT: [RegistrationStatus.PENDING],
      PENDING: [RegistrationStatus.REVIEW_IN_PROGRESS],
      REVIEW_IN_PROGRESS: [RegistrationStatus.REVISION_REQUIRED, RegistrationStatus.APPROVED],
      REVISION_REQUIRED: [RegistrationStatus.PENDING],
      APPROVED: [RegistrationStatus.PROCESSED],
      PROCESSED: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    // Role-based transition validation
    if (newStatus === RegistrationStatus.APPROVED && role === Role.AGENT) {
      throw new BadRequestException('Agents cannot approve registrations');
    }
  }
}
