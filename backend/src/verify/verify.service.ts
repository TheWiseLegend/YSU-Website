import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerifyService {
  constructor(private prisma: PrismaService) {}

  async verifyMembership(membershipId: string) {
    // Find the member by their public membershipId (e.g. "YSU83421")
    const member = await this.prisma.member.findUnique({
      where: { membershipId },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('لم يتم العثور على عضو بهذا الرمز');
    }

    const latestApplication = member.applications[0] ?? null;

    // Determine if membership is truly active (status=active AND not expired)
    const now = new Date();
    const isActive =
      latestApplication?.status === 'active' &&
      latestApplication?.expiresAt != null &&
      latestApplication.expiresAt > now;

    return {
      membershipId: member.membershipId,
      fullNameAr: member.fullNameAr,
      fullNameEn: member.fullNameEn,
      profileImageUrl: member.profileImageUrl ?? null,
      status: isActive ? 'active' : (latestApplication?.status ?? 'none'),
      isActive,
      expiresAt: latestApplication?.expiresAt ?? null,
      approvedAt: latestApplication?.approvedAt ?? null,
    };
  }
}
