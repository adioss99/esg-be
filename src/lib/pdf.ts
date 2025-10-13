import { Response } from 'express';
import PDFDocument from 'pdfkit';

interface User {
  name?: string;
  email?: string;
  role?: string;
}

interface QCInspection {
  inspectorUser?: User;
  passed: boolean;
  notes?: string | null;
  createdAt?: Date | string;
}

interface Order {
  referenceNo: string;
  modelName: string;
  quantity: number | string;
  status: string;
  createdAt?: Date | string; // Added the date property here
  createdByUser?: User;
  qcInspections: QCInspection[];
}

/**
 * Generates a QC Inspection Report PDF and streams it to the response.
 * @param order The order object containing all necessary details.
 * @param res The Express.js response object.
 */
export function generateQCReport(order: Order, res: Response): void {
  // --- DOCUMENT SETUP ---
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 72, right: 72 },
    layout: 'portrait',
    info: {
      Title: `QC Inspection Report for ${order.referenceNo}`,
      Author: 'ESG',
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=qc_report_${order.referenceNo}.pdf`);
  doc.pipe(res);

  // --- HELPER FUNCTIONS ---
  const drawLine = (y: number): void => {
    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(72, y)
      .lineTo(523, y) // A4 width - left margin - right margin
      .stroke();
  };

  const addSectionHeader = (text: string): void => {
    doc.font('Helvetica-Bold').fontSize(14).text(text, 72, doc.y, { underline: false, align: 'center' });
    doc.moveDown(0.7);
  };

  // --- HEADER ---
  doc.font('Helvetica-Bold').fontSize(22).text('QC Inspection Report', { align: 'center' });
  doc.moveDown(0.5);
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
  doc.moveDown(2);

  // --- ORDER DETAILS SECTION ---
  addSectionHeader('Order Summary');
  drawLine(doc.y);
  doc.moveDown();

  const detailsColumnX = 72;
  const valueColumnX = 80;

  doc.font('Helvetica-Bold').text('Reference No :', detailsColumnX, doc.y, { continued: true });
  doc.font('Helvetica-Bold').text(order.referenceNo, valueColumnX, doc.y);
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').text('Model Name :', detailsColumnX, doc.y, { continued: true });
  doc.font('Helvetica').text(order.modelName, valueColumnX, doc.y);
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').text('Quantity :', detailsColumnX, doc.y, { continued: true });
  doc.font('Helvetica').text(String(order.quantity), valueColumnX, doc.y);
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').text('Status :', detailsColumnX, doc.y, { continued: true });
  doc.fillColor(order.status === 'COMPLETED' ? '#228B22' : '#B22222');
  doc.font('Helvetica-Bold').text(order.status, valueColumnX, doc.y);
  doc.fillColor('black'); // Reset color
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').text('Created By :', detailsColumnX, doc.y, { continued: true });
  doc.font('Helvetica').text(`${order.createdByUser?.name || 'N/A'} (${order.createdByUser?.email || 'N/A'})`, valueColumnX, doc.y);
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').text('Created Date:', detailsColumnX, doc.y, { continued: true });
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  doc.font('Helvetica').text(orderDate, valueColumnX, doc.y);
  doc.moveDown(2);

  // --- INSPECTION DETAILS SECTION ---
  addSectionHeader('Inspection Records');
  drawLine(doc.y);
  doc.moveDown();

  if (order.qcInspections && order.qcInspections.length > 0) {
    order.qcInspections.forEach((qc, index) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(`Inspection #${index + 1}`, { continued: true });
      const passed = qc.passed;
      doc
        .font('Helvetica-Bold')
        .fillColor(passed ? '#228B22' : '#B22222') // Green for Pass, Red for Fail
        .text(` ${passed ? '( Passed )' : '( Failed )'}`, { continued: true });
      doc.fillColor('black'); // Reset text color

      const qcDate = qc.createdAt ? new Date(qc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
      doc.font('Helvetica').text(`on ${qcDate}`, { align: 'right' });
      doc.moveDown(0.5);

      // Inspector Info
      doc.font('Helvetica-Bold').text('Inspector:', { continued: true });
      doc.font('Helvetica').text(` ${qc.inspectorUser?.name || 'N/A'} (${qc.inspectorUser?.email || 'N/A'})`);
      doc.moveDown(0.5);

      // Notes
      doc.font('Helvetica-Bold').text('Notes:');
      doc.font('Helvetica').text(qc.notes || 'No notes provided.', {
        width: 451, // Page width - margins - indentation
        align: 'justify',
      });

      // Add a separator for all but the last inspection
      if (index < order.qcInspections.length - 1) {
        doc.moveDown();
        drawLine(doc.y);
        doc.moveDown();
      }
    });
  } else {
    doc.font('Helvetica-Oblique').text('No inspection records found for this order.');
  }

  // --- FOOTER ---
  drawLine(doc.page.height - 40);
  doc
    .font('Helvetica-Oblique')
    .fontSize(8)
    .text('This is an automatically generated report. | ESG © 2025', 72, doc.page.height - 35, { align: 'center', width: 451 });

  // --- FINALIZE DOCUMENT ---
  doc.end();
}
