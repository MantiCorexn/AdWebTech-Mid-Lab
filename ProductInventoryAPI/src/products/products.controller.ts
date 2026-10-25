import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { ProductsService } from "./products.service.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
import { UpdateProductDto } from "./dto/update-product.dto.js";
import { PartialUpdateProductDto } from "./dto/partial-update-product.dto.js";
import {
  SearchProductDto,
  CategoryProductDto,
} from "./dto/search-product.dto.js";
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post() create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
  @Get() findAll() {
    return this.productsService.findAll();
  }
  @Get("search") search(@Query() query: SearchProductDto) {
    return this.productsService.search(query.keyword);
  }
  @Get("category/:cat") findByCategory(@Param() params: CategoryProductDto) {
    return this.productsService.findByCategory(params.cat);
  }
  @Get(":id") findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
  @Patch(":id") update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: PartialUpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }
  @Put(":id") replace(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.replace(id, dto);
  }
  @Delete(":id") remove(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
  @Patch(":id/toggle") toggleActive(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.toggleActive(id);
  }
}
