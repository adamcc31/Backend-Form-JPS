import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto, UpdateRegistrationDto } from './dto/registration.dto';
export declare class RegistrationsController {
    private readonly registrationsService;
    constructor(registrationsService: RegistrationsService);
    create(createRegistrationDto: CreateRegistrationDto): Promise<Registration>;
    findAll(user: any): Promise<Registration[]>;
    findOne(id: string, user: any): Promise<Registration>;
    update(id: string, updateRegistrationDto: UpdateRegistrationDto, user: any): Promise<Registration>;
}
