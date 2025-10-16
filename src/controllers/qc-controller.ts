import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { qcSchema } from '../validators/qc-validator';
import { validateResponse } from '../utils/response';
import { Prisma } from '@prisma/client';
import { generateQCReport } from '../lib/pdf';

export const createQC = async (req: any, res: Response) => {
  try {
    const { productionId } = req.params;
    let { passed, notes } = req.body;
    passed = passed === 'true' ? true : false;
    const val = qcSchema({ passed, notes });
    if (!val.success) {
      return validateResponse(res, val);
    }
    const prodId = Number(productionId);
    const existingInspection = await prisma.qCInspection.findFirst({
      where: {
        productionId: prodId,
        passed: true,
        production: {
          status: { not: 'COMPLETED' },
        },
      },
      include: {
        production: true,
      },
    });

    if (existingInspection) {
      return res.status(400).json({ sucess: false, message: 'QC record already approved.' });
    }

    const qc = await prisma.qCInspection.create({
      data: {
        productionId: prodId,
        inspectorId: req.user.id,
        passed,
        notes,
      },
    });

    if (passed) {
      await prisma.productionOrder.update({
        where: { id: prodId },
        data: { status: 'COMPLETED' },
      });
    }

    res.status(201).json({ success: true, message: qc });
  } catch (err: any) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference number',
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const exportQCReport = async (req: Request, res: Response) => {
  try {
    const { referenceNo } = req.params;

    const order = await prisma.productionOrder.findFirst({
      where: { referenceNo, status: 'COMPLETED' },
      include: {
        createdByUser: true,
        qcInspections: {
          orderBy: { createdAt: 'asc' },
          include: {
            inspectorUser: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!order) return res.status(404).json({ message: 'Not found' });
    generateQCReport(order, res);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
