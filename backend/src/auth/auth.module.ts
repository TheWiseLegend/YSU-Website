// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  exports: [AdminAuthModule],
})
export class AuthModule {}