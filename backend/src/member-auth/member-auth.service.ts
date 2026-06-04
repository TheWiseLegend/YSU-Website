import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, MemberLoginDto } from './dto';

@Injectable()
export class MemberAuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private localStorageService: LocalStorageService,
    private emailService: EmailService,
  ) {}

  async register(
    dto: RegisterDto,
    profileImageFile?: Express.Multer.File | null,
  ) {
    const existing = await this.prisma.member.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      if (!existing.isEmailVerified) {

        // latest submission, so a user is never trapped by an old password.
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        let profileImageUrl = existing.profileImageUrl;
        if (profileImageFile) {
          profileImageUrl = await this.localStorageService.uploadImage(
            profileImageFile,
            'profile-photos',
          );
        }

        const otpCode = this.generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.prisma.member.update({
          where: { email: dto.email },
          data: {
            password: hashedPassword,
            fullNameAr: dto.fullNameAr,
            fullNameEn: dto.fullNameEn,
            profileImageUrl,
            otpCode,
            otpExpiresAt,
          },
        });

        this.emailService.sendOtpEmail({
          toEmail: existing.email,
          fullNameAr: dto.fullNameAr,
          otpCode,
        });

        return {
          status: 'pending_verification',
          message: 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.',
        };
      }
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const membershipId = await this.generateMembershipId();

    let profileImageUrl: string | null = null;
    if (profileImageFile) {
      profileImageUrl = await this.localStorageService.uploadImage(
        profileImageFile,
        'profile-photos',
      );
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const member = await this.prisma.member.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullNameAr: dto.fullNameAr,
        fullNameEn: dto.fullNameEn,
        membershipId,
        profileImageUrl,
        isEmailVerified: false,
        otpCode,
        otpExpiresAt,
      },
    });

    // Send OTP email — non-blocking (don't await, don't fail register if email fails)
    this.emailService.sendOtpEmail({
      toEmail: member.email,
      fullNameAr: member.fullNameAr,
      otpCode,
    });

    return {
      status: 'pending_verification',
      message:
        'تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني وإدخال الرمز المرسل.',
    };
  }

  async verifyOtp(email: string, otp: string) {
    const member = await this.prisma.member.findUnique({ where: { email } });

    if (!member) {
      throw new UnauthorizedException('البريد الإلكتروني غير موجود');
    }

    if (member.isEmailVerified) {
      throw new BadRequestException('البريد الإلكتروني محقق مسبقاً');
    }

    if (!member.otpCode || !member.otpExpiresAt) {
      throw new BadRequestException('لا يوجد رمز تحقق نشط. اطلب رمزاً جديداً.');
    }

    if (new Date() > member.otpExpiresAt) {
      throw new BadRequestException(
        'انتهت صلاحية رمز التحقق. اطلب رمزاً جديداً.',
      );
    }

    if (member.otpCode !== otp) {
      throw new UnauthorizedException('رمز التحقق غير صحيح');
    }

    // OTP valid — mark verified and clear OTP fields
    await this.prisma.member.update({
      where: { email },
      data: {
        isEmailVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    return this.signToken(member.id, member.email, member.membershipId);
  }

  async resendOtp(email: string) {
    const member = await this.prisma.member.findUnique({ where: { email } });

    if (!member) {
      throw new UnauthorizedException('البريد الإلكتروني غير موجود');
    }

    if (member.isEmailVerified) {
      throw new BadRequestException('البريد الإلكتروني محقق مسبقاً');
    }

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.member.update({
      where: { email },
      data: { otpCode, otpExpiresAt },
    });

    this.emailService.sendOtpEmail({
      toEmail: member.email,
      fullNameAr: member.fullNameAr,
      otpCode,
    });

    return { message: 'تم إرسال رمز التحقق الجديد إلى بريدك الإلكتروني.' };
  }

  async requestPasswordReset(email: string) {
    const member = await this.prisma.member.findUnique({ where: { email } });

    // Security: never reveal whether an email exists — return generic success.
    if (!member) {
      return {
        message: 'إذا كان البريد الإلكتروني مسجلاً، سيصلك رمز إعادة التعيين.',
      };
    }

    if (!member.isEmailVerified) {
      return {
        message: 'إذا كان البريد الإلكتروني مسجلاً، سيصلك رمز إعادة التعيين.',
      };
    }

    const resetPasswordCode = this.generateOtp();
    const resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await this.prisma.member.update({
      where: { email },
      data: { resetPasswordCode, resetPasswordExpiresAt },
    });

    // Non-blocking send — same fire-and-forget pattern as register()
    this.emailService.sendPasswordResetEmail({
      toEmail: member.email,
      fullNameAr: member.fullNameAr,
      resetCode: resetPasswordCode,
    });

    return {
      message: 'إذا كان البريد الإلكتروني مسجلاً، سيصلك رمز إعادة التعيين.',
    };
  }

  async verifyResetCode(email: string, code: string) {
    const member = await this.prisma.member.findUnique({ where: { email } });

    // Generic invalid message on not-found too — don't leak existence.
    if (
      !member ||
      !member.resetPasswordCode ||
      !member.resetPasswordExpiresAt
    ) {
      throw new UnauthorizedException('رمز إعادة التعيين غير صحيح');
    }

    if (new Date() > member.resetPasswordExpiresAt) {
      throw new BadRequestException('انتهت صلاحية الرمز. اطلب رمزاً جديداً.');
    }

    if (member.resetPasswordCode !== code) {
      throw new UnauthorizedException('رمز إعادة التعيين غير صحيح');
    }

    // Valid — do NOT clear fields here; clearing happens in resetPassword().
    return { verified: true, email };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const member = await this.prisma.member.findUnique({ where: { email } });

    // Re-validate the code — never trust that verifyResetCode() was called first.
    if (
      !member ||
      !member.resetPasswordCode ||
      !member.resetPasswordExpiresAt
    ) {
      throw new UnauthorizedException('رمز إعادة التعيين غير صحيح');
    }

    if (new Date() > member.resetPasswordExpiresAt) {
      throw new BadRequestException('انتهت صلاحية الرمز. اطلب رمزاً جديداً.');
    }

    if (member.resetPasswordCode !== code) {
      throw new UnauthorizedException('رمز إعادة التعيين غير صحيح');
    }

    // Same password regex as RegisterDto.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new BadRequestException(
        'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.member.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordCode: null,
        resetPasswordExpiresAt: null,
      },
    });

    return {
      message: 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
    };
  }

  async login(dto: MemberLoginDto) {
    const member = await this.prisma.member.findUnique({
      where: { email: dto.email },
    });

    if (!member) {
      throw new UnauthorizedException(
        'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      );
    }

    const passwordMatch = await bcrypt.compare(dto.password, member.password);
    if (!passwordMatch) {
      throw new UnauthorizedException(
        'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      );
    }

    // Block login if email is not verified
    if (!member.isEmailVerified) {
      throw new UnauthorizedException('email_not_verified');
    }

    return this.signToken(member.id, member.email, member.membershipId);
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async signToken(
    memberId: string,
    email: string,
    membershipId: string,
  ) {
    const payload = { sub: memberId, email, membershipId, role: 'member' };
    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '7d',
    });
    return { access_token: token, token_type: 'bearer' };
  }

  private async generateMembershipId(): Promise<string> {
    const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'Y', 'N', 'L', 'G', 'S', 'O', 'V', 'D'];
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);   // e.g. "26"
    const month = MONTH_LETTERS[now.getMonth()];        // e.g. "N" for June

    let membershipId = '';
    let exists = true;

    while (exists) {
      const random = Math.floor(10000 + Math.random() * 90000); // 5-digit: 10000–99999
      membershipId = `YSU${year}${month}${random}`;
      const found = await this.prisma.member.findUnique({
        where: { membershipId },
      });
      exists = !!found;
    }

    return membershipId;
  }
}
