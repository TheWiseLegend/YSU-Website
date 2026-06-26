import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Body,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { MemberAuthService } from './member-auth.service';
import { RegisterDto, MemberLoginDto } from './dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;
}

class ResendOtpDto {
  @IsEmail()
  email!: string;
}

class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

class VerifyResetCodeDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}

class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  code!: string;

  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}

@Controller('member-auth')
export class MemberAuthController {
  constructor(private memberAuthService: MemberAuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: seconds(60) } })
  async register(@Req() req: any) {
    try {
      const parts = req.parts();
      const fields: Record<string, string> = {};
      let profileImageFile: Express.Multer.File | null = null;

      for await (const part of parts) {
        if (part.type === 'field') {
          fields[part.fieldname] = part.value;
        } else if (part.type === 'file') {
          if (part.fieldname === 'profileImage') {
            const buffer = await part.toBuffer();
            // Limit file size to 2MB
            if (buffer.length > 2 * 1024 * 1024) {
              throw new BadRequestException(
                'حجم الصورة يجب أن لا يتجاوز 2 ميجابايت',
              );
            }
            profileImageFile = {
              fieldname: part.fieldname,
              originalname: part.filename,
              encoding: part.encoding,
              mimetype: part.mimetype,
              size: buffer.length,
              buffer,
              stream: null as any,
              destination: '',
              filename: '',
              path: '',
            };
          }
        }
      }

      if (!profileImageFile) {
        throw new BadRequestException('الصورة الشخصية مطلوبة');
      }

      // Validate DTO
      const dto = plainToInstance(RegisterDto, fields);
      const errors = await validate(dto);
      if (errors.length > 0) {
        const messages = errors
          .map((e) => Object.values(e.constraints || {}).join(', '))
          .join('; ');
        throw new BadRequestException(messages);
      }

      return await this.memberAuthService.register(dto, profileImageFile);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.status) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  login(@Body() dto: MemberLoginDto) {
    return this.memberAuthService.login(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.memberAuthService.verifyOtp(dto.email, dto.otp);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: seconds(300) } })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.memberAuthService.resendOtp(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: seconds(300) } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.memberAuthService.requestPasswordReset(dto.email);
  }

  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.memberAuthService.verifyResetCode(dto.email, dto.code);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.memberAuthService.resetPassword(
      dto.email,
      dto.code,
      dto.newPassword,
    );
  }
}
