import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { productSchema, productStatusSchema } from '../validators/product-validator';
import { Prisma } from '@prisma/client';
import { validateResponse } from '../utils/response';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const val = productSchema(req.body);
    if (!val.success) {
      return validateResponse(res, val);
    }

    const { modelName, quantity } = val.data;
    const referenceNo = 'PO' + Date.now();

    const order = await prisma.productionOrder.create({
      data: {
        referenceNo,
        modelName,
        quantity,
        status: 'PENDING',
        createdBy: req.user.id,
      },
    });
    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.productionOrder.findMany({
      include: {
        createdByUser: { select: { name: true, email: true, role: true } },
        qcInspections: { select: { id: true, passed: true }, orderBy: { createdAt: 'asc' }, take: 1 },
      },
    });

    res.status(200).json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { referenceNo } = req.params;

    const order = await prisma.productionOrder.findFirst({
      where: { referenceNo, status: 'COMPLETED' },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
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
    res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { referenceNo } = req.params;
    const val = productStatusSchema(req.body);
    if (!val.success) {
      return validateResponse(res, val);
    }

    const { status } = val.data;

    const order = await prisma.productionOrder.update({
      where: { referenceNo },
      data: { status },
    });
    res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference number',
      });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { referenceNo } = req.params;
    await prisma.productionOrder.delete({ where: { referenceNo, status: 'PENDING' } });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference number',
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};
