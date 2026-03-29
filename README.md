<div align="center">
  <img src="https://raw.githubusercontent.com/rohan-kapadi/Reimbursement-Management-Odoo/main/public/logo.png" alt="ReimburseX Logo" width="120" style="border-radius:20px; box-shadow: 0 4px 14px rgba(0,0,0,0.1); margin-bottom: 20px" onerror="this.onerror=null; this.src='https://via.placeholder.com/120/10b981/ffffff?text=Rx';">

  <h1>ReimburseX</h1>
  <p><strong>Smart, AI-driven reimbursement management for modern global teams.</strong></p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-DB-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Google%20Gemini-OCR-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini" /></a>
  </p>
</div>

<br />

## ✨ The Vision
**ReimburseX** (built for Odoo × VIT) eliminates the friction of traditional expense reporting. Using OCR scanning powered by Gemini AI, multi-currency live conversions, and a dynamic approval pipeline, it streamlines how companies track, approve, and reimburse employee spending.

The application is built using an ultra-reliable **inline-styling UI architecture**, bypassing the brittleness of traditional CSS utility class compilers. This guarantees a clean, premium, and pixel-perfect SaaS experience instantly on any device or edge deployment server without build-step styling conflicts.

<br />

## 🚀 Core Workflows

### 🪄 AI Receipt Extraction (OCR)
Instead of manually typing out bill details, employees simply take a picture or upload their receipt (`.png`, `.jpg`, `.webp`). 
* The image is compressed securely in the browser.
* It is passed to **Google Gemini AI**, which parses the image using system prompts to extract structured JSON data.
* `Merchant`, `Amount`, `Date`, and `Category` auto-fill directly into the submission form.

### 🌍 Multi-Currency Live Conversion
When an employee travels internationally, they can submit the claim in the local currency (e.g., EUR or INR). 
* The app queries the real-time **ExchangeRate-API** to provide instant conversion estimates against the company's mapped base currency.
* This ensures Admins and Managers view the accurate financial impact of the bill on the company's unified dashboard.

### 🔗 Dynamic Approval Chains
Companies can enforce multi-layered approval chains to combat fraud and enforce budgets. 
* Configurable by the `Admin` up to three customized approval stops.
* The first stop is dynamically mapped to the employee's assigned `Team Manager`.
* Once approved by the initial layer, it sequentially escalates to higher assigned layers until fully `APPROVED`.
* If rejected at any point, a mandatory rejection comment is recorded, and the ticket is sent back to the employee for fixes/resubmission.

<br />

## 👥 Role-Based Capabilities

| Role | Capabilities |
| :--- | :--- |
| **👑 Admin** | Creates the company workspace, configures the base currency, builds teams, adds/deletes managers and employees, designs the workflow pipeline layers, and views top-level financial statistics (total company-wide pending and approved costs). |
| **👔 Manager** | Responsible for their assigned team. Views an active approval queue of un-actioned expenses. Can instantly approve or enforce a hard-reject with mandatory feedback commentary. |
| **👤 Employee** | Uploads receipts, submits expense tickets, monitors their claim status (Pending/Approved/Rejected) via real-time badges, and can edit & resubmit rejected claims based on manager feedback. |

<br />

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Core server/client routing and API handling. |
| **Language** | TypeScript | Strict type safety for the domain models (Users, Companies, Expenses). |
| **Styling** | React Inline Styles | Enforces 100% reliable rendering aesthetics without Tailwind dependencies. Includes custom SaaS glass-panel logic and animated focus rings. |
| **Authentication** | NextAuth.js | Secure session-based JWTs mapping directly to database user credentials. |
| **Database** | Supabase (PostgreSQL) | Stores the highly relational data configuration spanning multiple tables securely. |
| **AI (OCR)** | Google Gemini API | Handles generative vision detection for high fidelity automated form-filling. |

<br />

## ⚙️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/rohan-kapadi/Reimbursement-Management-Odoo.git
cd Reimbursement-Management-Odoo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Duplicate the `.env.example` file to create your local `.env.local` configuration.
```bash
cp .env.example .env.local
```

You will need to populate the following variables:
* `NEXTAUTH_URL="http://localhost:3000"`
* `NEXTAUTH_SECRET="..."` (Generate using `openssl rand -base64 32`)
* `NEXT_PUBLIC_SUPABASE_URL="..."`
* `SUPABASE_SERVICE_ROLE_KEY="..."`
* `GEMINI_API_KEY="..."` (For the OCR engine functionality)

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application. 

_Pro Tip: You can create your company directly from the sign-up panel on the landing page, which automatically bootstraps your account as an `Admin`._

<br />

## 🏗️ Project Architecture Layout
```text
/src
├── app/                      # Next.js 15 App Router views
│   ├── api/                  # Backend endpoints (auth, OCR processing)
│   ├── dashboard/            # Protective dashboard routes
│   │   ├── admin/            # Admin capability views
│   │   ├── employee/         # Employee capability views
│   │   └── manager/          # Manager capability views
│   └── page.tsx              # Public SaaS landing marketing page
├── components/               # UI Components
│   └── ...                   # Reusable inline-styled widgets, tables, and nav shells
├── lib/                      # Core logic
│   ├── actions/              # Server actions (Database mutations for expenses/approvals)
│   ├── utils/                # Helper functions (Image compression before AI passes)
│   └── supabase.ts           # Supabase Admin connectivity
└── types/                    # Core TypeScript definitions
    └── db.ts                 # Enforcing Supabase table schemas via TypeScript interfaces
```

<br />

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
<div align="center">
  <sub>Built with ❤️ for Odoo × VIT</sub>
</div>
