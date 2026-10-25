import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  PayloadTooLargeException,
} from '@nestjs/common';
import type { Response } from 'express';

// The lab explicitly requires HTTP 400 for files exceeding 2 MB.
@Catch(PayloadTooLargeException)
export class UploadExceptionFilter implements ExceptionFilter {
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost) {
    host.switchToHttp().getResponse<Response>().status(400).json({
      statusCode: 400,
      message: 'File must not exceed 2MB',
      error: 'Bad Request',
    });
  }
}
