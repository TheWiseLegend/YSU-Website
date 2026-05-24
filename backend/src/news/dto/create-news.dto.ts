import {
  IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
  } from 'class-validator';
  

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsDateString()
  @IsOptional()
  createdAt?: string;
}
