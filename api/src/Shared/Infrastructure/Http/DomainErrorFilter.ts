import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { InvalidArgumentError } from '../../Domain/InvalidArgumentError';

@Catch(InvalidArgumentError)
export class DomainErrorFilter implements ExceptionFilter<InvalidArgumentError> {
  catch(error: InvalidArgumentError, host: ArgumentsHost): void {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.BAD_REQUEST)
      .json({ statusCode: HttpStatus.BAD_REQUEST, message: error.message });
  }
}
