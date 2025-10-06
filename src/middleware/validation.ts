import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/responseHandler.js';
import { logger } from '../config/logger.js';

/**
 * Middleware to validate request body using Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn({ msg: 'Validation error', errors: errorMessages, body: req.body });
        
        return sendError(
          res,
          `Validation failed: ${errorMessages.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`,
          StatusCodes.BAD_REQUEST
        );
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate request params using Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      req.params = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn({ msg: 'Params validation error', errors: errorMessages, params: req.params });
        
        return sendError(
          res,
          `Parameter validation failed: ${errorMessages.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`,
          StatusCodes.BAD_REQUEST
        );
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate request query using Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn({ msg: 'Query validation error', errors: errorMessages, query: req.query });
        
        return sendError(
          res,
          `Query validation failed: ${errorMessages.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`,
          StatusCodes.BAD_REQUEST
        );
      }
      next(error);
    }
  };
};
