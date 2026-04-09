"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const forms_service_1 = require("./forms.service");
describe('FormsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [forms_service_1.FormsService],
        }).compile();
        service = module.get(forms_service_1.FormsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=forms.service.spec.js.map