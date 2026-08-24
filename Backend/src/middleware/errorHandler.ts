import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  console.error(`[Error] ${statusCode}: ${err.message}`);
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
};
