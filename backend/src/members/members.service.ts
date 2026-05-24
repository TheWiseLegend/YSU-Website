import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { EmailService } from '../email/email.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private localStorageService: LocalStorageService,
    private emailService: EmailService,
  ) {}

  async getMe(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!member) throw new NotFoundException('Member not found');
    const { password, ...memberData } = member;
    return memberData;
  }

  async apply(
    memberId: string,
    dto: CreateApplicationDto,
    enrollmentLetterFile: Express.Multer.File,
    receiptFile: Express.Multer.File,
  ) {
    const existing = await this.prisma.membershipApplication.findFirst({
      where: {
        memberId,
        status: { in: ['pending', 'active'] },
      },
    });

    if (existing) {
      throw new BadRequestException(
        existing.status === 'active'
          ? 'لديك عضوية نشطة بالفعل'
          : 'طلبك قيد المراجعة بالفعل',
      );
    }

    const enrollmentLetterUrl = await this.localStorageService.uploadDocument(
      enrollmentLetterFile,
      'membership',
    );
    const receiptUrl = await this.localStorageService.uploadDocument(
      receiptFile,
      'membership',
    );

    const application = await this.prisma.membershipApplication.create({
      data: {
        memberId,
        ...dto,
        enrollmentLetterUrl,
        receiptUrl,
        status: 'pending',
        submittedAt: new Date(),
      },
    });

    // Send receipt email (non-blocking)
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (member) {
      this.emailService.sendReceiptEmail({
        toEmail: member.email,
        fullNameAr: member.fullNameAr,
        membershipId: member.membershipId,
      });
    }

    return application;
  }
}