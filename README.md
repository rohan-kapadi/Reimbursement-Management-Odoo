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
**ReimburseX** (built for Odoo × VIT) eliminates the friction of traditional expense reporting. Using OCR AI, multi-currency live conversions, and a dynamic approval pipeline, it streamlines how companies track, approve, and reimburse employee spending.

Built with an ultra-reliable inline-styling UI architecture, it guarantees a clean, premium, and pixel-perfect SaaS experience instantly on any device.

<br />

## 🚀 Key Features

* **🪄 AI Receipt Extraction (OCR):** Upload a receipt, and AI automatically grabs the merchant, amount, date, and category.
* **🌍 Live Currency Exchange:** Specify the claim currency, and it auto-estimates the value against your company's base currency using real-time API integrations.
* **🔗 Dynamic Approval Workflows:** Configure up to three sequential approval layers for claims (e.g. built-in Manager & Admin tiers).
* **📊 Role-Based Dashboards:** 
  * `Admin`: Manage teams, adjust approval chains, and view company-wide financial health.
  * `Manager`: Review expense queues, approve/reject claims, and monitor direct reports.
  * `Employee`: Submit, monitor, and revise expense claims securely.
* **⚡ Inline-Style Rendering Architecture:** Bypasses conventional utility class build steps to guarantee 100% stable UI rendering across any edge deployment.

<br />

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | React Native/CSS Inline Styles (Custom SaaS Tokens) |
| **Authentication** | NextAuth.js (Session-based JWT) |
| **Database** | Supabase (PostgreSQL) |
| **AI (OCR)** | Google Gemini |
| **Icons** | Native Unicode/Emoji Library |

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
Duplicate the `.env.example` file to create your local `.env` configuration.
```bash
cp .env.example .env
```
_Ensure you fill in your Supabase Keys, NextAuth secrets, and OCR endpoints inside the `.env` file before running._

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

<br />

## 🏗️ Project Structure
```text
/src
├── app/                  # Next.js 15 App Router pages (admin, employee, manager)
├── components/           # UI Components (Inline styled widgets, Dashboards)
├── lib/                  # Utilities, OCR processors, Supabase & NextAuth clients
└── types/                # Core TypeScript definitions (DB schema)
```

<br />

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
<div align="center">
  <sub>Built with ❤️ for Odoo × VIT</sub>
</div>
