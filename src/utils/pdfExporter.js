// Builds a simple, print-friendly PDF for a single invoice.
//
// Deliberately hand-drawn with jsPDF primitives (text/line/rect) rather
// than a table plugin - keeps the dependency list small and the output
// predictable across invoices with different numbers of line items.

import jsPDF from 'jspdf';
import { formatCurrency } from './currencyFormatter';

const PAGE_MARGIN = 48;
const LINE_HEIGHT = 18;

function drawKeyValueBlock(doc, x, y, lines) {
  let cursorY = y;
  lines.forEach(({ label, value }) => {
    if (label) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 130);
      doc.setFontSize(9);
      doc.text(label, x, cursorY);
      cursorY += 12;
    }
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 30);
    doc.setFontSize(11);
    doc.text(String(value || ''), x, cursorY);
    cursorY += LINE_HEIGHT;
  });
  return cursorY;
}

export function exportInvoiceToPdf(invoice) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = PAGE_MARGIN;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(124, 93, 250);
  doc.text('INVOICE', PAGE_MARGIN, y);

  doc.setFontSize(12);
  doc.setTextColor(20, 20, 30);
  doc.text(`#${invoice.invoiceId}`, pageWidth - PAGE_MARGIN, y, { align: 'right' });
  y += 30;

  // Biller / Bill-to columns
  const columnWidth = (pageWidth - PAGE_MARGIN * 2) / 2;
  const billerBottom = drawKeyValueBlock(doc, PAGE_MARGIN, y, [
    { label: 'From', value: invoice.billerStreetAddress },
    { label: null, value: invoice.billerCity },
    { label: null, value: invoice.billerZipCode },
    { label: null, value: invoice.billerCountry },
  ]);

  const billToBottom = drawKeyValueBlock(doc, PAGE_MARGIN + columnWidth, y, [
    { label: 'Bill To', value: invoice.clientName },
    { label: null, value: invoice.clientStreetAddress },
    { label: null, value: invoice.clientCity },
    { label: null, value: `${invoice.clientZipCode}, ${invoice.clientCountry}` },
    { label: null, value: invoice.clientEmail },
  ]);

  y = Math.max(billerBottom, billToBottom) + 10;

  // Dates + status
  y = drawKeyValueBlock(doc, PAGE_MARGIN, y, [
    { label: 'Invoice Date', value: invoice.invoiceDate },
    { label: 'Payment Due', value: invoice.paymentDueDate },
  ]);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 90);
  doc.text(invoice.productDescription || '', PAGE_MARGIN, y);
  y += 28;

  // Line item table
  const columns = [
    { label: 'Item', x: PAGE_MARGIN, align: 'left' },
    { label: 'Qty', x: pageWidth - PAGE_MARGIN - 220, align: 'right' },
    { label: 'Price', x: pageWidth - PAGE_MARGIN - 120, align: 'right' },
    { label: 'Total', x: pageWidth - PAGE_MARGIN, align: 'right' },
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 150);
  columns.forEach((col) => doc.text(col.label, col.x, y, { align: col.align }));
  y += 8;
  doc.setDrawColor(220, 220, 230);
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 30);

  const items = invoice.invoiceItemList || [];
  let cursor = 0;
  while (cursor < items.length) {
    const item = items[cursor];
    doc.text(String(item.itemName || ''), columns[0].x, y);
    doc.text(String(item.qty ?? ''), columns[1].x, y, { align: 'right' });
    doc.text(formatCurrency(item.price, invoice.currencyCode), columns[2].x, y, { align: 'right' });
    doc.text(formatCurrency(item.total, invoice.currencyCode), columns[3].x, y, { align: 'right' });
    y += LINE_HEIGHT + 6;
    cursor += 1;
  }

  y += 10;
  doc.setDrawColor(220, 220, 230);
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
  y += 26;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Amount Due', PAGE_MARGIN, y);
  doc.setFontSize(16);
  doc.setTextColor(124, 93, 250);
  doc.text(formatCurrency(invoice.invoiceTotal, invoice.currencyCode), pageWidth - PAGE_MARGIN, y, { align: 'right' });

  doc.save(`invoice-${invoice.invoiceId}.pdf`);
}
