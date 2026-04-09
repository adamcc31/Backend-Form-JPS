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
exports.RegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RegistrationsService = class RegistrationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRegistrationDto) {
        return this.prisma.registration.create({
            data: {
                organization_id: createRegistrationDto.organization_id,
                passport_number: createRegistrationDto.passport_number,
                dynamic_data: createRegistrationDto.dynamic_data || {},
                status: client_1.RegistrationStatus.PENDING,
            },
        });
    }
    async findAll(user) {
        let where = {};
        if (user.role === client_1.Role.ADMIN) {
            where = { organization_id: user.organization_id };
        }
        else if (user.role === client_1.Role.AGENT) {
            where = { assigned_agent_id: user.userId };
        }
        return this.prisma.registration.findMany({
            where,
            include: { organization: true, assigned_agent: true },
        });
    }
    async findOne(id, user) {
        const registration = await this.prisma.registration.findUnique({
            where: { id },
            include: { organization: true, assigned_agent: true },
        });
        if (!registration) {
            throw new common_1.NotFoundException(`Registration with ID ${id} not found`);
        }
        if (user.role === client_1.Role.ADMIN && registration.organization_id !== user.organization_id) {
            throw new common_1.NotFoundException(`Registration with ID ${id} not found`);
        }
        if (user.role === client_1.Role.AGENT && registration.assigned_agent_id !== user.userId) {
            throw new common_1.NotFoundException(`Registration with ID ${id} not found`);
        }
        return registration;
    }
    async update(id, updateRegistrationDto, user) {
        const registration = await this.findOne(id, user);
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
    validateStatusTransition(currentStatus, newStatus, role) {
        const validTransitions = {
            DRAFT: [client_1.RegistrationStatus.PENDING],
            PENDING: [client_1.RegistrationStatus.REVIEW_IN_PROGRESS],
            REVIEW_IN_PROGRESS: [client_1.RegistrationStatus.REVISION_REQUIRED, client_1.RegistrationStatus.APPROVED],
            REVISION_REQUIRED: [client_1.RegistrationStatus.PENDING],
            APPROVED: [client_1.RegistrationStatus.PROCESSED],
            PROCESSED: [],
        };
        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
        if (newStatus === client_1.RegistrationStatus.APPROVED && role === client_1.Role.AGENT) {
            throw new common_1.BadRequestException('Agents cannot approve registrations');
        }
    }
};
exports.RegistrationsService = RegistrationsService;
exports.RegistrationsService = RegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegistrationsService);
//# sourceMappingURL=registrations.service.js.map