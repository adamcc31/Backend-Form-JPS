"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const registrations_controller_1 = require("./registrations.controller");
describe('RegistrationsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [registrations_controller_1.RegistrationsController],
        }).compile();
        controller = module.get(registrations_controller_1.RegistrationsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=registrations.controller.spec.js.map