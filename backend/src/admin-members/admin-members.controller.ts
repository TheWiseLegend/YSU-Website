import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { AdminMembersService } from './admin-members.service';
import { Admin } from '../admin-auth/decorator/admin.decorator';
import { CancelApplicationDto } from './dto/cancel-application.dto';

@Controller('admin/members')
@Admin()
export class AdminMembersController {
  constructor(private adminMembersService: AdminMembersService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.adminMembersService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminMembersService.findOne(id);
  }

  @Patch(':applicationId/approve')
  approve(@Param('applicationId') applicationId: string) {
    return this.adminMembersService.approve(applicationId);
  }

  @Patch(':applicationId/cancel')
  cancel(
    @Param('applicationId') applicationId: string,
    @Body() dto: CancelApplicationDto,
  ) {
    return this.adminMembersService.cancel(applicationId, dto.reason);
  }
}