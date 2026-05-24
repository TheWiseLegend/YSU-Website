import {
    IsNotEmpty,
    IsString,
    IsDateString,
  } from 'class-validator';
  
  export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;
  
    @IsString()
    @IsNotEmpty()
    description: string;
  
    @IsDateString()
    @IsNotEmpty()
    date: string;
  
    @IsString()
    @IsNotEmpty()
    location: string;
  
    @IsString()
    @IsNotEmpty()
    imageUrl: string;
  }