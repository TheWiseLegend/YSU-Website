// src/team-members/team-members.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  HttpStatus, 
  HttpCode 
} from '@nestjs/common';
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto';
import { Admin } from '../admin-auth/decorator/admin.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller()
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Post('branches/:branchId/team-members')
  @Admin()
  create(@Body() dto: CreateTeamMemberDto, @Param('branchId') branchId: string) {
    const createDto = { ...dto, branchId };
    return this.teamMembersService.create(createDto);
  }

  @Get('branches/:branchId/team-members')
  @Public()
  findByBranchId(@Param('branchId') branchId: string) {
    return this.teamMembersService.findByBranchId(branchId);
  }

  @Get('team-members/:id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.teamMembersService.findOne(id);
  }

  @Put('team-members/:id')
  @Admin()
  update(@Param('id') id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.teamMembersService.update(id, dto);
  }

  @Delete('team-members/:id')
  @Admin()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.teamMembersService.remove(id);
  }
}