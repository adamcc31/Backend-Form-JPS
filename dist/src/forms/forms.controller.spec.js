"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const forms_controller_1 = require("./forms.controller");
describe('FormsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [forms_controller_1.FormsController],
        }).compile();
        controller = module.get(forms_controller_1.FormsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=forms.controller.spec.js.map