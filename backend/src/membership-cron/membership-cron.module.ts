import { Module } from '@nestjs/common';
import { MembershipCronService } from './membership-cron.service';

@Module({
  providers: [MembershipCronService],
})
export class MembershipCronModule {}