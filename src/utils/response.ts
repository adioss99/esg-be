import { Response } from 'express';
export const validateResponse = (res: Response, val: any) => {
  return res.status(400).json({
    success: false,
    message: val.error.issues.map((err: { path: any[]; message: any; }) => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  });
};
