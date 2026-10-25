import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import assert from 'node:assert/strict';
import { AppModule } from '../dist/app.module.js';
import { CourseService } from '../dist/course/course.service.js';
import { EnrollmentService } from '../dist/enrollment/enrollment.service.js';
import { NotificationService } from '../dist/notification/notification.service.js';
const app = await NestFactory.create(AppModule, { logger: false });
await app.init();
try {
 const api = request(app.getHttpServer());
 const cases = [["Get courses", "GET", "/course", null, 200, {"message": "All courses fetched", "data": []}], ["Get course", "GET", "/course/101", null, 200, {"message": "Course fetched", "id": "101"}], ["Create course", "POST", "/course", {"name": "NestJS", "code": "CS301"}, 201, {"message": "Course created", "data": {"name": "NestJS", "code": "CS301"}}], ["Get enrollments", "GET", "/enrollment", null, 200, {"message": "All enrollments fetched", "data": []}], ["Enroll student", "POST", "/enrollment", {"studentName": "John Doe", "courseId": "101"}, 201, null], ["Send notification", "POST", "/notification/send", {"studentName": "John Doe", "message": "Welcome!"}, 201, {"message": "Notification sent successfully", "student": "John Doe", "notification": "Welcome!"}], ["Check enrollment", "POST", "/notification/check", {"studentName": "John Doe", "courseId": "101"}, 201, null]];
 for (const [name, method, path, body, status, expected] of cases) {
  let req = api[method.toLowerCase()](path);
  if (body) req = req.send(body);
  const res = await req.expect(status);
  if (expected) assert.deepEqual(res.body, expected);
  if (name === 'Enroll student') {
   assert.deepEqual(res.body.course, { message: 'Course fetched', id: '101' });
   assert.deepEqual(res.body.notification, { message: 'Notification sent successfully', student: 'John Doe', notification: 'Successfully enrolled in course 101' });
  }
  if (name === 'Check enrollment') {
   assert.deepEqual(res.body.enrollments, { message: 'All enrollments fetched', data: [] });
   assert.equal(res.body.courseId, '101');
   assert.equal(res.body.notification.student, 'John Doe');
  }
  console.log('PASS', name);
 }
 const enrollment = app.get(EnrollmentService);
 const notification = app.get(NotificationService);
 assert.equal(enrollment.courseService, app.get(CourseService));
 assert.equal(enrollment.notificationService, notification);
 assert.equal(notification.enrollmentService, enrollment);
 console.log('PASS all three injected provider identities');
 console.log('7 endpoint checks + 3 DI identity assertions passed');
} finally { await app.close(); }
