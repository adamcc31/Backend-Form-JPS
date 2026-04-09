import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Organization, Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return this.prisma.organization.create({
      data,
    });
  }

  async findAll(): Promise<Organization[]> {
    return this.prisma.organization.findMany({
      where: { is_active: true },
    });
  }

  async findOne(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: { is_active: false },
    });
  }
}
