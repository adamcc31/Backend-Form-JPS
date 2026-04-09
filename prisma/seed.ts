import { PrismaClient, Role, RegistrationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Organizations (Tenants) with slug per TRD §3.1
  const lpkSakura = await prisma.organization.upsert({
    where: { slug: 'lpk-sakura' },
    update: {},
    create: {
      name: 'LPK Sakura Indonesia',
      slug: 'lpk-sakura',
      branding_config: {
        logo_url: null,
        primary_color: '#E63946',
        secondary_color: '#457B9D',
      },
    },
  });

  const lpkFuji = await prisma.organization.upsert({
    where: { slug: 'lpk-fuji' },
    update: {},
    create: {
      name: 'LPK Fuji Mandiri',
      slug: 'lpk-fuji',
      branding_config: {
        logo_url: null,
        primary_color: '#2D6A4F',
        secondary_color: '#40916C',
      },
    },
  });

  console.log('✅ Organizations created');

  // 2. Create Users per TRD §4 RBAC roles
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@jpsmart.id' },
    update: {},
    create: {
      email: 'superadmin@jpsmart.id',
      password: hashedPassword,
      name: 'Super Administrator',
      role: Role.SUPER_ADMIN,
    },
  });

  const adminSakura = await prisma.user.upsert({
    where: { email: 'admin@lpk-sakura.id' },
    update: {},
    create: {
      email: 'admin@lpk-sakura.id',
      password: hashedPassword,
      name: 'Admin LPK Sakura',
      role: Role.ADMIN,
      organization_id: lpkSakura.id,
    },
  });

  const agentSakura = await prisma.user.upsert({
    where: { email: 'agent@lpk-sakura.id' },
    update: {},
    create: {
      email: 'agent@lpk-sakura.id',
      password: hashedPassword,
      name: 'Agent Verifikasi Sakura',
      role: Role.AGENT,
      organization_id: lpkSakura.id,
    },
  });

  console.log('✅ Users created');

  // 3. Create Dynamic Forms with schema_config per TRD §5.1
  const formSakura = await prisma.dynamicForm.create({
    data: {
      organization_id: lpkSakura.id,
      title: 'Formulir Registrasi SIM Card Jepang - Batch April 2026',
      schema_config: {
        version: '2.0',
        fields: [
          {
            id: 'field_dana_talangan',
            label: 'Apakah menggunakan Dana Talangan?',
            type: 'radio',
            required: true,
            options: [
              { value: 'ya', label: 'Ya' },
              { value: 'tidak', label: 'Tidak' },
            ],
          },
          {
            id: 'field_nama_lengkap',
            label: 'Nama Lengkap (sesuai Paspor)',
            type: 'text',
            required: true,
            validation: {
              minLength: 3,
              maxLength: 100,
              pattern: '^[a-zA-Z\\s]+$',
              patternMessage: 'Hanya huruf dan spasi yang diperbolehkan',
            },
          },
          {
            id: 'field_tanggal_lahir',
            label: 'Tanggal Lahir',
            type: 'date',
            required: true,
            validation: {
              minAge: 18,
              maxAge: 45,
            },
          },
          {
            id: 'field_kontak_hp',
            label: 'Nomor WhatsApp Aktif',
            type: 'tel',
            required: true,
            placeholder: '+62 8xx-xxxx-xxxx',
          },
          {
            id: 'field_email',
            label: 'Alamat Email',
            type: 'email',
            required: false,
            placeholder: 'contoh@email.com',
          },
          {
            id: 'field_alamat',
            label: 'Alamat Lengkap di Indonesia',
            type: 'textarea',
            required: true,
            validation: {
              minLength: 10,
              maxLength: 500,
            },
          },
          {
            id: 'field_jenis_kelamin',
            label: 'Jenis Kelamin',
            type: 'select',
            required: true,
            options: [
              { value: 'laki_laki', label: 'Laki-laki' },
              { value: 'perempuan', label: 'Perempuan' },
            ],
          },
          {
            id: 'info_dokumen',
            label: 'Informasi Dokumen',
            type: 'info_text',
            content: 'Siapkan dokumen berikut: KTP, halaman data Paspor, dan Zairyu Card (jika sudah memiliki).',
          },
          {
            id: 'section_dokumen',
            label: 'Upload Dokumen',
            type: 'section_divider',
          },
          {
            id: 'field_persetujuan',
            label: 'Saya menyetujui syarat dan ketentuan',
            type: 'checkbox',
            required: true,
            options: [
              { value: 'agree', label: 'Ya, saya setuju dengan syarat dan ketentuan yang berlaku' },
            ],
          },
        ],
      },
      header_config: {
        version: '1.0',
        layout: 'banner_top',
        banner: {
          type: 'color',
          background: 'linear-gradient(135deg, #E63946 0%, #457B9D 100%)',
          overlay_enabled: false,
        },
        headline: {
          text: 'Formulir Registrasi SIM Card Jepang',
          font_size: '2xl',
          font_weight: 'bold',
          color: '#FFFFFF',
          alignment: 'center',
        },
        subheadline: {
          text: 'Isi data dengan lengkap dan benar sesuai dokumen asli.',
          color: '#F0F0F0',
          alignment: 'center',
        },
        theme: {
          primary_color: '#E63946',
          background_color: '#F9FAFB',
          font_family: 'Inter',
        },
      },
      document_config: {
        required_documents: ['KTP', 'PASSPORT'],
        optional_documents: ['ZAIRYU_CARD'],
      },
      is_active: true,
      published_at: new Date(),
    },
  });

  console.log('✅ Dynamic forms created');

  // 4. Create sample registrations
  const reg1 = await prisma.registration.create({
    data: {
      tracking_code: 'A1B2C3D4E5F6',
      organization_id: lpkSakura.id,
      dynamic_form_id: formSakura.id,
      passport_number: 'A12345678',
      full_name: 'Budi Santoso',
      dynamic_data: {
        field_dana_talangan: 'ya',
        field_nama_lengkap: 'Budi Santoso',
        field_tanggal_lahir: '1998-05-15',
        field_kontak_hp: '+6281234567890',
        field_alamat: 'Jl. Merdeka No. 10, Jakarta Selatan',
        field_jenis_kelamin: 'laki_laki',
      },
      documents: {},
      status: RegistrationStatus.PENDING,
      submitted_at: new Date(),
      assigned_agent_id: agentSakura.id,
    },
  });

  const reg2 = await prisma.registration.create({
    data: {
      tracking_code: 'X7Y8Z9W0V1U2',
      organization_id: lpkSakura.id,
      dynamic_form_id: formSakura.id,
      passport_number: 'B98765432',
      full_name: 'Siti Aminah',
      dynamic_data: {
        field_dana_talangan: 'tidak',
        field_nama_lengkap: 'Siti Aminah',
        field_tanggal_lahir: '2000-11-22',
        field_kontak_hp: '+6289876543210',
        field_alamat: 'Jl. Sudirman No. 5, Bandung',
        field_jenis_kelamin: 'perempuan',
      },
      documents: {},
      status: RegistrationStatus.DRAFT,
    },
  });

  console.log('✅ Sample registrations created');
  console.log('');
  console.log('📋 Seed Summary:');
  console.log(`   Organizations: ${lpkSakura.name} (slug: ${lpkSakura.slug}), ${lpkFuji.name} (slug: ${lpkFuji.slug})`);
  console.log(`   Super Admin: superadmin@jpsmart.id / password123`);
  console.log(`   Admin Sakura: admin@lpk-sakura.id / password123`);
  console.log(`   Agent Sakura: agent@lpk-sakura.id / password123`);
  console.log(`   Form: ${formSakura.title}`);
  console.log(`   Public form URL: /p/lpk-sakura`);
  console.log(`   Tracking codes: ${reg1.tracking_code}, ${reg2.tracking_code}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
