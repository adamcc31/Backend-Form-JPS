"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FormsService = class FormsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createFormDto) {
        return this.prisma.dynamicForm.create({
            data: {
                organization_id: createFormDto.organization_id,
                schema_config: createFormDto.schema_config,
                is_active: createFormDto.is_active ?? true,
            },
        });
    }
    async findAll(organizationId) {
        const where = organizationId ? { organization_id: organizationId } : {};
        return this.prisma.dynamicForm.findMany({
            where,
        });
    }
    async findOne(id) {
        const form = await this.prisma.dynamicForm.findUnique({
            where: { id },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID ${id} not found`);
        }
        return form;
    }
    async update(id, updateFormDto) {
        await this.findOne(id);
        return this.prisma.dynamicForm.update({
            where: { id },
            data: {
                ...(updateFormDto.organization_id && { organization_id: updateFormDto.organization_id }),
                ...(updateFormDto.schema_config && { schema_config: updateFormDto.schema_config }),
                ...(updateFormDto.is_active !== undefined && { is_active: updateFormDto.is_active }),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.dynamicForm.update({
            where: { id },
            data: { is_active: false },
        });
    }
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map