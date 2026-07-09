# Vuevoice

A lightweight, self-hosted invoicing workspace for freelancers and small studios. Create invoices, track what's paid vs. outstanding, export a clean PDF, email clients directly, and see revenue trends at a glance — all backed by your own Firebase project.

## Design

A deliberately un-generic look: deep ink surfaces, a warm brass accent, a serif/sans type pairing (Fraunces for headings and totals, Manrope for UI), a signature wax-seal monogram, and a small but consistent motion system — staggered list entrances, count-up dashboard numbers, eased panel transitions, and a pulsing overdue badge — all gated behind `prefers-reduced-motion`.

## Features

- **Invoice management** — create, edit, delete, and track invoices as Draft, Pending, Overdue, or Paid, with fully editable invoice/due dates
- **Multi-currency** — USD, EUR, GBP, and INR, with correctly formatted, currency-scoped totals (no adding euros to dollars)
- **Email/password authentication** — each user only sees their own data, enforced by both client-side queries and Firestore security rules
- **Real-time sync** — invoices and clients update live via Firestore listeners; no manual refresh, no stale data across tabs/devices
- **Client directory** — save clients once, autocomplete them into future invoices, manage them from a dedicated page
- **Email invoicing** — send an invoice summary straight to the client's inbox via EmailJS, no backend required
- **Overdue detection** — pending invoices past their due date are automatically flagged and broken out separately on the dashboard
- **Search & filter** — by status (including Overdue), client/invoice-number search, and date range
- **PDF export** — download any invoice as a client-ready PDF, generated entirely client-side
- **CSV export** — export the current (filtered) invoice list for spreadsheets/accounting
- **Dashboard** — per-currency totals by status and a 6-month paid-revenue chart
- **Dark / light mode** — theme preference is remembered between visits
- **Installable / offline-ready (PWA)** — add it to your home screen; previously visited pages keep working offline
- **Automated tests** — Vitest unit tests covering date math, currency formatting, status/overdue logic, CSV export, and store getters

## Tech stack

- [Vue 3](https://vuejs.org/) (`<script setup>` Composition API)
- [Vue Router 4](https://router.vuejs.org/) with auth-aware navigation guards
- [Vuex 4](https://vuex.vuejs.org/) (namespaced `auth`, `invoices`, `clients`, `ui` modules)
- [Firebase](https://firebase.google.com/) — Firestore (real-time data) and Authentication (email/password)
- [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF generation
- [EmailJS](https://www.emailjs.com/) for client-side email delivery
- [Vitest](https://vitest.dev/) for unit tests
- Vue CLI PWA plugin (Workbox-generated service worker)
- Sass, built with Vue CLI / webpack

## Getting started

### 1. Clone and install

```bash
git clone <your-fork-url> vuevoice
cd vuevoice
npm install
```

### 2. Create a Firebase project

This app needs its own Firebase project — it won't run against anyone else's.

1. Go to the [Firebase console](https://console.firebase.google.com/) and create a new project.
2. Under **Build → Authentication**, enable the **Email/Password** sign-in provider.
3. Under **Build → Firestore Database**, create a database (start in production mode).
4. Under **Project settings → General → Your apps**, add a Web app and copy the config values it gives you.

### 3. (Optional) Set up EmailJS for the "Email Invoice" button

1. Create a free account at [emailjs.com](https://www.emailjs.com/).
2. Add an email service (e.g. Gmail) and a template that expects these variables: `to_email`, `to_name`, `invoice_id`, `invoice_date`, `payment_due_date`, `amount_due`, `item_summary`.
3. Grab your Service ID, Template ID, and Public Key from the dashboard.

Skip this step if you don't need email delivery — every other feature works fine without it, and the button will just show a friendly "not configured" message.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Firebase config (required) and EmailJS credentials (optional):

```
VUE_APP_FIREBASE_API_KEY=AIzaSyDE0dUpDIQkgrGQYIRKpZw_IFtnk11BsSQ
VUE_APP_FIREBASE_AUTH_DOMAIN=vuevoice-798f9.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=vuevoice-798f9
VUE_APP_FIREBASE_STORAGE_BUCKET=vuevoice-798f9.firebasestorage.app
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=331747810253
VUE_APP_FIREBASE_APP_ID=1:331747810253:web:c4a8015087383c85604284

VUE_APP_EMAILJS_SERVICE_ID=service_e7qdxvj
VUE_APP_EMAILJS_TEMPLATE_ID=template_jm54j4b
VUE_APP_EMAILJS_PUBLIC_KEY=MeVgK0pNEfae4zFbI
```

### 5. Lock down Firestore

Every invoice and client document is tagged with the `ownerUid` of whoever created it, and the app only ever queries `where('ownerUid', '==', currentUser.uid)`. Enforce that server-side too, in **Firestore → Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /invoices/{invoiceId} {
      allow read, update, delete: if request.auth != null && resource.data.ownerUid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.ownerUid == request.auth.uid;
    }
    match /clients/{clientId} {
      allow read, update, delete: if request.auth != null && resource.data.ownerUid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.ownerUid == request.auth.uid;
    }
  }
}
```

Without this, the client-side filtering above is only a UI convenience, not real security.

### 6. Run it

```bash
npm run serve
```

Visit `http://localhost:8080`, create an account on the login screen, and start invoicing.

### Running tests

```bash
npm run test:unit
```

### Building for production

```bash
npm run build
```

Output goes to `dist/`, ready to deploy to Firebase Hosting, Netlify, Vercel, or any static host. The service worker generated by the build makes the app installable and lets previously visited pages keep working offline.

## How to use

1. **Sign up / sign in** on the login screen.
2. **Create an invoice** — fill in your details and the client's, pick a currency, set the invoice date and payment due date (or leave the due date to auto-calculate from payment terms), add line items, and optionally check "Save this client for future invoices."
3. Next time, **load a saved client** from the dropdown in the editor instead of retyping their details, or manage clients from the **Clients** page.
4. **Find invoices fast** using the search box, status dropdown (including Overdue), or date range on the invoice list.
5. Open an invoice to **edit it, delete it, mark it Paid/Pending, download a PDF, or email it** to the client directly.
6. **Export CSV** from the invoice list to hand off to a spreadsheet or accountant.
7. Check the **Dashboard** for per-currency totals by status (including overdue) and a 6-month revenue chart.
8. Toggle **light/dark mode** from the icon at the bottom of the sidebar.
9. Install it as an app from your browser's "Install" / "Add to Home Screen" prompt.

## Project structure

```
src/
├── components/
│   ├── common/       StatusBadge, SpinnerOverlay
│   ├── dashboard/     RevenueChart
│   ├── invoices/      InvoiceEditorPanel, InvoiceLineItemsTable, InvoiceListItem, ConfirmDiscardDialog
│   └── layout/        SideNav
├── composables/        useResponsiveScreen, useInvoiceFilters
├── firebase/           firebaseClient.js
├── router/              auth-aware route guard
├── store/
│   └── modules/         auth.js, invoices.js, clients.js, ui.js
├── utils/                dateHelpers, currencyFormatter, currencies, invoiceMapper,
│                          invoiceStatus, pdfExporter, csvExporter, emailInvoice
└── views/                InvoiceListView, InvoiceDetailView, DashboardView, ClientsView, LoginView
tests/
└── unit/                 currencyFormatter, dateHelpers, invoiceStatus, csvExporter, invoicesStore
```
