import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import assert from 'node:assert/strict';
import { unlink, readFile } from 'node:fs/promises';
import { AppModule } from '../dist/app.module.js';
const app = await NestFactory.create(AppModule, { logger: false });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
await app.init();
let count = 0;
try {
 const api = request(app.getHttpServer());
 const cases = [["Get all", "GET", "/course", null, 200], ["Get by ID", "GET", "/course/5", null, 200], ["Create", "POST", "/course", {"name": "NestJS Fundamentals", "code": "CS101", "instructor": "John Doe", "credits": 3}, 201], ["Update", "PUT", "/course/5", {"name": "NestJS Advanced", "code": "CS201"}, 200], ["Patch", "PATCH", "/course/5", {"name": "Advanced", "credits": 4}, 200], ["Delete", "DELETE", "/course/5", null, 200], ["Empty name", "POST", "/course", {"name": "", "code": "CS101", "instructor": "John Doe", "credits": 3}, 400], ["Blank name", "POST", "/course", {"name": "   ", "code": "CS101", "instructor": "John Doe", "credits": 3}, 400], ["Credits above maximum", "POST", "/course", {"name": "NestJS Fundamentals", "code": "CS101", "instructor": "John Doe", "credits": 10}, 400], ["Credits below minimum", "POST", "/course", {"name": "NestJS Fundamentals", "code": "CS101", "instructor": "John Doe", "credits": 0}, 400], ["Unknown field", "POST", "/course", {"name": "NestJS Fundamentals", "code": "CS101", "instructor": "John Doe", "credits": 3, "extra": true}, 400], ["Invalid credit type", "POST", "/course", {"name": "NestJS Fundamentals", "code": "CS101", "instructor": "John Doe", "credits": "abc"}, 400], ["Missing fields", "POST", "/course", {}, 400], ["Numeric string", "POST", "/course", {"name": "NestJS Fundamentals", "code": "CS101", "instructor": "John Doe", "credits": "3"}, 201], ["Invalid patch", "PATCH", "/course/5", {"credits": 10}, 400], ["Invalid put", "PUT", "/course/5", {"name": ""}, 400]];
 for (const [name, method, path, body, status] of cases) {
   let req = api[method.toLowerCase()](path);
   if (body !== null) req = req.send(body);
   const res = await req.expect(status);
   if (status < 400) assert.equal(typeof res.body.message, 'string');
   if (name === 'Numeric string') assert.equal(res.body.data.credits, 3);
   if (name === 'Patch') assert.deepEqual(res.body.updatedFields, ['name', 'credits']);
   if (name === 'Get all') assert.deepEqual(res.body.data, []);
   console.log('PASS', name); count++;
 }
 for (const extension of ['pdf', 'jpg', 'jpeg', 'png']) {
   const content = Buffer.from('Lab upload fixture');
   const res = await api.post('/course/5/upload').attach('file', content, `notes.${extension}`).expect(201);
   assert.equal(res.body.courseId, '5');
   assert.deepEqual(await readFile(res.body.path), content);
   await unlink(res.body.path);
   console.log('PASS upload', extension); count++;
 }
 for (const extension of ['txt', 'exe']) {
   await api.post('/course/5/upload').attach('file', Buffer.from('invalid'), `notes.${extension}`).expect(400);
   console.log('PASS reject', extension); count++;
 }
 await api.post('/course/5/upload').attach('file', Buffer.alloc(2 * 1024 * 1024 + 1), 'large.pdf').expect(400); count++;
 await api.post('/course/5/upload').expect(400); count++;
 console.log(`${count} integration checks passed`);
} finally { await app.close(); }
