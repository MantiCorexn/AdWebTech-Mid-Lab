import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Products } from "./entities/products.entity.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
import { UpdateProductDto } from "./dto/update-product.dto.js";
import { PartialUpdateProductDto } from "./dto/partial-update-product.dto.js";
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepo: Repository<Products>,
  ) {}
  async create(dto: CreateProductDto) {
    const product = this.productsRepo.create({
      name: dto.name,
      price: dto.price,
      category: dto.category,
      description: dto.description ?? null,
      stock: dto.stock ?? 0,
      isActive: dto.isActive ?? true,
    });
    return {
      message: "Product created successfully",
      data: await this.productsRepo.save(product),
    };
  }
  async findAll() {
    const data = await this.productsRepo.find({
      order: { createdAt: "DESC", id: "DESC" },
    });
    return { message: "All products fetched", count: data.length, data };
  }
  async findOne(id: number) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);
    return { message: "Product fetched", data: product };
  }
  async update(id: number, dto: PartialUpdateProductDto) {
    const { data: product } = await this.findOne(id);
    // Null optional inputs leave existing non-nullable values unchanged.
    const fields = Object.fromEntries(
      Object.entries(dto).filter(
        ([key, value]) =>
          value !== undefined && (value !== null || key === "description"),
      ),
    );
    Object.assign(product, fields);
    return {
      message: "Product updated successfully",
      data: await this.productsRepo.save(product),
    };
  }
  async replace(id: number, dto: UpdateProductDto) {
    const { data: product } = await this.findOne(id);
    Object.assign(product, {
      name: dto.name,
      price: dto.price,
      category: dto.category,
      description: dto.description ?? null,
      stock: dto.stock ?? 0,
      isActive: dto.isActive ?? true,
    });
    return {
      message: "Product replaced successfully",
      data: await this.productsRepo.save(product),
    };
  }
  async remove(id: number) {
    const result = await this.productsRepo.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Product with id ${id} not found`);
    return { message: "Product deleted successfully", id };
  }
  async findByCategory(category: string) {
    const data = await this.productsRepo.find({
      where: { category },
      order: { createdAt: "DESC" },
    });
    return {
      message: "Products fetched by category",
      count: data.length,
      data,
    };
  }
  async search(keyword: string) {
    const data = await this.productsRepo.find({
      where: { name: ILike(`%${keyword}%`) },
      order: { createdAt: "DESC" },
    });
    return { message: "Search results fetched", count: data.length, data };
  }
  async toggleActive(id: number) {
    const { data: product } = await this.findOne(id);
    product.isActive = !product.isActive;
    return {
      message: "Product active status toggled",
      data: await this.productsRepo.save(product),
    };
  }
}
