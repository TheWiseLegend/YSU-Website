// src/team-members/team-members.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto';
import { BranchesService } from '../branches/branches.service';
import { LocalStorageService } from 'src/local-storage/local-storage.service';

@Injectable()
export class TeamMembersService {
    constructor(
      private prisma: PrismaService,
      private branchesService: BranchesService,
      private localStorageService: LocalStorageService
    ) {}
    
      async create(dto: CreateTeamMemberDto) {
        // Since the controller now ensures branchId is set, we can assert it exists
        if (!dto.branchId) {
          throw new BadRequestException('branchId is required');
        }
    
        // Check if branch exists
        const branchExists = await this.branchesService.branchExists(dto.branchId);
        if (!branchExists) {
          throw new NotFoundException(`Branch with ID ${dto.branchId} not found`);
        }
    
        return this.prisma.teamMember.create({
          data: {
            name: dto.name,
            position: dto.position,
            type: dto.type,
            imageUrl: dto.imageUrl,
            branchId: dto.branchId,
          },
        });
      }

  async findByBranchId(branchId: string) {
    // Check if branch exists
    const branchExists = await this.branchesService.branchExists(branchId);
    if (!branchExists) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return this.prisma.teamMember.findMany({
      where: { branchId },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!teamMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }

    return teamMember;
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    try {
      return await this.prisma.teamMember.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Team member with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Get the team member first to retrieve the image URL
      const teamMember = await this.prisma.teamMember.findUnique({ where: { id } });
      if (!teamMember) {
        throw new NotFoundException(`Team member with ID ${id} not found`);
      }

      // Delete the team member record
      const result = await this.prisma.teamMember.delete({ where: { id } });
      
      // Delete the associated image file
      if (teamMember.imageUrl) {
        await this.localStorageService.deleteImage(teamMember.imageUrl);
      }
      
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Team member with ID ${id} not found`);
      }
      throw error;
    }
  }
}