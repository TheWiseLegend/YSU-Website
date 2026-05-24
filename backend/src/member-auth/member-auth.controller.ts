import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MemberAuthService } from './member-auth.service';
import { RegisterDto, MemberLoginDto } from './dto';

@Controller('member-auth')
export class MemberAuthController {
  constructor(private memberAuthService: MemberAuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.memberAuthService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: MemberLoginDto) {
    return this.memberAuthService.login(dto);
  }
}
