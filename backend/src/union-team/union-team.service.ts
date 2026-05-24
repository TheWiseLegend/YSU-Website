import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnionMemberDto, UpdateUnionMemberDto } from './dto';

@Injectable()
export class UnionTeamService {
  constructor(private prisma: PrismaService) {}

  getCurrentPeriod(): string {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  }

  create(dto: CreateUnionMemberDto) {
    return this.prisma.unionTeamMember.create({ 
      data: dto
    });
  }

  findAll() {
    return this.prisma.unionTeamMember.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.unionTeamMember.findUnique({ 
      where: { id } 
    });
    
    if (!member) {
      throw new NotFoundException(`Union team member with ID ${id} not found`);
    }
    
    return member;
  }

  async update(id: string, dto: UpdateUnionMemberDto) {
    try {
      return await this.prisma.unionTeamMember.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Union team member with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.unionTeamMember.delete({ 
        where: { id } 
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Union team member with ID ${id} not found`);
      }
      throw error;
    }
  }

  async getAllPeriods(): Promise<string[]> {
    const periods = await this.prisma.unionTeamMember.findMany({
      select: { period: true },
      distinct: ['period'],
      orderBy: { period: 'desc' },
    });
    return periods.map(p => p.period);
  }
  
  async findByPeriod(period: string) {
    return this.prisma.unionTeamMember.findMany({
      where: { period },
      orderBy: { createdAt: 'desc' },
    });
  }
  
  isCurrentPeriod(period: string): boolean {
    return period === this.getCurrentPeriod();
  }

  
}