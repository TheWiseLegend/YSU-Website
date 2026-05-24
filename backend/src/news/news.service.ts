import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto, UpdateNewsDto } from './dto';
import { LocalStorageService } from 'src/local-storage/local-storage.service';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private localStorageService: LocalStorageService
  ) {}
  
  create(dto: CreateNewsDto) {
    return this.prisma.news.create({ 
      data: {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        imageUrl: dto.imageUrl,
        createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(), 
      }
    });
  }

  findAll() {
    return this.prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  async update(id: string, dto: UpdateNewsDto) {
    try {
      const data: any = {
        title: dto.title,
        summary: dto.summary,
        content: dto.content,
        imageUrl: dto.imageUrl,
      };
      
      // Only update createdAt if it's provided
      if (dto.createdAt) {
        data.createdAt = new Date(dto.createdAt);
      }
      
      return await this.prisma.news.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`News with ID ${id} not found`);
      }
      throw error;
    }
  }
  
  async remove(id: string) {
    try {
      // Get the news item first to retrieve the image URL
      const news = await this.prisma.news.findUnique({ where: { id } });
      if (!news) {
        throw new NotFoundException(`News with ID ${id} not found`);
      }

      // Delete the news record
      const result = await this.prisma.news.delete({ where: { id } });
      
      // Delete the associated image file
      if (news.imageUrl) {
        await this.localStorageService.deleteImage(news.imageUrl);
      }
      
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`News with ID ${id} not found`);
      }
      throw error;
    }
  }
}