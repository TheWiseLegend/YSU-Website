import { Controller, Get, Param } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { VerifyService } from './verify.service';

// TODO(stakeholder): confirm the public verify rate limit before release.
const VERIFY_RATE_LIMIT = 20;
const VERIFY_RATE_TTL_SECONDS = 60;

@Controller('verify')
export class VerifyController {
  constructor(private verifyService: VerifyService) {}

  @Get(':membershipId')
  @Throttle({
    default: { limit: VERIFY_RATE_LIMIT, ttl: seconds(VERIFY_RATE_TTL_SECONDS) },
  })
  verify(@Param('membershipId') membershipId: string) {
    return this.verifyService.verifyMembership(membershipId);
  }
}
