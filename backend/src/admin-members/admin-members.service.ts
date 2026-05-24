import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AdminMembersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async findAll(status?: string) {
    const where = status
      ? { applications: { some: { status: status as any } } }
      : {};

    return this.prisma.member.findMany({
      where,
      omit: { password: true },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      omit: { password: true },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async cancel(applicationId: string, reason: string) {
    const application = await this.prisma.membershipApplication.findUnique({
        where: { id: applicationId },
        include: { member: true },
    });

    if (!application) {
        throw new NotFoundException('Application not found');
    }

    if (application.status !== 'pending') {
        throw new BadRequestException('يمكن إلغاء الطلبات التي في حالة انتظار فقط');
    }

    const updated = await this.prisma.membershipApplication.update({
        where: { id: applicationId },
        data: {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
        },
        include: {
        member: {
            select: {
            id: true,
            membershipId: true,
            email: true,
            fullNameAr: true,
            fullNameEn: true,
            },
        },
        },
    });

    // Send rejection email (non-blocking)
    this.emailService.sendRejectionEmail({
        toEmail: application.member.email,
        fullNameAr: application.member.fullNameAr,
        membershipId: application.member.membershipId,
        reason,
    });

    return updated;
    }

  async approve(applicationId: string) {
    const application = await this.prisma.membershipApplication.findUnique({
      where: { id: applicationId },
      include: { member: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'pending') {
      throw new BadRequestException('يمكن قبول الطلبات التي في حالة انتظار فقط');
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const updated = await this.prisma.membershipApplication.update({
      where: { id: applicationId },
      data: { status: 'active', approvedAt: now, expiresAt },
      include: {
        member: {
          select: {
            id: true,
            membershipId: true,
            email: true,
            fullNameAr: true,
            fullNameEn: true,
          },
        },
      },
    });

    // Send approval email (non-blocking)
    this.emailService.sendApprovalEmail({
      toEmail: application.member.email,
      fullNameAr: application.member.fullNameAr,
      membershipId: application.member.membershipId,
      expiresAt: expiresAt.toLocaleDateString('ar-SA'),
    });

    return updated;
  }
}