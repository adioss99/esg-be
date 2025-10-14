import prisma from '../lib/prisma';
import { Request, Response } from 'express';

export const getTotalProduct = async (_req: Request, res: Response) => {
  try {
    const [completed, pending, cancelled] = await Promise.all([
      prisma.productionOrder.count({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.productionOrder.count({
        where: {
          status: 'PENDING',
          createdAt: { gt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.productionOrder.count({
        where: {
          status: 'CANCELLED',
          createdAt: { gt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ]);
    res.status(200).json({ success: true, data: { completed, pending, cancelled } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getQcInspection = async (_req: Request, res: Response) => {
  try {
    const [passedCount, failedCount] = await Promise.all([
      prisma.qCInspection.count({
        where: {
          passed: true,
          createdAt: { gt: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.qCInspection.count({
        where: {
          passed: false,
          createdAt: {
            gt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);
    res.status(200).json({ success: true, data: { passedCount, failedCount } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTotalUser = async (_req: Request, res: Response) => {
  try {
    const [admin, qc, operator] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'ADMIN',
        },
      }),
      prisma.user.count({ where: { role: 'QC' } }),
      prisma.user.count({ where: { role: 'OPERATOR' } }),
    ]);

    res.status(200).json({ success: true, data: { admin, qc, operator } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
