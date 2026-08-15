import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';
import { CreateJobDto as ICreateJobDto } from '@url-checker/shared';

export class CreateJobDto implements ICreateJobDto {
  @IsArray({ message: 'urls must be an array of strings' })
  @ArrayMinSize(1, { message: 'urls array cannot be empty' })
  @IsString({ each: true, message: 'Each URL must be a string' })
  @IsNotEmpty({ each: true, message: 'URL cannot be an empty string' })
  urls!: string[];
}