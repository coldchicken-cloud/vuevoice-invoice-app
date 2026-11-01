import emailjs from '@emailjs/browser';
import { formatCurrency } from './currencyFormatter';

// Bypassing the env check since we are hardcoding the keys for Vercel
export function isEmailDeliveryConfigured() {
  return true;
}

export async function emailInvoiceToClient(invoice) {
  if (!isEmailDeliveryConfigured()) {
    throw new Error(
      'Email delivery isn\u2019t configured yet - add your EmailJS credentials to .env.local (see .env.example).'
    );
  }

  const itemSummary = (invoice.invoiceItemList || [])
    .map((item) => `${item.itemName} x${item.qty} - ${formatCurrency(item.total, invoice.currencyCode)}`)
    .join('\n');

  const templateParams = {
    client_email: invoice.clientEmail,
    client_name: invoice.clientName,
    invoice_total: formatCurrency(invoice.invoiceTotal, invoice.currencyCode),
    message: 'Here is your official invoice from vuevoice.',
    invoice_id: invoice.invoiceId,
    invoice_date: invoice.invoiceDate,
    payment_due_date: invoice.paymentDueDate,
    item_summary: itemSummary,
  };

  return emailjs.send(
    'service_irw02ps', 
    'template_391epfs', 
    templateParams, 
    'MeVgK0pNEfae4zFbl'
  );
}
