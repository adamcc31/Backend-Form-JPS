import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  create(@Body() createFormDto: CreateFormDto, @GetUser() user: any) {
    // If ADMIN, force organization_id to their own
    if (user.role === Role.ADMIN) {
      createFormDto.organization_id = user.organization_id;
    }
    return this.formsService.create(createFormDto);
  }

  @Get()
  findAll(@Query('organization_id') organizationId?: string) {
    // Public endpoint to get forms, usually filtered by organization
    return this.formsService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto, @GetUser() user: any) {
    if (user.role === Role.ADMIN) {
      const form = await this.formsService.findOne(id);
      if (form.organization_id !== user.organization_id) {
        throw new Error('Unauthorized to update this form');
      }
      updateFormDto.organization_id = user.organization_id;
    }
    return this.formsService.update(id, updateFormDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: any) {
    if (user.role === Role.ADMIN) {
      const form = await this.formsService.findOne(id);
      if (form.organization_id !== user.organization_id) {
        throw new Error('Unauthorized to delete this form');
      }
    }
    return this.formsService.remove(id);
  }
}
