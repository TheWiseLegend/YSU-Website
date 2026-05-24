// src/admin-auth/admin-auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AdminAuthService {
  private readonly hashedPassword: string;

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {
    // Hash the admin password once during initialization
    const adminPassword = this.config.get('ADMIN_PASSWORD');
    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD is not set in environment variables');
    }
    this.hashedPassword = bcrypt.hashSync(adminPassword, 10);
  }

  async login(dto: LoginDto) {
    // Compare the incoming password with the hashed password
    const passwordMatch = await bcrypt.compare(dto.password, this.hashedPassword);
    
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid admin password');
    }

    // Generate JWT token
    const payload = { 
      role: 'admin',
      timestamp: Date.now() 
    };
    
    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '24h',
    });

    return {
      access_token: token,
      token_type: 'bearer',
      expires_in: '24h'
    };
  }
}