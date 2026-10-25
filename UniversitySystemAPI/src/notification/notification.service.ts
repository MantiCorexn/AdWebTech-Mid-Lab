import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { EnrollmentService } from "../enrollment/enrollment.service.js";
// Alias keeps circular provider metadata lazy under ESM.
type EnrollmentDependency = EnrollmentService;
@Injectable()
export class NotificationService {
  constructor(
    @Inject(forwardRef(() => EnrollmentService))
    private readonly enrollmentService: EnrollmentDependency,
  ) {}
  sendNotification(studentName: string, message: string) {
    return {
      message: "Notification sent successfully",
      student: studentName,
      notification: message,
    };
  }
  checkEnrollmentAndNotify(studentName: string, courseId: string) {
    const enrollments = this.enrollmentService.getEnrollments();
    return {
      message: "Enrollment check completed",
      student: studentName,
      courseId,
      enrollments,
      notification: this.sendNotification(
        studentName,
        `Enrollment check completed for course ${courseId}`,
      ),
    };
  }
}
