// src/local-storage/local-storage.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';

@Injectable()
export class LocalStorageService {
  private uploadsPath: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    // Use absolute path for uploads
    const uploadsBasePath = this.configService.get('UPLOADS_PATH', '/var/www/uploads');
    this.uploadsPath = path.join(uploadsBasePath, 'assets');
    this.baseUrl = this.configService.get('BASE_URL', 'http://localhost:3333');
    
    // Ensure upload directories exist
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    const folders = ['news', 'events', 'gallery', 'branches', 'union-team', 'membership', 'vendors', 'profile-photos'];
    
    // Create the main assets directory if it doesn't exist
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
    
    folders.forEach(folder => {
      const folderPath = path.join(this.uploadsPath, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    });
    
    console.log('Upload directories ensured at:', this.uploadsPath);
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'images',
  ): Promise<string> {
    // Validate folder name
    const allowedFolders = ['news', 'events', 'gallery', 'branches', 'union-team', 'membership', 'vendors', 'profile-photos', 'images'];
    const targetFolder = allowedFolders.includes(folder) ? folder : 'images';
    
    // Ensure folder exists
    const folderPath = path.join(this.uploadsPath, targetFolder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Convert to WebP if not already
    const isWebP = file.mimetype === 'image/webp';
    let processedBuffer = file.buffer;

    if (!isWebP) {
      processedBuffer = await sharp(file.buffer)
        .webp({ quality: 85 })
        .toBuffer();
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const filename = `${timestamp}_${originalName}.webp`;
    const filePath = path.join(folderPath, filename);

    // Save file
    fs.writeFileSync(filePath, processedBuffer);

    // Return public URL
    const publicUrl = `${this.baseUrl}/assets/${targetFolder}/${filename}`;
    return publicUrl;
  }

  async uploadDocument(
    file: Express.Multer.File,
    folder: string = 'membership',
  ): Promise<string> {
    const folderPath = path.join(this.uploadsPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname) || '.pdf';
    const filename = `${timestamp}_${originalName}${ext}`;
    const filePath = path.join(folderPath, filename);

    fs.writeFileSync(filePath, file.buffer);

    return `${this.baseUrl}/assets/${folder}/${filename}`;
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'images',
  ): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlPath = new URL(imageUrl);
      const relativePath = urlPath.pathname.replace('/assets/', '');
      const fullPath = path.join(this.uploadsPath, relativePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${fullPath}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async replaceImage(
    oldImageUrl: string,
    newFile: Express.Multer.File,
    folder: string = 'images',
  ): Promise<string> {
    // Delete the old image first
    await this.deleteImage(oldImageUrl);
    
    // Upload the new image
    return this.uploadImage(newFile, folder);
  }

  // Helper method to extract folder from URL
  extractFolderFromUrl(imageUrl: string): string {
    try {
      const urlPath = new URL(imageUrl);
      const pathSegments = urlPath.pathname.split('/');
      const assetsIndex = pathSegments.indexOf('assets');
      
      if (assetsIndex !== -1 && pathSegments[assetsIndex + 1]) {
        return pathSegments[assetsIndex + 1];
      }
      
      return 'images';
    } catch (error) {
      return 'images'; 
    }
  }
}