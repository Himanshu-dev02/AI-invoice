# AI Invoice Generator ✨

![Invoice Generator Cover](../frontend/src/assets/Hero.png)

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

### *Describe the job in plain English. Get a ready-to-send invoice.*

AI Invoice Generator helps freelancers and small businesses create GST-ready invoices in seconds. Type a sentence such as *"Website redesign for Acme Corp, 3 pages at ₹15,000 each, due in 14 days"* and Gemini turns it into a structured invoice. It can also draft a polite payment-reminder email for any unpaid invoice.

**🌐 Live Demo:** [frontend-six-fawn-54.vercel.app](https://frontend-six-fawn-54.vercel.app/)

---

## 🚀 Features

**AI**
- **Prompt-to-invoice:** describe the work in plain text and Gemini returns a structured invoice (client, line items, dates, tax) that is saved straight to your account.
- **AI payment reminders:** generates an email subject and body for an invoice. Copy the text, or open it in your mail app through a `mailto:` link.
- **Model fallback:** requests try `gemini-2.5-flash`, then `gemini-2.0-flash`, then `gemini-1.5-flash`, so a single unavailable model doesn't break generation.

**Invoicing**
- Create, edit, preview and delete invoices.
- Automatic subtotal, tax (default 18% GST) and total calculation.
- Four statuses: `draft`, `unpaid`, `paid`, `overdue`.
- Printable invoice preview. Use **Print / Save as PDF** (browser print dialog) to export a PDF.
- Invoice list with search, status filter, sorting and pagination.

**Business profile**
- Save business name, email, phone, address, GST number and default tax rate once.
- Upload a logo, stamp and signature (with signer name and title) that appear on every invoice.

**Dashboard**
- KPI cards for total invoices, total paid, total unpaid and paid/unpaid percentages.
- Amounts in other currencies are converted to INR using fixed rates defined in the code (no live exchange-rate API).

**Auth**
- Sign-in and sign-up through **Clerk**. All `/app` routes are protected, and each user only sees their own invoices.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router 7, Clerk (`@clerk/clerk-react`) |
| Backend | Node.js, Express 5, Mongoose 9, Multer, Clerk (`@clerk/express`) |
| Database | MongoDB (local or Atlas) |
| AI | Google Gemini via `@google/genai` |
| Deployment | Vercel (frontend and backend, see `backend/vercel.json`) |

---

## 📂 Project Structure

```bash
AI-invoice/
├── frontend/
│   └── src/
│       ├── components/   # AIInvoiceModal, AiReminder, InvoicePreview, KpiCard, Navbar, ...
│       ├── pages/        # Home, Dashboard, Invoices, CreateInvoice, BusinessProfile
│       └── assets/       # Images and style definitions
├── backend/
│   ├── config/           # MongoDB connection (Db.js)
│   ├── controllers/      # invoicecontroller.js, businessProfilecontroller.js
│   ├── models/           # invoiceModel.js, businessProfileModel.js
│   ├── routes/           # invoiceRouter, businessProfileRouter, aiinvoiceRouter
│   ├── uploads/          # Uploaded logos, stamps and signatures
│   ├── server.js
│   └── vercel.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB database (local or [Atlas](https://www.mongodb.com/atlas))
- A [Clerk](https://clerk.com/) application (publishable key and secret key)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone

```bash
git clone https://github.com/Himanshu-dev02/AI-invoice.git
cd AI-invoice
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
API_BASE=http://localhost:4000
```

```bash
npm start        # runs nodemon on http://localhost:4000
```

### 3. Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:4000
```

```bash
npm run dev      # http://localhost:5173
```

> ⚠️ Never commit `.env` files. Both `.env` files are listed in `.gitignore`.

---

## 📡 API Reference

All endpoints require a signed-in Clerk user unless noted.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/invoice` | List the current user's invoices |
| `GET` | `/api/invoice/:id` | Get one invoice (by ID or invoice number) |
| `POST` | `/api/invoice` | Create an invoice |
| `PUT` | `/api/invoice/:id` | Update an invoice |
| `DELETE` | `/api/invoice/:id` | Delete an invoice |
| `GET` | `/api/businessProfile/me` | Get the current user's business profile |
| `POST` | `/api/businessProfile` | Create a business profile (multipart, with logo, stamp and signature) |
| `PUT` | `/api/businessProfile/:id` | Update a business profile |
| `POST` | `/api/ai/generate` | Body `{ prompt }`. Returns a structured invoice as JSON |
| `POST` | `/api/ai/reminder` | Body `{ invoiceId, clientName, amount, ... }`. Returns `{ subject, body }` |

---

## ▶️ How to Use

1. **Set up your business profile.** Add your details, logo, signature and stamp.
2. **Create an invoice.** Fill in the form, or open the AI generator and describe the job in plain text.
3. **Manage invoices.** Search, filter by status, edit or delete from the Invoices page.
4. **Send a reminder.** Click the AI mail icon on an invoice, generate a draft, then copy it or open it in your email app.
5. **Export.** Open an invoice preview and choose **Print / Save as PDF**.

---

## 📸 Screenshots

| Dashboard | Invoice Management |
| :---: | :---: |
| ![Dashboard](../frontend/src/assets/Dashboard.png) | ![Invoice management](../frontend/src/assets/invoice%20management.png) |

| AI Invoice Generator | AI Reminder |
| :---: | :---: |
| ![AI invoice](../frontend/src/assets/AI%201.png) | ![AI reminder](../frontend/src/assets/AI%202.png) |

---
 

## 🔮 Roadmap

- [ ] Cloud storage for uploaded assets
- [ ] Send reminders directly by email (Resend or Nodemailer)
- [ ] Automatic overdue status based on due date
- [ ] Payment gateway integration (Stripe, Razorpay)
- [ ] Multi-currency support with live exchange rates
- [ ] Rate limiting and request validation on AI endpoints
- [ ] Unit and integration tests for tax calculations and API routes
- [ ] Team collaboration

---

## 🤝 Contributing

1. Fork the project
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a pull request

---

 

---

## 👨‍💻 Author

**Himanshu Meshram**

- GitHub: [@Himanshu-dev02](https://github.com/Himanshu-dev02)
- LinkedIn: [himanshu-meshram-hm](https://www.linkedin.com/in/himanshu-meshram-hm)
- Portfolio: [himanshumeshram.netlify.app](https://himanshumeshram.netlify.app/)
 
