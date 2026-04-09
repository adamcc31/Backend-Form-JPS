import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { DynamicForm } from '@prisma/client';
export declare class FormsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createFormDto: CreateFormDto): Promise<DynamicForm>;
    findAll(organizationId?: string): Promise<DynamicForm[]>;
    findOne(id: string): Promise<DynamicForm>;
    update(id: string, updateFormDto: UpdateFormDto): Promise<DynamicForm>;
    remove(id: string): Promise<DynamicForm>;
}
