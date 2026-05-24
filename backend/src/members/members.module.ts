import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { MemberAuthModule } from '../member-auth/member-auth.module';
import { LocalStorageModule } from '../local-storage/local-storage.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [MemberAuthModule, LocalStorageModule, EmailModule],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}