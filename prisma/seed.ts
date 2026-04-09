import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'LPK JP Smart Global',
      is_active: true,
    },
  });
  console.log(`Created Organization: ${org.name} (${org.id})`);

  // 2. Create Super Admin
  const saHashedPassword = await bcrypt.hash('12cIJC*12=-2123Bcsa#1', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'super.admin@jpsmart.com' },
    update: {},
    create: {
      email: 'super.admin@jpsmart.com',
      name: 'Global Super Admin',
      password: saHashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`Created Super Admin User: ${superAdmin.email}`);

  // 3. Create Admin
  const adminHashedPassword = await bcrypt.hash('098324cJHCSD$31', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jpsmart.com' },
    update: {},
    create: {
      email: 'admin@jpsmart.com',
      name: 'Admin LPK',
      password: adminHashedPassword,
      role: Role.ADMIN,
      organization_id: org.id,
    },
  });
  console.log(`Created Admin User: ${admin.email}`);

  // 4. Create Agent
  const agentHashedPassword = await bcrypt.hash('(*1jsadijUHDAKX!@', 10);
  const agent = await prisma.user.upsert({
    where: { email: 'Agent@jpsmart.com' },
    update: {},
    create: {
      email: 'Agent@jpsmart.com',
      name: 'Agent Reg LPK',
      password: agentHashedPassword,
      role: Role.AGENT,
      organization_id: org.id,
    },
  });
  console.log(`Created Agent User: ${agent.email}`);

  // 5. Create Dynamic Form
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
