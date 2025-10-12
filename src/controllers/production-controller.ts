import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const createOrder = async (req: any, res: Response) => {
  try {
    const { model_name, quantity } = req.body;
    const reference_no = 'PO' + Date.now();

    const order = await prisma.productionOrder.create({
      data: {
        referenceNo: reference_no,
        modelName: model_name,
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
      include: { createdByUser: true },
    });
    res.status(200).json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.productionOrder.update({
      where: { id: Number(id) },
      data: { status },
    });
    res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.productionOrder.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
