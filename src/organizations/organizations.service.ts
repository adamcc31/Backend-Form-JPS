import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Organization, Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; slug: string; branding_config?: any }): Promise<Organization> {
    return this.prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        branding_config: data.branding_config || {},
      },
    });
  }

  async findAll(): Promise<Organization[]> {
    return this.prisma.organization.findMany({
      include: {
        _count: { select: { users: true, dynamic_forms: true, registrations: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, is_active: true } },
        _count: { select: { dynamic_forms: true, registrations: true } },
      },
    });
    if (!org) throw new NotFoundException(`Organization with ID ${id} not found`);
    return org;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (!org) throw new NotFoundException(`Organization with slug '${slug}' not found`);
    return org;
  }

  async update(id: string, data: { name?: string; slug?: string; branding_config?: any; is_active?: boolean }): Promise<Organization> {
    await this.findOne(id);
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.slug) updateData.slug = data.slug;
    if (data.branding_config) updateData.branding_config = data.branding_config;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    return this.prisma.organization.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: { is_active: false },
    });
  }

  // TRD §9.4: GET /superadmin/stats
  async getStats() {
    const [totalOrgs, totalRegistrations, totalForms, totalUsers] = await Promise.all([
      this.prisma.organization.count({ where: { is_active: true } }),
      this.prisma.registration.count(),
      this.prisma.dynamicForm.count({ where: { is_active: true } }),
      this.prisma.user.count({ where: { is_active: true } }),
    ]);

    const statusCounts = await this.prisma.registration.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return {
      total_organizations: totalOrgs,
      total_registrations: totalRegistrations,
      total_forms: totalForms,
      total_users: totalUsers,
      registrations_by_status: statusCounts.reduce((acc: any, item: any) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
    };
  }
}
