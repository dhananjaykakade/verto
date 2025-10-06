import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "@prisma/client";
import { sendError } from "../utils/responseHandler.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

/**
 * Global error handler middleware
 * Handles different types of errors and returns appropriate responses
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error({
    msg: 'Unhandled error',
    err: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return sendError(res, 'A record with this data already exists', StatusCodes.CONFLICT);
      case 'P2025':
        return sendError(res, 'Record not found', StatusCodes.NOT_FOUND);
      case 'P2003':
        return sendError(res, 'Foreign key constraint failed', StatusCodes.BAD_REQUEST);
      default:
        return sendError(res, 'Database error occurred', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    return sendError(res, 'Unknown database error occurred', StatusCodes.INTERNAL_SERVER_ERROR);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return sendError(res, 'Invalid data provided', StatusCodes.BAD_REQUEST);
  }

  // Handle custom application errors
  if (err.statusCode && err.message) {
    return sendError(res, err.message, err.statusCode);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return sendError(res, err.message, StatusCodes.BAD_REQUEST);
  }

  // Default error response
  const message = env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Something went wrong';
    
  return sendError(res, message, StatusCodes.INTERNAL_SERVER_ERROR);
};
