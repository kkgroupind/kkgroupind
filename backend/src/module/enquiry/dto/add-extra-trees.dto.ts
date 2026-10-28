import { IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class AddExtraTreesDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(1000)
  extraTrees: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
