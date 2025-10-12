import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import PDFDocument from 'pdfkit';

export const createQC = async (req: any, res: Response) => {
  try {
    const { production_id, passed, notes } = req.body;

    const qc = await prisma.qCInspection.create({
      data: {
        productionId: production_id,
        inspectorId: req.user.id,
        passed,
        notes,
      },
    });

    if (passed) {
      await prisma.productionOrder.update({
        where: { id: production_id },
        data: { status: 'COMPLETED' },
      });
    }

    res.status(201).json({ success: false, message: qc });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const exportQCReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.productionOrder.findUnique({
      where: { id: Number(id) },
      include: {
        createdByUser: true,
        qcInspections: { include: { inspectorUser: true } },
      },
    });

    if (!order) return res.status(404).json({ message: 'Not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=qc_report_${order.referenceNo}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('QC Inspection Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Reference No: ${order.referenceNo}`);
    doc.text(`Model: ${order.modelName}`);
    doc.text(`Quantity: ${order.quantity}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Created by: ${order.createdByUser?.name}`);
    doc.moveDown();

    doc.fontSize(14).text('Inspections:');
    order.qcInspections.forEach((qc, i) => {
      doc.fontSize(12).text(`${i + 1}. Inspector: ${qc.inspectorUser?.name} | Passed: ${qc.passed ? 'Yes' : 'No'} | Notes: ${qc.notes || '-'}`);
    });

    doc.end();
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
