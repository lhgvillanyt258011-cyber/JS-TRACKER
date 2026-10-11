# JS TRACKER | Modern Student & Young Adult Budget Planner 🎓💰

A clean, responsive, and friendly personal budget planner designed specifically for college students and young adults. JS TRACKER empowers users to balance stipends, part-time jobs, campus grants, and daily living costs, set realistic monthly category budgets, and systematically grow emergency buffers and savings goals.

---

## 🌟 Key Features

### 1. Dashboard
- **Monthly Summary Cards**: Instant visibility into Total Income, Total Expenses, Available Balance, and Overall Savings Goal Progress.
- **Visual Budget vs. Spending Chart**: Interactive comparison of allocated monthly caps versus actual spend using Chart.js.
- **Category Alert Banners**: Helpful alerts with actionable advice when categories reach 85% or exceed limits.
- **Upcoming Recurring Expenses**: Track student subscriptions (Spotify, mobile plan, GitHub, rent) with quick "Mark Paid" toggles.
- **Recent Transactions Feed**: Quick overview of recent activity with "+ Log Transaction" CTA.

### 2. Transactions Manager
- **Full CRUD Operations**: Add, edit, and delete income or expense entries with confirmation dialogs.
- **Multi-Filter & Search**: Real-time search across descriptions and notes, category filtering, and type filtering (All / Expense / Income).
- **Sort Options**: Sort by date (newest/oldest) or amount (highest/lowest).
- **Payment Method Tagging**: Debit card, Campus card, Venmo/Zelle, Apple Pay, Cash, and Direct Deposit.
- **Backup & Portability**: Export your data to JSON or import existing records anytime.

### 3. Monthly Category Budgets
- **Spending Limits**: Set tailored limits for categories including Food & Dining, Groceries, Housing & Rent, Transit & Commute, Books & Learning, Entertainment, and Subscriptions.
- **Visual Status Badges**: Dynamic indicators: *On Track*, *Near Limit*, or *Over Budget*.
- **Color-Coded Progress Bars**: Emerald (<70%), Amber (70%–99%), and Rose/Red (100%+).
- **Master Budget Health Bar**: Shows total monthly spending against overall budget allocation.

### 4. Savings Goals & Smart Calculator
- **Custom Goals**: Track target amounts, current progress, and deadlines (e.g., Emergency Buffer, Spring Break Trip, Laptop Upgrade).
- **Smart Monthly Savings Calculator**: Automatically computes how much to save each month and week based on days remaining to reach your goal on time.
- **Quick Deposit**: Add funds directly to any savings goal with celebration feedback.

### 5. Monthly Reports & Comparative Analytics
- **Month-over-Month Comparison**: Compare Current Month (September 2026) vs Previous Month (August 2026) with delta metrics on income, expenses, and savings rate.
- **Category Spending Donut Chart**: Interactive breakdown showing exact percentages for each category.
- **Semester Trend Chart**: Multi-month income vs. expense tracking.
- **Supportive Student Saving Suggestions**: General observations based strictly on entered data (grocery cooking vs takeout ratio, subscription student discounts, surplus opportunities).
- **Print / PDF Summary**: One-click printable report.

### 6. Mobile SMS Expense Tracker & Bank Sync 📱
- **Mobile Number Linking**: Connect your personal mobile number (e.g. `+1 (555) 382-9104` or your regional number) with carrier tagging.
- **Smart SMS Regex Engine**: Automatically extracts:
  * **Amount & Currency**: Supports `$`, `USD`, `Rs.`, `INR`, `EUR`, `£` (e.g., "$18.25", "INR 350.00").
  * **Transaction Type**: Detects debit/spent/charged (Expense) vs credit/salary/stipend (Income).
  * **Merchant & Payee**: Extracts vendor names like Starbucks, Trader Joe's, Chipotle, Swiggy, Uber, Venmo.
  * **Intelligent Auto-Categorization**: Automatically categorizes into Food, Groceries, Transit, Subscriptions, Books, etc.
  * **Payment Method**: Identifies Debit Card, Credit Card, UPI / Online, Apple Pay, Venmo, Direct Deposit.
- **Interactive SMS Simulator**: Click ready-to-test bank templates (Chase debit, HDFC alert, Spotify auto-debit, Venmo transfer, Uber receipt, Campus payroll) or paste any incoming SMS.
- **Auto-Import Option**: Toggle automatic conversion of incoming SMS alerts directly into live transactions and budget updates.
- **SMS Inbox & History Log**: View all incoming SMS notifications, extraction confidence, and raw text logs.
- **Webhook REST Endpoint**: `POST http://localhost:3000/api/sms/webhook` receives SMS payloads from Twilio, Android SMS forwarders, or external webhooks.

