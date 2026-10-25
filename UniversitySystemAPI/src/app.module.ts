import { Module } from "@nestjs/common";
import { CourseModule } from "./course/course.module.js";
import { EnrollmentModule } from "./enrollment/enrollment.module.js";
import { NotificationModule } from "./notification/notification.module.js";
@Module({ imports: [CourseModule, EnrollmentModule, NotificationModule] })
export class AppModule {}
