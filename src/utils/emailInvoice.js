// Sends an invoice summary to the client's email using EmailJS, which
// works entirely from the browser - no backend or server-side mail
// service to stand up.
//
// EmailJS templates don't reliably support attaching a dynamically
// generated PDF without a paid plan and extra template setup, so this
// sends the invoice's key details in the email body and points the
// client to download the PDF from the app themselves - simple, and
// honest about what it actually does.

import emailjs from '@emailjs/browser';
import { formatCurrency } from './currencyFormatter';

const SERVICE_ID = process.env.VUE_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.VUE_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.VUE_APP_EMAILJS_PUBLIC_KEY;

export function isEmailDeliveryConfigured() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
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
    // We changed these left-side keys to match your EmailJS template exactly!
    client_email: invoice.clientEmail,
    client_name: invoice.clientName,
    invoice_total: formatCurrency(invoice.invoiceTotal, invoice.currencyCode),
    message: 'Here is your official invoice from vuevoice.',
    
    // We can leave these here in case you want to add them to your template later
    invoice_id: invoice.invoiceId,
    invoice_date: invoice.invoiceDate,
    payment_due_date: invoice.paymentDueDate,
    item_summary: itemSummary,
  };

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
}
