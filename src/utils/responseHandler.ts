//  response handler for express app to send consistent responses

import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

export const sendSuccess = (res: Response, data: any, message = "Success") => {
  res.status(200).json({
    status: "success",
    message,
    data,
  });
};

export const sendError = (res: Response, message = "Error", statusCode = StatusCodes.INTERNAL_SERVER_ERROR) => {
  res.status(statusCode).json({
    status: "error",
    message,
  });
};

