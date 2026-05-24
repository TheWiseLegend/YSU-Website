import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembershipCronService {
  private readonly logger = new Logger(MembershipCronService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireMemberships() {
    this.logger.log('Running membership expiry check...');

    const result = await this.prisma.membershipApplication.updateMany({
      where: {
        status: 'active',
        expiresAt: { lte: new Date() },
      },
      data: {
        status: 'expired',
      },
    });

    this.logger.log(`Expired ${result.count} membership(s).`);
  }
}