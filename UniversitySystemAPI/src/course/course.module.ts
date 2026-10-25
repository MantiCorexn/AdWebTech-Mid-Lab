import { Module } from "@nestjs/common";
import { CourseController } from "./course.controller.js";
import { CourseService } from "./course.service.js";
@Module({
  imports: [],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
