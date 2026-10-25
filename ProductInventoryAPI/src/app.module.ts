import "dotenv/config";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsModule } from "./products/products.module.js";
@Module({
  imports: [
    ProductsModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? "postgres",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE ?? "product_inventory_db",
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== "production",
    }),
  ],
})
export class AppModule {}
