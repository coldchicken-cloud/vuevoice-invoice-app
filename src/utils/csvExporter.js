import { getInvoiceStatus } from './invoiceStatus';

const CSV_COLUMNS = [
  { header: 'Invoice ID', value: (invoice) => invoice.invoiceId },
  { header: 'Client', value: (invoice) => invoice.clientName },
  { header: 'Client Email', value: (invoice) => invoice.clientEmail },
  { header: 'Invoice Date', value: (invoice) => invoice.invoiceDate },
  { header: 'Payment Due', value: (invoice) => invoice.paymentDueDate },
  { header: 'Status', value: (invoice) => getInvoiceStatus(invoice) },
  { header: 'Currency', value: (invoice) => invoice.currencyCode },
  { header: 'Total', value: (invoice) => invoice.invoiceTotal },
];

function escapeCsvCell(rawValue) {
  const value = String(rawValue ?? '');
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildInvoicesCsv(invoices) {
  const headerRow = CSV_COLUMNS.map((column) => column.header).join(',');
  const dataRows = invoices.map((invoice) =>
    CSV_COLUMNS.map((column) => escapeCsvCell(column.value(invoice))).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
}

export function downloadInvoicesCsv(invoices, filename = 'invoices.csv') {
  const csvContent = buildInvoicesCsv(invoices);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
