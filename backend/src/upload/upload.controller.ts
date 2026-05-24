// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  Delete,
  BadRequestException,
  Req,
  InternalServerErrorException,
  Body,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { Admin } from '../admin-auth/decorator/admin.decorator';

interface CustomFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @Admin()
  async uploadImage(@Req() req: any) {
    try {
      // Parse multipart data to get both file and fields
      const parts = req.parts();
      let fileData: CustomFile | null = null;
      let path = 'images';
      
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'files') {
          const fileBuffer = await part.toBuffer();
          fileData = {
            fieldname: part.fieldname,
            originalname: part.filename,
            encoding: part.encoding,
            mimetype: part.mimetype,
            size: fileBuffer.length,
            buffer: fileBuffer,
          };
        } else if (part.type === 'field' && part.fieldname === 'path') {
          path = part.value || 'images';
        }
      }
      
      if (!fileData) {
        throw new BadRequestException('No file uploaded');
      }
      
      // Validate file type
      if (!fileData.mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed');
      }
      
      // Convert to Express.Multer.File interface
      const multerFile: Express.Multer.File = Object.assign(fileData, {
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      });
      
      const imageUrl = await this.uploadService.uploadSingleImage(multerFile, path);
      
      return {
        imageUrl,
        message: 'Image uploaded successfully',
      };
    } catch (error) {
      console.error("Upload error:", error.message);
      throw new InternalServerErrorException(`Upload failed: ${error.message}`);
    }
  }

  @Post('images')
  @Admin()
  async uploadImages(@Req() req: any) {
    try {
      const files: Express.Multer.File[] = [];
      
      const parts = req.parts();
      if (!parts) {
        throw new BadRequestException('No files uploaded');
      }

      let path = 'images';
      
      for await (const part of parts) {
        if (part.fieldname === 'files' && part.type === 'file') {
          const buffer = await part.toBuffer();
          const fileObject: CustomFile = {
            fieldname: part.fieldname,
            originalname: part.filename,
            encoding: part.encoding,
            mimetype: part.mimetype,
            size: buffer.length,
            buffer: buffer,
          };

          const multerFile: Express.Multer.File = Object.assign(fileObject, {
            stream: null as any,
            destination: '',
            filename: '',
            path: '',
          });

          files.push(multerFile);
        } else if (part.fieldname === 'path' && part.type === 'field') {
          path = part.value || 'images';
        }
      }

      if (files.length === 0) {
        throw new BadRequestException('No files uploaded');
      }

      // Validate all files are images
      for (const file of files) {
        if (!file.mimetype.startsWith('image/')) {
          throw new BadRequestException(`File ${file.originalname} is not an image`);
        }
      }
      
      const imageUrls = await this.uploadService.uploadMultipleImages(files, path);
      
      return {
        imageUrls,
        message: `${imageUrls.length} images uploaded successfully`,
      };
    } catch (error) {
      console.error("Multiple upload error:", error.message);
      throw new InternalServerErrorException(`Upload failed: ${error.message}`);
    }
  }

  @Delete('image')
  @Admin()
  async deleteImage(@Body() body: { imageUrl: string }) {
    try {
      if (!body.imageUrl) {
        throw new BadRequestException('Image URL is required');
      }

      await this.uploadService.deleteImage(body.imageUrl);
      
      return {
        message: 'Image deleted successfully',
      };
    } catch (error) {
      console.error("Delete error:", error.message);
      throw new InternalServerErrorException(`Delete failed: ${error.message}`);
    }
  }

  @Post('image/replace')
  @Admin()
  async replaceImage(@Req() req: any) {
    try {
      // Parse multipart data to get both file and fields
      const parts = req.parts();
      let fileData: CustomFile | null = null;
      let oldImageUrl = '';
      
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'files') {
          const fileBuffer = await part.toBuffer();
          fileData = {
            fieldname: part.fieldname,
            originalname: part.filename,
            encoding: part.encoding,
            mimetype: part.mimetype,
            size: fileBuffer.length,
            buffer: fileBuffer,
          };
        } else if (part.type === 'field' && part.fieldname === 'oldImageUrl') {
          oldImageUrl = part.value;
        }
      }
      
      if (!fileData) {
        throw new BadRequestException('No file uploaded');
      }

      if (!oldImageUrl) {
        throw new BadRequestException('Old image URL is required');
      }
      
      // Validate file type
      if (!fileData.mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image files are allowed');
      }
      
      // Convert to Express.Multer.File interface
      const multerFile: Express.Multer.File = Object.assign(fileData, {
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      });
      
      const imageUrl = await this.uploadService.replaceImage(oldImageUrl, multerFile);
      
      return {
        imageUrl,
        message: 'Image replaced successfully',
      };
    } catch (error) {
      console.error("Replace error:", error.message);
      throw new InternalServerErrorException(`Replace failed: ${error.message}`);
    }
  }
}