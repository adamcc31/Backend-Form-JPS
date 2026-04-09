import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto, UpdateRegistrationDto } from './dto/registration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // Public endpoint for students to submit
  @Post()
  create(@Body() createRegistrationDto: CreateRegistrationDto) {
    return this.registrationsService.create(createRegistrationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT)
  @Get()
  findAll(@GetUser() user: any) {
    return this.registrationsService.findAll(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT)
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: any) {
    return this.registrationsService.findOne(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.AGENT)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegistrationDto: UpdateRegistrationDto, @GetUser() user: any) {
    return this.registrationsService.update(id, updateRegistrationDto, user);
  }
}
