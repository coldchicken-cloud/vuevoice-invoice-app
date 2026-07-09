// Firestore gives us DocumentSnapshot instances - this pulls out the exact
// shape the rest of the app expects, in one place, so every action that
// reads invoices agrees on the same fields.

export function mapFirestoreDocToInvoice(docSnapshot) {
  const data = docSnapshot.data();
  return {
    docId: docSnapshot.id,
    invoiceId: data.invoiceId,
    ownerUid: data.ownerUid,
    billerStreetAddress: data.billerStreetAddress,
    billerCity: data.billerCity,
    billerZipCode: data.billerZipCode,
    billerCountry: data.billerCountry,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientStreetAddress: data.clientStreetAddress,
    clientCity: data.clientCity,
    clientZipCode: data.clientZipCode,
    clientCountry: data.clientCountry,
    invoiceDateUnix: data.invoiceDateUnix,
    invoiceDate: data.invoiceDate,
    paymentTerms: data.paymentTerms,
    paymentDueDateUnix: data.paymentDueDateUnix,
    paymentDueDate: data.paymentDueDate,
    productDescription: data.productDescription,
    invoiceItemList: data.invoiceItemList || [],
    invoiceTotal: data.invoiceTotal,
    invoicePending: data.invoicePending,
    invoiceDraft: data.invoiceDraft,
    invoicePaid: data.invoicePaid,
  };
}
