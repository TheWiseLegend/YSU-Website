// src/union-team/dto/create-union-member.dto.ts
import {
    IsNotEmpty,
    IsString,
  } from 'class-validator';
  
  export class CreateUnionMemberDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsString()  
    @IsNotEmpty()
    position: string;
  
    @IsString()
    @IsNotEmpty()
    type: string;
  
    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsString()
    @IsNotEmpty()
    period: string
  }