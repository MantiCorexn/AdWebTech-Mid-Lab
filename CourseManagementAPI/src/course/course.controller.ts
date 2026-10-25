import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { basename, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { CourseService } from './course.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { UploadExceptionFilter } from './upload-exception.filter.js';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  getAllCourses() {
    return this.courseService.getAllCourses();
  }

  @Get(':id')
  getCourseById(@Param('id') id: string) {
    return this.courseService.getCourseById(id);
  }

  @Post()
  createCourse(@Body() dto: CreateCourseDto) {
    return this.courseService.createCourse(dto);
  }

  @Put(':id')
  updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.courseService.updateCourse(id, dto);
  }

  @Patch(':id')
  patchCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.courseService.patchCourse(id, dto);
  }

  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    return this.courseService.deleteCourse(id);
  }

  @Post(':id/upload')
  @UseFilters(UploadExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './src/uploads',
        filename: (_req, file, callback) => {
          const safeName = basename(file.originalname).replace(
            /[^a-zA-Z0-9._-]/g,
            '_',
          );
          callback(null, `${Date.now()}-${randomUUID()}-${safeName}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!/\.(jpg|jpeg|png|pdf)$/i.test(extname(file.originalname))) {
          return callback(
            new BadRequestException(
              'Only .jpg, .jpeg, .png and .pdf files are allowed',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadCourseMaterial(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.courseService.uploadCourseMaterial(id, file);
  }
}
