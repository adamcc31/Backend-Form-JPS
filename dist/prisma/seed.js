"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const org = await prisma.organization.create({
        data: {
            name: 'LPK JP Smart Global',
            is_active: true,
        },
    });
    console.log(`Created Organization: ${org.name} (${org.id})`);
    const saHashedPassword = await bcrypt.hash('12cIJC*12=-2123Bcsa#1', 10);
    const superAdmin = await prisma.user.upsert({
        where: { email: 'super.admin@jpsmart.com' },
        update: {},
        create: {
            email: 'super.admin@jpsmart.com',
            name: 'Global Super Admin',
            password: saHashedPassword,
            role: client_1.Role.SUPER_ADMIN,
        },
    });
    console.log(`Created Super Admin User: ${superAdmin.email}`);
    const adminHashedPassword = await bcrypt.hash('098324cJHCSD$31', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@jpsmart.com' },
        update: {},
        create: {
            email: 'admin@jpsmart.com',
            name: 'Admin LPK',
            password: adminHashedPassword,
            role: client_1.Role.ADMIN,
            organization_id: org.id,
        },
    });
    console.log(`Created Admin User: ${admin.email}`);
    const agentHashedPassword = await bcrypt.hash('(*1jsadijUHDAKX!@', 10);
    const agent = await prisma.user.upsert({
        where: { email: 'Agent@jpsmart.com' },
        update: {},
        create: {
            email: 'Agent@jpsmart.com',
            name: 'Agent Reg LPK',
            password: agentHashedPassword,
            role: client_1.Role.AGENT,
            organization_id: org.id,
        },
    });
    console.log(`Created Agent User: ${agent.email}`);
    const form = await prisma.dynamicForm.create({
        data: {
            organization_id: org.id,
            schema_config: {
                fields: [
                    {
                        id: 'passport_number',
                        label: 'Passport Number',
                        type: 'text',
                        required: true,
                    },
                    {
                        id: 'full_name',
                        label: 'Full Name',
                        type: 'text',
                        required: true,
                    },
                    {
                        id: 'dana_talangan',
                        label: 'Apakah Anda menggunakan Dana Talangan?',
                        type: 'radio',
                        required: true,
                        options: [
                            { value: 'ya', label: 'Ya' },
                            { value: 'tidak', label: 'Tidak' },
                        ],
                    },
                ],
            },
            is_active: true,
        },
    });
    console.log(`Created Form for Org. ID: ${form.organization_id}`);
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map