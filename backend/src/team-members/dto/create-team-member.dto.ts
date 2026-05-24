import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsEmail,
  } from 'class-validator';
  
  export class CreateTeamMemberDto {
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
    @IsOptional()  
    branchId?: string;  
  }