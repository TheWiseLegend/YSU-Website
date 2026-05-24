import { Module } from '@nestjs/common';
import { AdminMembersController } from './admin-members.controller';
import { AdminMembersService } from './admin-members.service';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AdminAuthModule, EmailModule],
  controllers: [AdminMembersController],
  providers: [AdminMembersService],
})
export class AdminMembersModule {}