import { Controller, Post, UseGuards, Request, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // Initial setup endpoint - should be disabled or protected in production
  @Post('signup')
  async signup(@Body() data: any) {
    return this.usersService.create({
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || Role.AGENT,
      organization: data.organization_id ? { connect: { id: data.organization_id } } : undefined,
    });
  }
}
