import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { NotFoundError } from '../../Domain/NotFoundError';

@Catch(NotFoundError)
export class NotFoundErrorFilter implements ExceptionFilter<NotFoundError> {
  catch(error: NotFoundError, host: ArgumentsHost): void {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.NOT_FOUND)
      .json({ statusCode: HttpStatus.NOT_FOUND, message: error.message });
  }
}
