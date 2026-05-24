import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsArray,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreateGalleryImageDto {
    @IsString()
    @IsNotEmpty()
    url: string;
  }
  
  export class CreateGalleryDto {
    @IsString()
    @IsNotEmpty()
    title: string;
  
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsString()
    @IsNotEmpty()
    mainImage: string;
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateGalleryImageDto)
    @IsOptional()
    images?: CreateGalleryImageDto[];
  }