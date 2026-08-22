import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[SERVER ERROR]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  const code = err.code || 'ERR_INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    details: err.details || null,
  });
};
