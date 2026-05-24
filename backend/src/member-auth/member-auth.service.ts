import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, MemberLoginDto } from './dto';

@Injectable()
export class MemberAuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existing = await this.prisma.member.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate unique membershipId: YSU + 5 digits
    const membershipId = await this.generateMembershipId();

    // Create member
    const member = await this.prisma.member.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullNameAr: dto.fullNameAr,
        fullNameEn: dto.fullNameEn,
        membershipId,
      },
    });

    // Return token
    return this.signToken(member.id, member.email, member.membershipId);
  }

  async login(dto: MemberLoginDto) {
    const member = await this.prisma.member.findUnique({
      where: { email: dto.email },
    });

    if (!member) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const passwordMatch = await bcrypt.compare(dto.password, member.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    return this.signToken(member.id, member.email, member.membershipId);
  }

  private async signToken(memberId: string, email: string, membershipId: string) {
    const payload = { sub: memberId, email, membershipId, role: 'member' };
    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '7d',
    });
    return { access_token: token, token_type: 'bearer' };
  }

    private async generateMembershipId(): Promise<string> {
    let membershipId = '';
    let exists = true;

    while (exists) {
        const random = Math.floor(10000 + Math.random() * 90000);
        membershipId = `YSU${random}`;
        const found = await this.prisma.member.findUnique({ where: { membershipId } });
        exists = !!found;
    }

    return membershipId;
    }
}