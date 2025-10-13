import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { productSchema, productStatusSchema } from '../validators/product-validator';
import { Prisma } from '@prisma/client';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const val = productSchema(req.body);
    if (!val.success) {
      return res.status(400).json({
        success: false,
        message: val.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
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
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getOrders = async (_: Request, res: Response) => {
  try {
    const orders = await prisma.productionOrder.findMany({
      include: { createdByUser: { select: { name: true, email: true, role: true } } },
    });
    res.status(200).json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { referenceNo } = req.params;
    const val = productStatusSchema(req.body);
    if (!val.success) {
      return res.status(400).json({
        success: false,
        message: val.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
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

    res.status(400).json({ success: false, message: err.message });
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
    res.status(400).json({ success: false, message: err.message });
  }
};
