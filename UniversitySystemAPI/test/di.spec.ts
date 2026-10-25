import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module.js";
import { CourseService } from "../src/course/course.service.js";
import { EnrollmentService } from "../src/enrollment/enrollment.service.js";
import { NotificationService } from "../src/notification/notification.service.js";
describe("Dependency injection", () => {
  it("delegates across both sides of the circular dependency", async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    try {
      const course = module.get(CourseService);
      const enrollment = module.get(EnrollmentService);
      const notification = module.get(NotificationService);
      const courseSpy = vi.spyOn(course, "getCourseById");
      const notifySpy = vi.spyOn(notification, "sendNotification");
      enrollment.enrollStudent("John Doe", "101");
      expect(courseSpy).toHaveBeenCalledWith("101");
      expect(notifySpy).toHaveBeenCalledWith(
        "John Doe",
        "Successfully enrolled in course 101",
      );
      const enrollmentSpy = vi.spyOn(enrollment, "getEnrollments");
      notification.checkEnrollmentAndNotify("John Doe", "101");
      expect(enrollmentSpy).toHaveBeenCalledOnce();
    } finally {
      await module.close();
    }
  });
});
