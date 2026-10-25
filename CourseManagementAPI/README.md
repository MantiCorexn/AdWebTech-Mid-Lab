# CourseManagementAPI

Lab Task 02 extends the existing Lab Task 01 project. The project name, course module, controller/service class names, method names, and `/course` routes are preserved.

## Run

Use Node.js 24 (tested with 24.22.1).

```bash
npm ci
npm run start:dev
```

API base URL: `http://localhost:3000`.

## Test

```bash
npm run test:lab02
npm test
npm run test:e2e
npm run lint
```

Verified: build and lint pass; 24 integration checks, 3 unit tests, and 1 existing end-to-end test pass. Integration checks exercise the compiled NestJS application through HTTP using Supertest, including validation and disk uploads. Upload fixtures check extension acceptance and byte preservation, not file-content authenticity.

## Postman (required by the lab)

Import `test/CourseManagementAPI.postman_collection.json`. Start the API first. The collection includes response-status assertions. Run the JSON requests and select actual local files in the upload requests' Body > form-data > `file` field. Select JPG/JPEG/PNG/PDF files for success, TXT/EXE files for rejection, and a PDF larger than 2 MB for the size rejection. The collection has been provided for manual Postman testing; Postman's GUI was not run here.

| Method | Route | Expected status |
| --- | --- | --- |
| GET | /course | 200 |
| GET | /course/5 | 200 |
| POST | /course | 201 |
| PUT | /course/5 | 200 |
| PATCH | /course/5 | 200 |
| DELETE | /course/5 | 200 |
| POST | /course/5/upload | 201 |

Example POST body:

```json
{
  "name": "NestJS Fundamentals",
  "code": "CS101",
  "instructor": "John Doe",
  "credits": 3
}
```

`description` is optional. Credits accept numbers or numeric strings and must be between 1 and 6. Required text is trimmed so whitespace-only input is rejected. Unknown JSON properties return 400. PUT and PATCH use UpdateCourseDto with PartialType as explicitly required by the PDF.

## Structure and assignment decisions

- `src/course/dto/create-course.dto.ts`: validation and transformation.
- `src/course/dto/update-course.dto.ts`: PartialType(CreateCourseDto).
- `src/course/course.controller.ts`: HTTP routes, DTO bodies, FileInterceptor, diskStorage, extension filter and 2 MB multer limit.
- `src/course/course.service.ts`: required JSON response objects and missing-file error.
- `src/course/course.module.ts`: controller/service wiring.
- `src/course/upload-exception.filter.ts`: converts oversized-upload responses to HTTP 400, as the assignment requires, instead of NestJS's default 413.
- `src/main.ts`: global ValidationPipe with whitelist, forbidNonWhitelisted and transform.
- `src/uploads/`: generated at runtime, excluded from Git. The returned upload path points to this actual location, following the PDF's project tree.

The detailed Step 4 JSON examples take precedence over the final architecture note mentioning response strings. GET returns an empty array and create/update/delete return demonstration responses, exactly as specified; this lab does not persist courses. Uploaded materials are saved to disk. Extension validation follows the assignment and does not inspect file signatures.

Faculty reference: https://github.com/Robinak47/awt_fall_26_26_Sec_A (NestJS sample-proj controller injection, DTO decorators, .js ESM imports and FileInterceptor patterns). The lab-specific singular `course` naming and required filenames take precedence over the reference's `users` naming.

## Upload to your GitHub repository

Replace the existing `CourseManagementAPI` folder in your local `AdWebTech-Mid-Lab` checkout with this folder. From the repository root:

```bash
git status
git add CourseManagementAPI
git commit -m "Complete Lab Task 02 validation and course material uploads"
git push origin main
```

Review `git status` before committing. No commit or push was performed during preparation. The unrelated root-level `course/` folder in the original repository was left unchanged.
