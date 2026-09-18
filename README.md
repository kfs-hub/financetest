# ⚡ ApexFinance AI

> **Intelligent Personal Finance Analyzer** — Tailored for the Indian UPI & Global Banking Ecosystem.  
> Automated Expense Categorization • Statistical Anomaly Detection • Holt-Winters Predictive Forecasting • AI Financial Copilot • Supabase PostgreSQL Cloud Sync.

---

## 🌟 Key Highlights

- 🇮🇳 **Built for India & UPI First**: Deep NPCI string parser that unmasks cryptic codes (`UPI/DR/428192839102/SWIGGY/swiggy@icici/` $\to$ **Swiggy**, **Dining**). Supports Swiggy, Zomato, Zepto, Blinkit, BigBasket, CRED, Jio, Airtel, BESCOM, IRCTC, Zerodha, Groww, and 50+ merchants.
- 💱 **Multi-Currency Interchangeable**: Default **Indian Rupee (₹ INR)** with native Lakh/Crore grouping (`₹1,50,000`), with instant toggle to **$ USD**, **€ EUR**, or **£ GBP**.
- 🛡️ **Statistical Anomaly Detection ($\mu + 2\sigma$)**: Flags abnormal expenditures that exceed 2 standard deviations from your category mean with explicit mathematical deviation breakdowns.
- 📈 **Holt-Winters Time-Series Forecasting**: Double exponential smoothing trajectory predicting your next 30, 60, and 90 days of cash outflow with confidence interval bands.
- 🔥 **Budget Burn-Rate Velocity**: Linear run-rate calculation ($d = \frac{\text{Current Spent}}{\text{Days Elapsed}}, \text{Projected} = d \times \text{Total Days}$) to warn of budget overruns before the month ends.
- 🔄 **Recurring Subscriptions & Cadence Detector**: Automatically detects periodic charges (weekly, bi-weekly, monthly, annual) with an interactive **"Simulate Cut"** annual savings calculator.
- 🤖 **AI Financial Copilot**: Privacy-safe conversational financial advisor with client-side PII masking. Works offline via an intelligent local deterministic engine or connects live to Google Gemini API.
- 🗄️ **Dual Storage (Local-First + Supabase PostgreSQL)**: Works completely offline out of the box with zero cloud setup, and features one-click live synchronization to Supabase with Row Level Security (RLS).

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js App Router & Tailwind CSS)        │
│  - Financial Dashboard (KPI Cards, Cash Flow, Category Sunburst/Donut)  │
│  - Anomaly Alert Banners (μ + 2σ outlier flags with deviation math)     │
│  - Forecast Center (Holt-Winters trajectory, Budget Burn Projections)   │
│  - Bank Statement Importer (Fuzzy header mapping, CSV drag & drop)      │
│  - Subscriptions & Recurring Bills (Cadence detection & savings calc)   │
│  - AI Financial Copilot (Privacy-safe conversational financial advisor) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                       Next.js API & Services Layer                      │
│  - src/lib/currency.ts:    Indian Rupee (Lakhs/Crores) & currency engine│
│  - src/lib/categorizer.ts: UPI extractor + Tier 1 regex fast-path       │
│  - src/lib/analytics.ts:   μ + 2σ anomaly detector, Holt-Winters model, │
│                            linear burn rate velocity, recurring cadence │
│  - src/lib/csvParser.ts:   Fuzzy column auto-detection & normalization  │
│  - src/lib/supabase.ts:    Supabase client & connection validator       │
│  - src/lib/dbService.ts:   Dual-mode storage (Cloud sync + Local cache) │
│  - src/app/api/ai/copilot: REST API route for natural language advisor  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
        ┌────────────────────────────┴────────────────────────────┐
        ▼                                                         ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│      Supabase PostgreSQL      │         │       Google Gemini API       │
│  - users, categories,         │         │  - Privacy-safe reasoning     │
│    transactions, budgets      │         │  - PII-masked prompt context  │
│  - Row Level Security (RLS)   │         │  - Deterministic fallback     │
└───────────────────────────────┘         └───────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/apex-finance-ai.git
cd apex-finance-ai
npm install
```

### 2. Configure Environment (Optional)

ApexFinance works 100% offline out of the box without any mandatory API keys! If you want live Supabase cloud sync or live Gemini AI:

```bash
cp .env.example .env.local
```

Fill in your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Setting Up Supabase PostgreSQL

1. Create a free project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. In ApexFinance, click the **"Supabase DB"** button in the top navigation bar, copy the pre-generated DDL schema, and run it in your SQL Editor:
   - Creates `users`, `categories`, `transactions`, `budgets`, and `categorization_rules` tables.
   - Sets up Foreign Keys and Row Level Security (RLS).
4. Enter your Project URL and Anon Public Key in the modal or `.env.local`, click **"Save & Verify"**, then click **"Sync Local Data to Cloud"**!

---

## 🧪 Mathematical Validation

The project includes unit verification scripts for all mathematical and statistical algorithms:

```bash
node src/scratch/test-math.js
```

Verifies:
- **Anomaly Detection**: Flags transactions $> \mu + 2\sigma$ accurately on baseline sample groups.
- **Burn-Rate Velocity**: Linear run-rate projection formula:
  $$\text{Projected} = \left(\frac{\text{Current Spent}}{\text{Days Elapsed}}\right) \times \text{Total Days}$$
- **Holt-Winters Linear Trend**: Level ($L_t$) and trend ($T_t$) multi-step exponential projection.

---

## 📄 License

MIT License. Free for personal and commercial use.
