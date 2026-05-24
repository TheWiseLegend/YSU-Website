// src/branches/branches.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto';
import { LocalStorageService } from 'src/local-storage/local-storage.service';

@Injectable()
export class BranchesService {
  constructor(
    private prisma: PrismaService,
    private localStorageService: LocalStorageService
  ) {}

  create(dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        ...dto,
        establishedAt: new Date(dto.establishedAt),
      }
    });
  }

  findAll() {
    return this.prisma.branch.findMany({
      include: {
        teamMembers: true,
      },
      orderBy: {
        universityName: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        teamMembers: true,
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  async update(id: string, dto: UpdateBranchDto) {
    try {
      // Destructure to separate the establishedAt field
      const { establishedAt, ...restData } = dto;
      
      // Create data object with proper types
      const data = {
        ...restData,
        ...(establishedAt && { establishedAt: new Date(establishedAt) })
      };
      
      return await this.prisma.branch.update({
        where: { id },
        data,
        include: {
          teamMembers: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Branch with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Get the branch first to retrieve the image URL
      const branch = await this.prisma.branch.findUnique({ where: { id } });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${id} not found`);
      }

      // Delete the branch record
      const result = await this.prisma.branch.delete({ where: { id } });
      
      // Delete the associated image file
      if (branch.imageUrl) {
        await this.localStorageService.deleteImage(branch.imageUrl);
      }
      
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Branch with ID ${id} not found`);
      }
      throw error;
    }
  }

  // Additional method to check if a branch exists
  async branchExists(id: string): Promise<boolean> {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!branch;
  }
}