import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MemberAuthController } from './member-auth.controller';
import { MemberAuthService } from './member-auth.service';
import { MemberJwtStrategy } from './strategy/member-jwt.strategy';
import { MemberJwtGuard } from './guard/member-jwt.guard';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [MemberAuthController],
  providers: [MemberAuthService, MemberJwtStrategy, MemberJwtGuard],
  exports: [MemberJwtStrategy, MemberJwtGuard, JwtModule],
})
export class MemberAuthModule {}