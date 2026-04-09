import { RegistrationStatus } from '@prisma/client';
export declare class CreateRegistrationDto {
    organization_id: string;
    passport_number: string;
    dynamic_data?: Record<string, any>;
}
export declare class UpdateRegistrationDto {
    dynamic_data?: Record<string, any>;
    status?: RegistrationStatus;
    assigned_agent_id?: string;
}
