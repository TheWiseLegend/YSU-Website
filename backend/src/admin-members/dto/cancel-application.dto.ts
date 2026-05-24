import { IsNotEmpty, IsString } from 'class-validator';

export class CancelApplicationDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}