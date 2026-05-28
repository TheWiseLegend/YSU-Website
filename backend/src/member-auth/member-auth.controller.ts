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
import { MemberAuthService } from './member-auth.service';
import { RegisterDto, MemberLoginDto } from './dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Controller('member-auth')
export class MemberAuthController {
  constructor(private memberAuthService: MemberAuthService) {}

  @Post('register')
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
      if (
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (error.status) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: MemberLoginDto) {
    return this.memberAuthService.login(dto);
  }
}
