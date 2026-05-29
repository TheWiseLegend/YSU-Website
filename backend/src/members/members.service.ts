import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { EmailService } from '../email/email.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import * as bcrypt from 'bcrypt';

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

  async changePassword(
    memberId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    // Verify the current password — proof the session owner knows it.
    const matches = await bcrypt.compare(currentPassword, member.password);
    if (!matches) {
      // 400 (not 401) so the Arabic message reaches the UI 
      throw new BadRequestException('كلمة المرور الحالية غير صحيحة');
    }

    // Reject reusing the same password.
    const isSame = await bcrypt.compare(newPassword, member.password);
    if (isSame) {
      throw new BadRequestException(
        'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية',
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.member.update({
      where: { id: memberId },
      data: { password: hashed },
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  async updateProfileImage(
    memberId: string,
    profileImageFile: Express.Multer.File,
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    // If member already has a profile image, replace it
    let profileImageUrl: string;
    if (member.profileImageUrl) {
      profileImageUrl = await this.localStorageService.replaceImage(
        member.profileImageUrl,
        profileImageFile,
        'profile-photos',
      );
    } else {
      profileImageUrl = await this.localStorageService.uploadImage(
        profileImageFile,
        'profile-photos',
      );
    }

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: { profileImageUrl },
    });

    const { password, ...memberData } = updated;
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
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });
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
