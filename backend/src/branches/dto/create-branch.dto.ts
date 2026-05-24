// src/branches/dto/create-branch.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  universityName: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  facebook?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  linkedin?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  establishedAt: string;
}