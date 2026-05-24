// src/union-team/union-team.controller.ts
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
import { UnionTeamService } from './union-team.service';
import { CreateUnionMemberDto, UpdateUnionMemberDto } from './dto';
import { Admin } from '../admin-auth/decorator/admin.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('union-team')
export class UnionTeamController {
  constructor(private readonly unionTeamService: UnionTeamService) {}

  @Post()
  @Admin()
  create(@Body() dto: CreateUnionMemberDto) {
    return this.unionTeamService.create(dto);
  }

  @Get()
  @Public()
  findAll() {
    return this.unionTeamService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.unionTeamService.findOne(id);
  }

  @Put(':id')
  @Admin()
  update(@Param('id') id: string, @Body() dto: UpdateUnionMemberDto) {
    return this.unionTeamService.update(id, dto);
  }

  @Delete(':id')
  @Admin()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.unionTeamService.remove(id);
  }

  @Get('periods')
  @Public()
  getAllPeriods() {
    return this.unionTeamService.getAllPeriods();
  }

  @Get('period/:period')
  @Public()
  findByPeriod(@Param('period') period: string) {
    return this.unionTeamService.findByPeriod(period);
  }

  @Get('current-period')
  @Public()
  getCurrentPeriod() {
    return { currentPeriod: this.unionTeamService.getCurrentPeriod() };
  }
}