import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { newDb, DataType } from 'pg-mem';
import request from 'supertest';
import assert from 'node:assert/strict';
import { Products } from '../dist/products/entities/products.entity.js';
import { ProductsModule } from '../dist/products/products.module.js';
const real = process.argv.includes('--postgres');
let source;
if(real) {
 if (!process.env.TEST_DB_DATABASE || process.env.TEST_DB_DATABASE === (process.env.DB_DATABASE ?? 'product_inventory_db')) throw new Error('Set TEST_DB_DATABASE to a separate empty test database.');
 source = new DataSource({type:'postgres',host:process.env.DB_HOST ?? 'localhost',port:Number(process.env.DB_PORT ?? 5432),username:process.env.DB_USERNAME ?? 'postgres',password:process.env.DB_PASSWORD,database:process.env.TEST_DB_DATABASE,entities:[Products],synchronize:true});
} else {
 const db=newDb();
 db.public.registerFunction({name:'quote_ident',args:[DataType.text],returns:DataType.text,implementation:x=> '"'+x.replaceAll('"','""')+'"'});
 db.public.registerFunction({name:'obj_description',args:[DataType.regclass,DataType.text],returns:DataType.text,implementation:()=>null});
 db.public.registerFunction({name:'current_database',returns:DataType.text,implementation:()=> 'test'});
 db.public.registerFunction({name:'version',returns:DataType.text,implementation:()=> 'PostgreSQL 16.0'});
 source=db.adapters.createTypeormDataSource({type:'postgres',entities:[Products],synchronize:true});
}
await source.initialize();
const repo=source.getRepository(Products);
if(await repo.count()) {await source.destroy();throw new Error('Test database must contain no products. Existing data was left unchanged.');}
const module=await Test.createTestingModule({imports:[TypeOrmModule.forRootAsync({useFactory:()=>({type:'postgres'}),dataSourceFactory:async()=>source}),ProductsModule]}).compile();
const app=module.createNestApplication();
app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
await app.init();
const api=request(app.getHttpServer());
const ids=[]; let count=0;
async function check(method,path,body,status) {
 let req=api[method](path);if(body !== undefined) req=req.send(body);
 const res=await req.expect(status);count++;return res.body;
}
try {
 for(const body of [
 {name:'iPhone 15',price:999.99,stock:50,category:'Electronics'},
 {name:'Samsung TV',price:499.99,stock:20,category:'Electronics'},
 {name:'Running Shoes',price:89.99,stock:100,category:'Sports'},
 {name:'Notebook',price:4.99,stock:200,category:'Stationery'}]) {
 const res=await check('post','/products',body,201);ids.push(res.data.id);assert.equal(res.data.name,body.name);assert.equal(res.data.price,body.price);
 }
 const url=`/products/${ids[0]}`;
 let res=await check('get','/products',undefined,200);assert.equal(res.count,4);assert.deepEqual(res.data.map(x=>x.id),[...ids].reverse());
 await check('get',url,undefined,200);await check('get','/products/99999999',undefined,404);
 res=await check('get','/products/category/Electronics',undefined,200);assert.equal(res.count,2);
 res=await check('get','/products/search?keyword=PHONE',undefined,200);assert.equal(res.data[0].name,'iPhone 15');
 res=await check('get','/products/search?keyword=s',undefined,200);assert.equal(res.count,2);
 res=await check('patch',url,{price:899.99,stock:45},200);assert.equal(res.data.name,'iPhone 15');assert.equal(res.data.price,899.99);
 await check('patch',url,{name:''},400);
 await check('patch',url,{description:'Old description',isActive:false},200);
 res=await check('put',url,{name:'iPhone 15 Pro',price:1099.99,stock:30,category:'Electronics'},200);assert.equal(res.data.description,null);assert.equal(res.data.isActive,true);
 await check('put',url,{price:799.99},400);
 res=await check('patch',url+'/toggle',undefined,200);assert.equal(res.data.isActive,false);
 res=await check('patch',url+'/toggle',undefined,200);assert.equal(res.data.isActive,true);
 await check('delete',`/products/${ids[3]}`,undefined,200);await check('delete',`/products/${ids[3]}`,undefined,404);
 res=await check('get','/products',undefined,200);assert.equal(res.count,3);
 const valid={name:'Valid',price:10,category:'Test'};
 for(const body of [{price:5,category:'Test'},{...valid,price:-5},{...valid,unknown:true},{},{...valid,stock:-1},{...valid,stock:1.5},{...valid,isActive:'true'},{...valid,name:'   '},{...valid,price:1.234},{...valid,price:100000000}]) await check('post','/products',body,400);
 await check('post','/products',undefined,400);
 await check('get','/products/not-a-number',undefined,400);
 await check('get','/products/search',undefined,400);
 await check('get','/products/search?keyword=',undefined,400);
 await check('patch','/products/99999999',{price:10},404);
 await check('put','/products/99999999',valid,404);
 await check('patch','/products/99999999/toggle',undefined,404);
 await check('patch',url,{name:null},400);
 res=await check('post','/products',{...valid,price:'12.50'},201);ids.push(res.data.id);assert.equal(res.data.price,12.5);assert.equal(res.data.stock,0);assert.equal(res.data.isActive,true);
 assert.ok(res.data.createdAt);assert.ok(res.data.updatedAt);
 console.log(`${count} HTTP checks passed (${real?'real PostgreSQL':'pg-mem PostgreSQL emulator'}).`);
} finally {
 for(const id of ids) await repo.delete(id);
 await app.close();
}
