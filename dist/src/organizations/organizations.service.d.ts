import { PrismaService } from '../prisma/prisma.service';
import { Organization, Prisma } from '@prisma/client';
export declare class OrganizationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.OrganizationCreateInput): Promise<Organization>;
    findAll(): Promise<Organization[]>;
    findOne(id: string): Promise<Organization | null>;
    update(id: string, data: Prisma.OrganizationUpdateInput): Promise<Organization>;
    remove(id: string): Promise<Organization>;
}
