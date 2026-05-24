// src/events/events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { LocalStorageService } from 'src/local-storage/local-storage.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private localStorageService: LocalStorageService
  ) {}


  create(dto: CreateEventDto) {
    return this.prisma.event.create({ 
      data: {
        ...dto,
        date: new Date(dto.date), 
      } 
    });
  }

  findAll() {
    return this.prisma.event.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    try {
      // Create a new object without the date property initially
      const { date, ...restData } = dto;
      
      // Then add the date if it exists, converted to a Date object
      const data = {
        ...restData,
        ...(date && { date: new Date(date) })
      };
      
      return await this.prisma.event.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Get the event first to retrieve the image URL
      const event = await this.prisma.event.findUnique({ where: { id } });
      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      // Delete the event record
      const result = await this.prisma.event.delete({ where: { id } });
      
      // Delete the associated image file
      if (event.imageUrl) {
        await this.localStorageService.deleteImage(event.imageUrl);
      }
      
      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }
      throw error;
    }
  }
}