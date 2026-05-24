// src/upload/dto/upload-image.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @IsOptional()
  path?: string;
}

export class UploadImageResponseDto {
  imageUrl: string;
  message: string;
}

export class UploadImagesResponseDto {
  imageUrls: string[];
  message: string;
}