// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable()
export class UploadService {
  constructor(private readonly localStorageService: LocalStorageService) {}

  async uploadSingleImage(file: Express.Multer.File, path: string = 'images'): Promise<string> {
    return await this.localStorageService.uploadImage(file, path);
  }

  async uploadMultipleImages(files: Express.Multer.File[], path: string = 'images'): Promise<string[]> {
    return await this.localStorageService.uploadMultipleImages(files, path);
  }

  async deleteImage(imageUrl: string): Promise<void> {
    return await this.localStorageService.deleteImage(imageUrl);
  }

  async replaceImage(oldImageUrl: string, newFile: Express.Multer.File): Promise<string> {
    // Extract folder from the old image URL
    const folder = this.localStorageService.extractFolderFromUrl(oldImageUrl);
    return await this.localStorageService.replaceImage(oldImageUrl, newFile, folder);
  }
}