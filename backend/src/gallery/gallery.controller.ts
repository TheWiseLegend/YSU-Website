// src/gallery/gallery.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  HttpStatus, 
  HttpCode,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto, UpdateGalleryDto } from './dto';
import { Admin } from '../admin-auth/decorator/admin.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  @Admin()
  create(@Body() dto: CreateGalleryDto) {
    return this.galleryService.create(dto);
  }

  @Get()
  @Public()
  findAll() {
    return this.galleryService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Put(':id')
  @Admin()
  update(@Param('id') id: string, @Body() dto: UpdateGalleryDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  @Admin()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.galleryService.remove(id);
  }
  
  @Post(':galleryId/images')
  @Admin()
  addImage(
    @Param('galleryId') galleryId: string,
    @Body('url') imageUrl: string
  ) {
    return this.galleryService.addImage(galleryId, imageUrl);
  }
  
  @Delete('images/:imageId')
  @Admin()
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeImage(@Param('imageId') imageId: string) {
    await this.galleryService.removeImage(imageId);
  }
}