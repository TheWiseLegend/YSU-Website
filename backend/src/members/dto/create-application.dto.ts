import { IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  university: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  fieldOfStudy: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  yearOfStudy: number;

  @Type(() => Number)
  @IsInt()
  graduationYear: number;
}