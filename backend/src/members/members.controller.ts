import {
  Controller,
  Get,
  Post,
  Patch,
  Req,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { MemberJwtGuard } from '../member-auth/guard/member-jwt.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Controller('members')
@UseGuards(MemberJwtGuard)
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.membersService.getMe(req.user.sub);
  }

  @Patch('profile-image')
  async uploadProfileImage(@Req() req: any) {
    try {
      const parts = req.parts();
      let profileImageFile: Express.Multer.File | null = null;

      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'profileImage') {
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

      if (!profileImageFile) {
        throw new BadRequestException('الصورة الشخصية مطلوبة');
      }

      return await this.membersService.updateProfileImage(
        req.user.sub,
        profileImageFile,
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error.status) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('apply')
  async apply(@Req() req: any) {
    try {
      const parts = req.parts();
      const fields: Record<string, string> = {};
      let enrollmentLetterFile: Express.Multer.File | null = null;
      let receiptFile: Express.Multer.File | null = null;

      for await (const part of parts) {
        if (part.type === 'field') {
          fields[part.fieldname] = part.value;
        } else if (part.type === 'file') {
          const buffer = await part.toBuffer();
          const file: Express.Multer.File = Object.assign({
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
          });

          if (part.fieldname === 'enrollmentLetter') {
            enrollmentLetterFile = file;
          } else if (part.fieldname === 'receipt') {
            receiptFile = file;
          }
        }
      }

      if (!enrollmentLetterFile) {
        throw new BadRequestException('خطاب القبول مطلوب');
      }
      if (!receiptFile) {
        throw new BadRequestException('إيصال الدفع مطلوب');
      }

      // Validate DTO
      const dto = plainToInstance(CreateApplicationDto, fields);
      const errors = await validate(dto);
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      return await this.membersService.apply(
        req.user.sub,
        dto,
        enrollmentLetterFile,
        receiptFile,
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
