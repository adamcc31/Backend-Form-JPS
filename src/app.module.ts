import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FormsModule } from './forms/forms.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    FormsModule,
    OrganizationsModule,
    RegistrationsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
