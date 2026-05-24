import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGalleryDto, UpdateGalleryDto } from './dto';
import { LocalStorageService } from 'src/local-storage/local-storage.service';

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private localStorageService: LocalStorageService
  ) {}

  async create(dto: CreateGalleryDto) {
    const { images, ...galleryData } = dto;

    // Create gallery with nested images
    return this.prisma.gallery.create({
      data: {
        ...galleryData,
        images: images ? {
          create: images
        } : undefined
      },
      include: {
        images: true
      }
    });
  }

  findAll() {
    return this.prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          select: {
            id: true,
            url: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const gallery = await this.prisma.gallery.findUnique({
      where: { id },
      include: {
        images: true
      }
    });

    if (!gallery) {
      throw new NotFoundException(`Gallery album with ID ${id} not found`);
    }

    return gallery;
  }

  async update(id: string, dto: UpdateGalleryDto) {
    try {
      const { images, ...galleryData } = dto;
      
      // First check if the gallery exists
      const existingGallery = await this.prisma.gallery.findUnique({
        where: { id },
        include: { images: true }
      });
      
      if (!existingGallery) {
        throw new NotFoundException(`Gallery album with ID ${id} not found`);
      }
      
      // Update the gallery data 
      const updatedGallery = await this.prisma.gallery.update({
        where: { id },
        data: galleryData,
      });
      
      // If images are provided, handle them separately
      if (images && images.length > 0) {
        // Add new images
        await this.prisma.galleryImage.createMany({
          data: images.map(image => ({
            url: image.url,
            galleryId: id
          }))
        });
      }
      
      // Return the updated gallery with images
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Gallery album with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Get the gallery with all images first
      const gallery = await this.prisma.gallery.findUnique({
        where: { id },
        include: { images: true }
      });
      
      if (!gallery) {
        throw new NotFoundException(`Gallery album with ID ${id} not found`);
      }
      
      // Delete the gallery record 
      const result = await this.prisma.gallery.delete({ where: { id } });
      
      // Delete the main image file
      if (gallery.mainImage) {
        await this.localStorageService.deleteImage(gallery.mainImage);
      }
      
      // Delete all gallery image files
      for (const image of gallery.images) {
        if (image.url) {
          await this.localStorageService.deleteImage(image.url);
        }
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Gallery album with ID ${id} not found`);
      }
      throw error;
    }
  }
  
  // Additional method to add an image to a gallery
  async addImage(galleryId: string, imageUrl: string) {
    try {
      // Check if the gallery exists
      const gallery = await this.prisma.gallery.findUnique({
        where: { id: galleryId }
      });
      
      if (!gallery) {
        throw new NotFoundException(`Gallery album with ID ${galleryId} not found`);
      }
      
      // Create a new gallery image
      return this.prisma.galleryImage.create({
        data: {
          url: imageUrl,
          galleryId
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
  
  // Additional method to remove an image from a gallery
  async removeImage(imageId: string) {
    try {
      // Get the image first to retrieve the URL
      const image = await this.prisma.galleryImage.findUnique({
        where: { id: imageId }
      });
      
      if (!image) {
        throw new NotFoundException(`Gallery image with ID ${imageId} not found`);
      }
      
      // Delete the image record
      const result = await this.prisma.galleryImage.delete({
        where: { id: imageId }
      });
      
      // Delete the image file
      if (image.url) {
        await this.localStorageService.deleteImage(image.url);
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Gallery image with ID ${imageId} not found`);
      }
      throw error;
    }
  }
}