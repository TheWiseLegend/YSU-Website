import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

export function Admin() {
  return applyDecorators(
    UseGuards(JwtAuthGuard)
  );
}