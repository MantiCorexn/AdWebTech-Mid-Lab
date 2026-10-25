# UniversitySystemAPI

Standalone Lab Task 03: Dependency Injection in NestJS. Keep this folder beside CourseManagementAPI; do not replace Task 2.

## Run in VS Code

Open this folder. Stop Task 2's server with Ctrl+C before starting this project, since both use port 3000.

```bash
npm ci
npm run test:lab03
npm test
npm run test:e2e
npm run lint
npm run start:dev
```

Use Node.js 24 (the version used for verification).

## Postman

Import `test/UniversitySystemAPI.postman_collection.json`. Leave the server running, expand the collection, and send each request. JSON bodies and response assertions are already included. GET requests return 200; POST requests return 201. Manual Postman execution must be done locally; automated tests use Supertest.

| Method | Route | Body |
| --- | --- | --- |
| GET | /course | None |
| GET | /course/101 | None |
| POST | /course | {"name":"NestJS","code":"CS301"} |
| GET | /enrollment | None |
| POST | /enrollment | {"studentName":"John Doe","courseId":"101"} |
| POST | /notification/send | {"studentName":"John Doe","message":"Welcome!"} |
| POST | /notification/check | {"studentName":"John Doe","courseId":"101"} |

The enrollment response includes the CourseService result and notification confirmation. The check response includes the EnrollmentService result.

## Structure and explanation

Each of `src/course`, `src/enrollment`, and `src/notification` has its matching module, controller, and service. AppModule imports all three modules.

- Intra-module: CourseController receives CourseService through its constructor. CourseModule registers that provider.
- Inter-module: CourseModule exports CourseService; EnrollmentModule imports CourseModule. EnrollmentService uses the injected CourseService.
- Circular: EnrollmentModule and NotificationModule import each other through forwardRef. Both services use @Inject(forwardRef(...)) in their constructors and are exported by their own modules.
- Controllers only delegate requests. Services build the response objects. No service is created manually with new.

The faculty reference uses ESM and `.js` imports, which are retained. For circular constructor parameters, a TypeScript alias prevents eager decorator metadata from accessing a class before its ESM initialization. The forwardRef injection token still references the required class on both sides.

The PDF's EnrollmentModule prose says to export NotificationService, but its example correctly exports EnrollmentService. This project follows the example so NotificationService can inject EnrollmentService.

This is the specified DI demonstration: course and enrollment list methods return empty arrays. It does not persist records, genuinely verify course existence/enrollment membership, or send real notifications. The notification check calls getEnrollments as required and reports that the check completed without claiming a student was found.

## Verification

`npm run test:lab03` builds and tests all seven HTTP endpoints against the compiled application, then asserts the identities of three injected dependencies. The unit test spies on cross-service calls in both directions. The end-to-end test verifies the full module graph boots and serves requests.

## GitHub

Place UniversitySystemAPI alongside CourseManagementAPI inside AdWebTech-Mid-Lab. From the repository root:

```bash
git status
git add UniversitySystemAPI
git commit -m "Complete Lab Task 03 dependency injection"
git push origin main
```

Do not upload node_modules or dist. No commit or push has been performed here.
