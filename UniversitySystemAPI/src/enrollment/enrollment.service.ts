import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { CourseService } from "../course/course.service.js";
import { NotificationService } from "../notification/notification.service.js";
// Alias prevents eager circular-class access in ESM decorator metadata.
// forwardRef still supplies the actual provider token.
type NotificationDependency = NotificationService;
@Injectable()
export class EnrollmentService {
  constructor(
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationDependency,
  ) {}
  enrollStudent(studentName: string, courseId: string) {
    const course = this.courseService.getCourseById(courseId);
    const notification = this.notificationService.sendNotification(
      studentName,
      `Successfully enrolled in course ${courseId}`,
    );
    return {
      message: "Student enrolled successfully",
      student: studentName,
      course,
      notification,
    };
  }
  getEnrollments() {
    return { message: "All enrollments fetched", data: [] };
  }
}
