"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const registrations_service_1 = require("./registrations.service");
describe('RegistrationsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [registrations_service_1.RegistrationsService],
        }).compile();
        service = module.get(registrations_service_1.RegistrationsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=registrations.service.spec.js.map