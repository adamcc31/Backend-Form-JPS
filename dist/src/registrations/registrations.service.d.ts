import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto, UpdateRegistrationDto } from './dto/registration.dto';
import { Registration } from '@prisma/client';
export declare class RegistrationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createRegistrationDto: CreateRegistrationDto): Promise<Registration>;
    findAll(user: any): Promise<Registration[]>;
    findOne(id: string, user: any): Promise<Registration>;
    update(id: string, updateRegistrationDto: UpdateRegistrationDto, user: any): Promise<Registration>;
    private validateStatusTransition;
}
