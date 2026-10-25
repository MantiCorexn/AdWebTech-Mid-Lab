import { IsString, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";
export class SearchProductDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  keyword: string;
}
export class CategoryProductDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  cat: string;
}