---

## 🎨 Color Palette & Design System
- **Dark Navy**: `#0D1B2A`, `#162A45` (sleek navigation and high-contrast accents)
- **Vibrant Teal**: `#0D9488`, `#14B8A6`, `#2DD4BF` (modern, friendly accents)
- **Warm Off-White / Cream**: `#F9F8F5`, `#FAF8F5`, `#FFFFFF` (calm, glare-free background)
- **Typography**: `Plus Jakarta Sans` via Google Fonts

---

## 🚀 How to Run the App

### Option A: Direct Browser Launch (Zero Dependencies)
Simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option B: Local Node.js Server
JS TRACKER includes a built-in zero-dependency static server:
```bash
node server.js
```
Then visit **`http://localhost:3000`** in your browser.

---

## 🔐 Personal Email Login & Mobile Number Registration

JS TRACKER includes account authentication with instant multi-user switching:
- **Sign In with Email**: Log in using your registered personal email (`email@domain.com`) and secure password.
- **Register with Mobile Number**:
  - Full Name
  - Personal Email (validated format with duplicate prevention)
  - Mobile Phone Number (formatted for SMS bank & UPI expense tracking)
  - Student Status / Occupation
  - Currency Preference (`$`, `₹`, `€`, `£`)
  - Password & Confirm Password (minimum 6 characters, live match validation, show/hide eye toggles)
  - Smart SMS Expense Tracking toggle
- **Preconfigured Student Demo Account**:
  - Email: `alex.rivera@campus.edu`
  - Password: `password123`
  - Linked Mobile: `+1 (555) 382-9104`
  - 1-click instant login button: *Demo Login as Alex Rivera*
- **Account Switcher**: Click the **Account** button in the top navigation bar or the user profile badge in the sidebar to log out or switch accounts.

---

## 🗄️ MySQL Database Backend (`schema.sql`)
For backend integration, a complete SQL schema is provided in `schema.sql`:
- **`users`**: User profile with `phone_number`, `password_hash`, currency preference, and status.
- **`categories`**: Default and custom income/expense categories with icons and color codes.
- **`budgets`**: Monthly allocated spending limits per category per month.
- **`transactions`**: Granular income and expense logs with foreign keys and date indexes.
- **`savings_goals`**: Target amounts, current balances, and target dates.
- **`recurring_bills`**: Recurring subscriptions and bills with due dates.
- **`sms_logs`**: Ingested SMS messages with sender, raw text, and parsed transaction links.

To import into MySQL:
```bash
mysql -u root -p < schema.sql
```

---

## ⚡ Deploying to Vercel

JS TRACKER is fully pre-configured for instant zero-configuration deployment to **Vercel** with global Edge static file serving and serverless endpoints.

### Option 1: Deploy with Vercel CLI (Fastest)

1. Open PowerShell or Command Prompt in the project folder:
   ```bash
   cd "d:\budget tracking"
   ```
2. Run the Vercel deployment command:
   ```bash
   npx vercel
   ```
3. Follow the interactive prompts:
   - **Log in**: Choose your preferred login method (GitHub, GitLab, Bitbucket, or Email).
   - **Set up and deploy?**: Type `y` and press Enter.
   - **Scope**: Select your personal or team Vercel account.
   - **Link to existing project?**: Type `n`.
   - **Project name**: Press Enter (defaults to `js-tracker`).
   - **Directory**: Press Enter (defaults to `./`).
4. To deploy directly to production with your custom domain:
   ```bash
   npx vercel --prod
   ```

---

### Option 2: Deploy via GitHub (Automatic Continuous Deployment)

1. Push this folder to a new repository on [GitHub](https://github.com/new).
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** → **"Project"**.
3. Select your GitHub repository.
4. Vercel automatically detects [vercel.json](file:///d:/budget%20tracking/vercel.json) and the Serverless endpoints in `api/`.
5. Click **Deploy**. Your app will be live with free global HTTPS within 30 seconds!

---

### Vercel Serverless Endpoints Included
- `GET /api/health`: Health status & platform telemetry.
- `POST /api/sms/webhook`: Serverless SMS ingestion endpoint (compatible with Twilio, Android SMS forwarders, and curl).

