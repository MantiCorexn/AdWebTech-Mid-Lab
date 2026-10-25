import { Type, Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateCourseDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  code: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  instructor: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(6)
  credits: number;

  @IsOptional()
  @IsString()
  description?: string;
}
