// src/admin-auth/strategy/jwt.strategy.ts 
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const jwtSecret = config.get('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    // Validate that this is an admin token
    if (payload.role !== 'admin') {
      return false;
    }
    return payload;
  }
}