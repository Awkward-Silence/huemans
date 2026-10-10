import { z } from 'zod';
import { ZodValidationPipe } from './ZodValidationPipe';

export const UuidV7Param = new ZodValidationPipe(z.uuidv7());
