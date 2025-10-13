import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import PDFDocument from 'pdfkit';
import { qcSchema } from '../validators/qc-validator';
import { validateResponse } from '../utils/response';
import { Prisma } from '@prisma/client';
import { generateQCReport } from '../lib/pdf';

export const createQC = async (req: any, res: Response) => {
  try {
    const { productionId } = req.params;
    const val = qcSchema(req.body);
    if (!val.success) {
      return validateResponse(res, val);
    }
    const { passed, notes } = val.data;
    const qc = await prisma.qCInspection.create({
      data: {
        productionId: Number(productionId),
        inspectorId: req.user.id,
        passed,
        notes,
      },
    });

    if (passed) {
      await prisma.productionOrder.update({
        where: { id: Number(productionId) },
        data: { status: 'COMPLETED' },
      });
    }

    res.status(201).json({ success: false, message: qc });
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
    console.log(order);
    generateQCReport(order, res);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
