/**
 * JS TRACKER - Personal & Student Budget Data Store & LocalStorage Persistence
 * Designed for students and young adults
 */

const STORAGE_KEYS = {
  USERS: 'nestegg_users_v2',
  CURRENT_USER_ID: 'nestegg_current_user_id_v2',
  TRANSACTIONS: 'nestegg_transactions_v1',
  BUDGETS: 'nestegg_budgets_v1',
  SAVINGS_GOALS: 'nestegg_savings_goals_v1',
  RECURRING: 'nestegg_recurring_v1',
  USER_PROFILE: 'nestegg_user_profile_v1',
  SELECTED_MONTH: 'nestegg_selected_month_v1',
  SMS_LOGS: 'nestegg_sms_logs_v1'
};

const DEFAULT_USERS = [
  {
    id: 'user_alex',
    fullName: 'Alex Rivera',
    email: 'alex.rivera@campus.edu',
    password: 'password123',
    phoneNumber: '+1 (555) 382-9104',
    status: 'Senior Undergrad & Tech Intern',
    currency: '$',
    campus: 'Metro State University',
    smsTrackingEnabled: true,
    carrierName: 'Campus Mobile 5G'
  }
];

// Default Categories with friendly icons and curated palette
const DEFAULT_CATEGORIES = [
  { id: 'cat_food', name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#F97316', defaultBudget: 240 },
  { id: 'cat_groceries', name: 'Groceries', type: 'expense', icon: 'shopping-cart', color: '#10B981', defaultBudget: 320 },
  { id: 'cat_housing', name: 'Housing & Rent', type: 'expense', icon: 'home', color: '#3B82F6', defaultBudget: 850 },
  { id: 'cat_transit', name: 'Transit & Commute', type: 'expense', icon: 'bus', color: '#0EA5E9', defaultBudget: 95 },
  { id: 'cat_books', name: 'Books & Learning', type: 'expense', icon: 'book-open', color: '#8B5CF6', defaultBudget: 140 },
  { id: 'cat_entertainment', name: 'Entertainment & Fun', type: 'expense', icon: 'film', color: '#EC4899', defaultBudget: 120 },
  { id: 'cat_subs', name: 'Subscriptions & Tech', type: 'expense', icon: 'tv', color: '#06B6D4', defaultBudget: 40 },
  { id: 'cat_health', name: 'Health & Personal', type: 'expense', icon: 'heart', color: '#14B8A6', defaultBudget: 70 },
  { id: 'cat_misc', name: 'Miscellaneous', type: 'expense', icon: 'tag', color: '#64748B', defaultBudget: 50 },
  // Income categories
  { id: 'cat_job', name: 'Campus Work-Study', type: 'income', icon: 'briefcase', color: '#10B981', defaultBudget: 0 },
  { id: 'cat_freelance', name: 'Tutoring & Freelance', type: 'income', icon: 'laptop', color: '#0D9488', defaultBudget: 0 },
  { id: 'cat_grant', name: 'Grant & Financial Aid', type: 'income', icon: 'award', color: '#0EA5E9', defaultBudget: 0 },
  { id: 'cat_gift', name: 'Family Support / Gift', type: 'income', icon: 'gift', color: '#F59E0B', defaultBudget: 0 }
];

// Sample Initial Dataset tailored for student life
const INITIAL_DATA = {
  profile: {
    name: 'Alex Rivera',
    status: 'Senior Undergrad & Tech Intern',
    currency: '$',
    campus: 'Metro State University',
    phoneNumber: '+1 (555) 382-9104',
    smsTrackingEnabled: true,
    carrierName: 'Campus Mobile 5G'
  },
  selectedMonth: '2026-09',
  budgets: {
    '2026-09': {
      cat_food: 240,
      cat_groceries: 320,
      cat_housing: 850,
      cat_transit: 95,
      cat_books: 140,
      cat_entertainment: 120,
      cat_subs: 40,
      cat_health: 70,
      cat_misc: 50
    },
    '2026-08': {
      cat_food: 260,
      cat_groceries: 300,
      cat_housing: 850,
      cat_transit: 95,
      cat_books: 220,
      cat_entertainment: 150,
      cat_subs: 40,
      cat_health: 60,
      cat_misc: 60
    }
  },
  savingsGoals: [
    {
      id: 'goal_1',
      title: 'Emergency Fund Buffer',
      targetAmount: 1500,
      currentAmount: 1050,
      targetDate: '2026-12-31',
      categoryTag: 'Peace of Mind',
      color: '#0D9488',
      icon: 'shield-check'
    },
    {
      id: 'goal_2',
      title: 'Spring Break Road Trip',
      targetAmount: 650,
      currentAmount: 320,
      targetDate: '2027-03-15',
      categoryTag: 'Adventure',
      color: '#F59E0B',
      icon: 'compass'
    },
    {
      id: 'goal_3',
      title: 'M3 Pro Laptop for Capstone',
      targetAmount: 950,
      currentAmount: 460,
      targetDate: '2027-01-20',
      categoryTag: 'Tech Gear',
      color: '#3B82F6',
      icon: 'laptop'
    },
    {
      id: 'goal_4',
      title: 'Graduation & Relocation Fund',
      targetAmount: 1200,
      currentAmount: 300,
      targetDate: '2027-05-30',
      categoryTag: 'Future',
      color: '#8B5CF6',
      icon: 'award'
    }
  ],
  recurringBills: [
    {
      id: 'rec_1',
      title: 'Apartment Rent (2-bed share)',
      amount: 850.00,
      dayOfMonth: 1,
      category: 'cat_housing',
      isPaidThisMonth: true
    },
    {
      id: 'rec_2',
      title: 'Spotify Student + Hulu Bundle',
      amount: 5.99,
      dayOfMonth: 5,
      category: 'cat_subs',
      isPaidThisMonth: true
    },
    {
      id: 'rec_3',
      title: 'Student Mobile Plan (5GB 5G)',
      amount: 25.00,
      dayOfMonth: 15,
      category: 'cat_subs',
      isPaidThisMonth: false
    },
    {
      id: 'rec_4',
      title: 'GitHub Copilot + Cloud VPS',
      amount: 12.99,
      dayOfMonth: 18,
      category: 'cat_subs',
      isPaidThisMonth: true
    },
    {
      id: 'rec_5',
      title: 'Metro Card Monthly Auto-Pass',
      amount: 45.00,
      dayOfMonth: 28,
      category: 'cat_transit',
      isPaidThisMonth: false
    }
  ],
  transactions: [
    // --- SEPTEMBER 2026 TRANSACTIONS ---
    {
      id: 'tx_sep_01',
      type: 'income',
      amount: 1450.00,
      date: '2026-09-01',
      category: 'cat_job',
      description: 'Campus CS Lab Assistant Stipend',
      paymentMethod: 'Direct Deposit',
      notes: 'Bi-weekly student payroll'
    },
    {
      id: 'tx_sep_02',
      type: 'expense',
      amount: 850.00,
      date: '2026-09-01',
      category: 'cat_housing',
      description: 'Monthly Apartment Rent (Split)',
      paymentMethod: 'Bank Transfer',
      notes: 'Transferred to roommate'
    },
    {
      id: 'tx_sep_03',
      type: 'expense',
      amount: 45.00,
      date: '2026-09-02',
      category: 'cat_transit',
      description: 'Student Monthly Metro Transit Pass',
      paymentMethod: 'Campus Card',
      notes: 'Subsidized student rate'
    },
    {
      id: 'tx_sep_04',
      type: 'expense',
      amount: 84.50,
      date: '2026-09-03',
      category: 'cat_groceries',
      description: 'Trader Joe\'s Weekly Grocery Run',
      paymentMethod: 'Debit Card',
      notes: 'Oat milk, pasta, frozen veggies, bananas'
    },
    {
      id: 'tx_sep_05',
      type: 'expense',
      amount: 18.25,
      date: '2026-09-04',
      category: 'cat_food',
      description: 'Campus Hub Burrito & Drink',
      paymentMethod: 'Apple Pay',
      notes: 'Quick lunch before lab'
    },
    {
      id: 'tx_sep_06',
      type: 'expense',
      amount: 5.99,
      date: '2026-09-05',
      category: 'cat_subs',
      description: 'Spotify Student + Hulu Bundle',
      paymentMethod: 'Debit Card',
      notes: 'Monthly auto-renew'
    },
    {
      id: 'tx_sep_07',
      type: 'income',
      amount: 450.00,
      date: '2026-09-06',
      category: 'cat_freelance',
      description: 'Calculus & Python Tutoring (3 students)',
      paymentMethod: 'Venmo',
      notes: 'Fall midterm exam prep'
    },
    {
      id: 'tx_sep_08',
      type: 'expense',
      amount: 68.20,
      date: '2026-09-07',
      category: 'cat_books',
      description: 'Operating Systems Digital Textbook',
      paymentMethod: 'Credit Card',
      notes: 'Semester rental on VitalSource'
    },
    {
      id: 'tx_sep_09',
      type: 'income',
      amount: 600.00,
      date: '2026-09-09',
      category: 'cat_grant',
      description: 'Department STEM Merit Stipend',
      paymentMethod: 'Direct Deposit',
      notes: 'Fall semester installment'
    },
    {
      id: 'tx_sep_10',
      type: 'expense',
      amount: 74.05,
      date: '2026-09-11',
      category: 'cat_groceries',
      description: 'Aldi Staple Restock & Fruits',
      paymentMethod: 'Debit Card',
      notes: 'Eggs, peanut butter, brown rice, apples'
    },
    {
      id: 'tx_sep_11',
      type: 'expense',
      amount: 38.00,
      date: '2026-09-13',
      category: 'cat_entertainment',
      description: 'Movie Night & Popcorn with Friends',
      paymentMethod: 'Splitwise / Venmo',
      notes: 'IMAX student discount'
    },
    {
      id: 'tx_sep_12',
      type: 'expense',
      amount: 32.50,
      date: '2026-09-15',
      category: 'cat_food',
      description: 'Pho & Spring Rolls Study Dinner',
      paymentMethod: 'Debit Card',
      notes: 'Group dinner'
    },
    {
      id: 'tx_sep_13',
      type: 'expense',
      amount: 12.99,
      date: '2026-09-18',
      category: 'cat_subs',
      description: 'GitHub Copilot + Cloud VPS',
      paymentMethod: 'Credit Card',
      notes: 'Portfolio dev hosting'
    },
    {
      id: 'tx_sep_14',
      type: 'expense',
      amount: 28.50,
      date: '2026-09-20',
      category: 'cat_health',
      description: 'CVS Vitamins & Cold Medicine',
      paymentMethod: 'Debit Card',
      notes: 'Seasonal allergy meds'
    },
    {
      id: 'tx_sep_15',
      type: 'expense',
      amount: 14.80,
      date: '2026-09-22',
      category: 'cat_food',
      description: 'Artisan Cold Brew & Pastry',
      paymentMethod: 'Apple Pay',
      notes: 'Morning study session at Library Cafe'
    },
    {
      id: 'tx_sep_16',
      type: 'expense',
      amount: 95.00,
      date: '2026-09-24',
      category: 'cat_entertainment',
      description: 'Campus Fall Music Festival Pass',
      paymentMethod: 'Credit Card',
      notes: 'Student early-bird ticket'
    },
    {
      id: 'tx_sep_17',
      type: 'expense',
      amount: 24.50,
      date: '2026-09-25',
      category: 'cat_food',
      description: 'Late Night Pizza Slice & Drink',
      paymentMethod: 'Apple Pay',
      notes: 'Hackathon midnight refuel'
    },

    // --- AUGUST 2026 TRANSACTIONS (For instant monthly comparisons) ---
    {
      id: 'tx_aug_01',
      type: 'income',
      amount: 1450.00,
      date: '2026-08-01',
      category: 'cat_job',
      description: 'Summer Lab Research Stipend',
      paymentMethod: 'Direct Deposit',
      notes: 'August 1st payroll'
    },
    {
      id: 'tx_aug_02',
      type: 'expense',
      amount: 850.00,
      date: '2026-08-01',
      category: 'cat_housing',
      description: 'Monthly Apartment Rent',
      paymentMethod: 'Bank Transfer',
      notes: 'Room split'
    },
    {
      id: 'tx_aug_03',
      type: 'expense',
      amount: 280.00,
      date: '2026-08-10',
      category: 'cat_groceries',
      description: 'August Groceries (Total)',
      paymentMethod: 'Debit Card',
      notes: 'Monthly consolidated grocery run'
    },
    {
      id: 'tx_aug_04',
      type: 'expense',
      amount: 235.00,
      date: '2026-08-14',
      category: 'cat_food',
      description: 'August Dining Out & Cafes',
      paymentMethod: 'Debit Card',
      notes: 'Summer meals'
    },
    {
      id: 'tx_aug_05',
      type: 'expense',
      amount: 140.00,
      date: '2026-08-18',
      category: 'cat_entertainment',
      description: 'Concert & Summer Outings',
      paymentMethod: 'Venmo',
      notes: 'Summer break activities'
    },
    {
      id: 'tx_aug_06',
      type: 'expense',
      amount: 95.00,
      date: '2026-08-20',
      category: 'cat_transit',
      description: 'Summer Transit & Ride-shares',
      paymentMethod: 'Campus Card',
      notes: 'Commute'
    },
    {
      id: 'tx_aug_07',
      type: 'income',
      amount: 520.00,
      date: '2026-08-22',
      category: 'cat_freelance',
      description: 'Web Design Freelance Gig',
      paymentMethod: 'Bank Transfer',
      notes: 'Local cafe website update'
    },
    {
      id: 'tx_aug_08',
      type: 'expense',
      amount: 210.00,
      date: '2026-08-25',
      category: 'cat_books',
      description: 'Pre-Semester Course Packs & Supplies',
      paymentMethod: 'Credit Card',
      notes: 'Notebooks, iPad pencil tips, chemistry reader'
    },
    {
      id: 'tx_aug_09',
      type: 'expense',
      amount: 38.98,
      date: '2026-08-26',
      category: 'cat_subs',
      description: 'Monthly Subscriptions & Spotify',
      paymentMethod: 'Debit Card',
      notes: 'Cloud & music'
    }
  ],
  smsLogs: [
    {
      id: 'sms_01',
      sender: 'CHASE-ALERT',
      receivedAt: '2026-09-04T12:30:00Z',
      rawText: 'Chase Alert: Your debit card ending in 4102 was charged $18.25 at CAMPUS HUB BURRITO on 09/04/2026. Bal: $1,420.50.',
      parsed: {
        amount: 18.25,
        type: 'expense',
        merchant: 'Campus Hub Burrito',
        category: 'cat_food',
        paymentMethod: 'Debit Card',
        date: '2026-09-04'
      },
      status: 'auto_imported',
      linkedTxId: 'tx_sep_05'
    },
    {
      id: 'sms_02',
      sender: 'HDFCBK',
      receivedAt: '2026-09-11T16:45:00Z',
      rawText: 'Alert: Acct XX8920 debited by $74.05 on 11-Sep-26 at ALDI GROCERY. Avail Bal: $1,346.45.',
      parsed: {
        amount: 74.05,
        type: 'expense',
        merchant: 'Aldi Grocery',
        category: 'cat_groceries',
        paymentMethod: 'Debit Card',
        date: '2026-09-11'
      },
      status: 'auto_imported',
      linkedTxId: 'tx_sep_10'
    },
    {
      id: 'sms_03',
      sender: 'VENMO',
      receivedAt: '2026-09-13T21:10:00Z',
      rawText: 'Venmo: You paid $38.00 to Maya Chen for Friday Movie Night & Popcorn. Transfer completed.',
      parsed: {
        amount: 38.00,
        type: 'expense',
        merchant: 'Maya Chen - Friday Movie Night',
        category: 'cat_entertainment',
        paymentMethod: 'Venmo',
        date: '2026-09-13'
      },
      status: 'auto_imported',
      linkedTxId: 'tx_sep_11'
    },
    {
      id: 'sms_04',
      sender: 'PAYROLL',
      receivedAt: '2026-09-01T08:00:00Z',
      rawText: 'Direct Deposit of $1,450.00 from UNIV CS LAB STIPEND has been credited to your account ending in 4102.',
      parsed: {
        amount: 1450.00,
        type: 'income',
        merchant: 'Univ CS Lab Stipend',
        category: 'cat_job',
        paymentMethod: 'Direct Deposit',
        date: '2026-09-01'
      },
      status: 'auto_imported',
      linkedTxId: 'tx_sep_01'
    }
  ]
};

// =====================================================================
// SMART SMS EXPENSE PARSER ENGINE
// Detects Amount, Currency, Debited/Credited, Merchant/Payee, Category,
// and Payment Method from banking and SMS notification formats
// =====================================================================
const SMSParser = {
  parse(rawText) {
    if (!rawText || typeof rawText !== 'string') return null;
    const text = rawText.trim();
    const lower = text.toLowerCase();

    // 1. Detect Amount
    let amount = null;
    const amountRegexes = [
      /(?:\$|usd|rs\.?|inr|eur|£)\s*([\d,]+\.?\d*)/i,
      /([\d,]+\.?\d*)\s*(?:\$|usd|rs\.?|inr|eur|£)/i,
      /(?:amount|amt|debited|spent|paid|credited|received|transferred|charge[d]?)\s+(?:of\s+)?(?:(?:(?:inr|rs\.?|\$|usd)\s*)?([\d,]+\.?\d*))/i
    ];

    for (const rx of amountRegexes) {
      const match = text.match(rx);
      if (match && match[1]) {
        const cleaned = match[1].replace(/,/g, '');
        const val = parseFloat(cleaned);
        if (!isNaN(val) && val > 0) {
          amount = val;
          break;
        }
      }
    }

    if (!amount) {
      const fallbackMatch = text.match(/\b\d+\.\d{2}\b/);
      if (fallbackMatch) {
        amount = parseFloat(fallbackMatch[0]);
      }
    }

    // 2. Detect Type (expense vs income)
    let type = 'expense';
    const incomeKeywords = ['credited', 'deposited', 'salary', 'received', 'stipend', 'refund', 'refunded', 'reversal'];
    const isIncome = incomeKeywords.some(kw => lower.includes(kw));
    if (isIncome && !lower.includes('debited') && !lower.includes('charged')) {
      type = 'income';
    }

    // 3. Detect Merchant / Payee
    let merchant = 'SMS Transaction';
    const merchantPatterns = [
      /(?:at|to|vpa|paid to|charged at|spent at|towards)\s+([A-Za-z0-9\s&'.-]{2,35}?)(?:\s+on|\s+ref|\s+avail|\s+bal|\.|\s*$|\s+via|\s+using)/i,
      /(?:from)\s+([A-Za-z0-9\s&'.-]{2,35}?)(?:\s+has been credited|\s+on|\s+ref|\.|\s*$)/i,
      /(?:for)\s+([A-Za-z0-9\s&'.-]{2,30}?)(?:\s+on|\.|\s*$)/i
    ];

    for (const mRx of merchantPatterns) {
      const mMatch = text.match(mRx);
      if (mMatch && mMatch[1]) {
        const candidate = mMatch[1].trim();
        if (candidate.length > 2 && !candidate.toLowerCase().includes('your') && !candidate.toLowerCase().includes('account')) {
          merchant = candidate;
          break;
        }
      }
    }

    merchant = merchant.replace(/\s+/g, ' ').trim();
    merchant = merchant.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    // 4. Auto-map Category
    let category = type === 'income' ? 'cat_job' : 'cat_misc';
    const catMap = [
      { catId: 'cat_food', keywords: ['starbucks', 'cafe', 'coffee', 'chipotle', 'burrito', 'pizza', 'burger', 'mcdonald', 'subway', 'taco', 'swiggy', 'zomato', 'restaurant', 'bistro', 'dining', 'bakery', 'tea', 'dunkin'] },
      { catId: 'cat_groceries', keywords: ['trader joe', 'whole foods', 'aldi', 'safeway', 'walmart', 'target', 'kroger', 'grocery', 'supermarket', 'market', 'mart', 'instacart', 'bigbasket', 'provisions'] },
      { catId: 'cat_transit', keywords: ['uber', 'lyft', 'transit', 'metro', 'train', 'bus', 'subway', 'shell', 'chevron', 'gas', 'fuel', 'parking', 'toll', 'ola', 'auto'] },
      { catId: 'cat_subs', keywords: ['spotify', 'netflix', 'apple', 'google', 'amazon prime', 'youtube', 'hulu', 'disney', 'github', 'openai', 'copilot', 'discord', 'dropbox', 'subscription'] },
      { catId: 'cat_books', keywords: ['bookstore', 'vitalsource', 'chegg', 'barnes', 'textbook', 'campus store', 'library', 'udemy', 'coursera', 'course', 'tuition', 'reader'] },
      { catId: 'cat_entertainment', keywords: ['cinema', 'amc', 'imax', 'movie', 'concert', 'ticketmaster', 'steam', 'playstation', 'nintendo', 'bowling', 'party', 'event', 'club'] },
      { catId: 'cat_housing', keywords: ['rent', 'apartment', 'landlord', 'lease', 'property', 'maintenance', 'dorm'] },
      { catId: 'cat_health', keywords: ['cvs', 'walgreens', 'pharmacy', 'clinic', 'hospital', 'dental', 'gym', 'fitness', 'doctor', 'apollo', 'medical'] },
      { catId: 'cat_freelance', keywords: ['tutoring', 'freelance', 'upwork', 'fiverr', 'client', 'consulting'] },
      { catId: 'cat_grant', keywords: ['grant', 'scholarship', 'financial aid', 'fellowship'] },
      { catId: 'cat_job', keywords: ['payroll', 'stipend', 'salary', 'work-study', 'wage', 'employer', 'direct dep'] }
    ];

    for (const mapping of catMap) {
      if (mapping.keywords.some(k => lower.includes(k))) {
        category = mapping.catId;
        break;
      }
    }

    // 5. Payment Method
    let paymentMethod = 'Debit Card';
    if (lower.includes('upi') || lower.includes('vpa') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm')) {
      paymentMethod = 'UPI / Online';
    } else if (lower.includes('venmo') || lower.includes('zelle')) {
      paymentMethod = 'Venmo / Zelle';
    } else if (lower.includes('apple pay') || lower.includes('google pay')) {
      paymentMethod = 'Apple Pay';
    } else if (lower.includes('credit card') || lower.includes('cc ending') || lower.includes('visa credit') || lower.includes('mastercard')) {
      paymentMethod = 'Credit Card';
    } else if (lower.includes('direct deposit') || lower.includes('neft') || lower.includes('ach') || lower.includes('transfer')) {
      paymentMethod = 'Direct Deposit';
    }

    // 6. Date extraction
    let date = new Date().toISOString().slice(0, 10);
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(\d{1,2}-[A-Za-z]{3}-\d{2,4})/);
    if (dateMatch && dateMatch[0]) {
      const parsedD = new Date(dateMatch[0]);
      if (!isNaN(parsedD.getTime())) {
        date = parsedD.toISOString().slice(0, 10);
      }
    }

    return {
      amount: amount || 0,
      type,
      merchant,
      category,
      paymentMethod,
      date,
      confidence: amount ? (merchant !== 'SMS Transaction' ? 'high' : 'medium') : 'low'
    };
  }
};

// Data Store Class with full persistence
class BudgetStore {
  constructor() {
    this.categories = [...DEFAULT_CATEGORIES];
    this.init();
  }

  init() {
    // Load registered users
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (storedUsers) {
      try {
        this.users = JSON.parse(storedUsers);
      } catch (e) {
        this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
      }
    } else {
      this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
      this.saveUsers();
    }

    // Load active session user ID
    this.currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user_alex';

    const activeUser = this.getCurrentUser();
    if (activeUser) {
      this.profile = {
        name: activeUser.fullName,
        email: activeUser.email,
        status: activeUser.status || 'Student / Young Adult',
        currency: activeUser.currency || '$',
        campus: activeUser.campus || 'Metro State University',
        phoneNumber: activeUser.phoneNumber || '+1 (555) 382-9104',
        smsTrackingEnabled: activeUser.smsTrackingEnabled !== false,
        carrierName: activeUser.carrierName || 'Campus Mobile 5G'
      };
      this.loadUserData(this.currentUserId);
    } else {
      this.resetToDefaults();
    }
  }

  saveUsers() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  getCurrentUser() {
    return this.users.find(u => u.id === this.currentUserId) || this.users[0] || null;
  }

  isLoggedIn() {
    return !!this.currentUserId;
  }

  login(email, password) {
    if (!email || !password) {
      return { success: false, error: 'Please enter both your personal email and password.' };
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = this.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: `No account found with ${cleanEmail}. Please check your spelling or click "Create New Account".` };
    }

    if (user.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Set active session
    this.currentUserId = user.id;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);

    // Update profile
    this.profile = {
      name: user.fullName,
      email: user.email,
      status: user.status || 'Student / Young Adult',
      currency: user.currency || '$',
      campus: user.campus || 'Metro State University',
      phoneNumber: user.phoneNumber,
      smsTrackingEnabled: user.smsTrackingEnabled !== false,
      carrierName: user.carrierName || 'Mobile Carrier'
    };

    // Load user data
    this.loadUserData(user.id);
    return { success: true, user };
  }

  register({ fullName, email, password, phoneNumber, status, currency, carrierName, smsTrackingEnabled }) {
    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: 'Please enter your full name (minimum 2 characters).' };
    }

    const cleanEmail = (email || '').toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid personal email address (e.g. name@domain.com).' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const cleanPhone = (phoneNumber || '').trim();
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (!cleanPhone || digitsOnly.length < 7) {
      return { success: false, error: 'Please enter a valid mobile number for SMS tracking (at least 7 digits).' };
    }

    // Check duplicate email
    const duplicateEmail = this.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (duplicateEmail) {
      return { success: false, error: `An account with ${cleanEmail} already exists. Please sign in instead.` };
    }

    // Check duplicate phone number
    const duplicatePhone = this.users.find(u => u.phoneNumber && u.phoneNumber.replace(/\D/g, '') === digitsOnly);
    if (duplicatePhone) {
      return { success: false, error: `The mobile number ${cleanPhone} is already registered with ${duplicatePhone.email}.` };
    }

    // Create new user object
    const newUser = {
      id: 'user_' + Date.now(),
      fullName: fullName.trim(),
      email: cleanEmail,
      password: password,
      phoneNumber: cleanPhone,
      status: status ? status.trim() : 'Student Member',
      currency: currency || '$',
      campus: 'University Campus',
      smsTrackingEnabled: smsTrackingEnabled !== false,
      carrierName: carrierName ? carrierName.trim() : 'Mobile Carrier',
      registeredAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();

    // Set active session
    this.currentUserId = newUser.id;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);

    // Initialize fresh personalized data for this new account
    this.profile = {
      name: newUser.fullName,
      email: newUser.email,
      status: newUser.status,
      currency: newUser.currency,
      campus: newUser.campus,
      phoneNumber: newUser.phoneNumber,
      smsTrackingEnabled: true,
      carrierName: newUser.carrierName
    };

    const currentMonth = '2026-09';
    this.selectedMonth = currentMonth;

    // Fresh default budget limits
    const initialBudgets = {};
    initialBudgets[currentMonth] = {
      cat_food: 220,
      cat_groceries: 280,
      cat_housing: 650,
      cat_transit: 75,
      cat_books: 120,
      cat_entertainment: 90,
      cat_subs: 35,
      cat_health: 50,
      cat_misc: 40
    };
    this.budgets = initialBudgets;

    // Starter welcome transaction
    this.transactions = [
      {
        id: 'tx_init_' + Date.now(),
        type: 'income',
        amount: 600.00,
        date: '2026-09-26',
        category: 'cat_grant',
        description: 'Initial Student Allowance & Starter Fund',
        paymentMethod: 'Direct Deposit',
        notes: `Account opened for ${newUser.fullName} with linked mobile ${newUser.phoneNumber}`
      }
    ];

    // Starter savings goal
    this.savingsGoals = [
      {
        id: 'goal_init_' + Date.now(),
        title: 'Emergency Buffer',
        targetAmount: 500,
        currentAmount: 150,
        targetDate: '2026-12-31',
        categoryTag: 'Peace of Mind',
        color: '#0D9488',
        icon: 'shield-check'
      }
    ];

    // Starter recurring bill
    this.recurringBills = [
      {
        id: 'rec_init_' + Date.now(),
        title: 'Student Mobile Plan',
        amount: 25.00,
        dayOfMonth: 15,
        category: 'cat_subs',
        isPaidThisMonth: false
      }
    ];

    // Starter SMS log confirming mobile link
    this.smsLogs = [
      {
        id: 'sms_init_' + Date.now(),
        sender: 'JS-TRACKER',
        receivedAt: new Date().toISOString(),
        rawText: `Welcome to JS TRACKER! Mobile SMS expense tracking successfully linked to ${newUser.phoneNumber}.`,
        parsed: {
          amount: 0,
          type: 'income',
          merchant: 'JS TRACKER Mobile Sync',
          category: 'cat_subs',
          paymentMethod: 'SMS Link',
          date: '2026-09-26'
        },
        status: 'auto_imported',
        linkedTxId: null
      }
    ];

    // Save user-specific data to storage
    this.saveUserData(newUser.id);
    this.saveAll();

    return { success: true, user: newUser };
  }

  logout() {
    this.currentUserId = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    return { success: true };
  }

  saveUserData(userId) {
    const key = `nestegg_data_${userId}`;
    const data = {
      transactions: this.transactions,
      budgets: this.budgets,
      savingsGoals: this.savingsGoals,
      recurringBills: this.recurringBills,
      smsLogs: this.smsLogs,
      profile: this.profile,
      selectedMonth: this.selectedMonth
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  loadUserData(userId) {
    const key = `nestegg_data_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.transactions = parsed.transactions || [];
        this.budgets = parsed.budgets || INITIAL_DATA.budgets;
        this.savingsGoals = parsed.savingsGoals || [];
        this.recurringBills = parsed.recurringBills || [];
        this.smsLogs = parsed.smsLogs || [];
        this.selectedMonth = parsed.selectedMonth || INITIAL_DATA.selectedMonth;
        if (parsed.profile) this.profile = { ...this.profile, ...parsed.profile };
        return;
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    }

    if (userId === 'user_alex') {
      this.loadFromStorage();
    } else {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    this.transactions = JSON.parse(JSON.stringify(INITIAL_DATA.transactions));
    this.budgets = JSON.parse(JSON.stringify(INITIAL_DATA.budgets));
    this.savingsGoals = JSON.parse(JSON.stringify(INITIAL_DATA.savingsGoals));
    this.recurringBills = JSON.parse(JSON.stringify(INITIAL_DATA.recurringBills));
    this.smsLogs = JSON.parse(JSON.stringify(INITIAL_DATA.smsLogs));
    this.profile = JSON.parse(JSON.stringify(INITIAL_DATA.profile));
    this.selectedMonth = INITIAL_DATA.selectedMonth;
    this.saveAll();
  }

  loadFromStorage() {
    try {
      this.transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || INITIAL_DATA.transactions;
      this.budgets = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS)) || INITIAL_DATA.budgets;
      this.savingsGoals = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS)) || INITIAL_DATA.savingsGoals;
      this.recurringBills = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECURRING)) || INITIAL_DATA.recurringBills;
      this.smsLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SMS_LOGS)) || INITIAL_DATA.smsLogs;
      this.profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILE)) || INITIAL_DATA.profile;
      this.selectedMonth = localStorage.getItem(STORAGE_KEYS.SELECTED_MONTH) || INITIAL_DATA.selectedMonth;
    } catch (e) {
      console.error('Error reading localStorage, resetting to defaults:', e);
      this.resetToDefaults();
    }
  }

  saveAll() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(this.budgets));
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(this.savingsGoals));
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(this.recurringBills));
    localStorage.setItem(STORAGE_KEYS.SMS_LOGS, JSON.stringify(this.smsLogs));
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.profile));
    localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, this.selectedMonth);

    if (this.currentUserId) {
      this.saveUserData(this.currentUserId);
    }
  }

  setSelectedMonth(monthStr) {
    this.selectedMonth = monthStr;
    localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, monthStr);
  }

  // --- Transactions ---
  getTransactions(monthFilter = null) {
    if (!monthFilter) return this.transactions;
    return this.transactions.filter(t => t.date.startsWith(monthFilter));
  }

  addTransaction(tx) {
    const newTx = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: tx.type,
      amount: parseFloat(tx.amount),
      date: tx.date,
      category: tx.category,
      description: tx.description.trim(),
      paymentMethod: tx.paymentMethod || 'Debit Card',
      notes: tx.notes || ''
    };
    this.transactions.unshift(newTx);
    // Sort chronologically descending
    this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.saveTransactions();
    return newTx;
  }

  updateTransaction(id, updatedFields) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.transactions[idx] = {
        ...this.transactions[idx],
        ...updatedFields,
        amount: parseFloat(updatedFields.amount)
      };
      this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      this.saveTransactions();
      return this.transactions[idx];
    }
    return null;
  }

  deleteTransaction(id) {
    const prevLen = this.transactions.length;
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.saveTransactions();
    return this.transactions.length < prevLen;
  }

  saveTransactions() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
  }

  // --- Budgets ---
  getMonthBudgets(month = this.selectedMonth) {
    if (!this.budgets[month]) {
      // Inherit default budgets
      const defaultMap = {};
      this.categories.filter(c => c.type === 'expense').forEach(c => {
        defaultMap[c.id] = c.defaultBudget || 100;
      });
      this.budgets[month] = defaultMap;
      this.saveBudgets();
    }
    return this.budgets[month];
  }

  setCategoryBudget(month, categoryId, amount) {
    if (!this.budgets[month]) {
      this.budgets[month] = {};
    }
    this.budgets[month][categoryId] = Math.max(0, parseFloat(amount));
    this.saveBudgets();
  }

  saveBudgets() {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(this.budgets));
  }

  // --- Savings Goals ---
  getSavingsGoals() {
    return this.savingsGoals;
  }

  addSavingsGoal(goal) {
    const newGoal = {
      id: 'goal_' + Date.now(),
      title: goal.title.trim(),
      targetAmount: parseFloat(goal.targetAmount),
      currentAmount: parseFloat(goal.currentAmount || 0),
      targetDate: goal.targetDate,
      categoryTag: goal.categoryTag || 'General Savings',
      color: goal.color || '#0D9488',
      icon: goal.icon || 'piggy-bank'
    };
    this.savingsGoals.push(newGoal);
    this.saveSavingsGoals();
    return newGoal;
  }

  updateSavingsGoal(id, fields) {
    const idx = this.savingsGoals.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.savingsGoals[idx] = {
        ...this.savingsGoals[idx],
        ...fields,
        targetAmount: parseFloat(fields.targetAmount || this.savingsGoals[idx].targetAmount),
        currentAmount: parseFloat(fields.currentAmount !== undefined ? fields.currentAmount : this.savingsGoals[idx].currentAmount)
      };
      this.saveSavingsGoals();
      return this.savingsGoals[idx];
    }
    return null;
  }

  depositToGoal(id, amount) {
    const goal = this.savingsGoals.find(g => g.id === id);
    if (goal) {
      goal.currentAmount = Math.max(0, goal.currentAmount + parseFloat(amount));
      this.saveSavingsGoals();
      return goal;
    }
    return null;
  }

  deleteSavingsGoal(id) {
    const prev = this.savingsGoals.length;
    this.savingsGoals = this.savingsGoals.filter(g => g.id !== id);
    this.saveSavingsGoals();
    return this.savingsGoals.length < prev;
  }

  saveSavingsGoals() {
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(this.savingsGoals));
  }

  // --- Recurring Bills ---
  getRecurringBills() {
    return this.recurringBills;
  }

  toggleRecurringPaid(id) {
    const bill = this.recurringBills.find(b => b.id === id);
    if (bill) {
      bill.isPaidThisMonth = !bill.isPaidThisMonth;
      this.saveRecurring();
      return bill;
    }
    return null;
  }

  saveRecurring() {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(this.recurringBills));
  }

  // --- Category Helper ---
  getCategory(id) {
    return this.categories.find(c => c.id === id) || {
      id: 'unknown',
      name: 'Other',
      type: 'expense',
      icon: 'tag',
      color: '#64748B'
    };
  }

  // --- Aggregations & Calculations ---
  getMonthSummary(month = this.selectedMonth) {
    const txs = this.getTransactions(month);
    let totalIncome = 0;
    let totalExpenses = 0;
    const categorySpending = {};

    txs.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpenses += amt;
        categorySpending[t.category] = (categorySpending[t.category] || 0) + amt;
      }
    });

    const remainingBalance = totalIncome - totalExpenses;
    const budgets = this.getMonthBudgets(month);
    let totalBudget = 0;
    Object.values(budgets).forEach(b => { totalBudget += (parseFloat(b) || 0); });

    // Savings Goals total
    let totalGoalTarget = 0;
    let totalGoalSaved = 0;
    this.savingsGoals.forEach(g => {
      totalGoalTarget += g.targetAmount;
      totalGoalSaved += g.currentAmount;
    });

    return {
      month,
      totalIncome,
      totalExpenses,
      remainingBalance,
      totalBudget,
      categorySpending,
      budgets,
      totalGoalTarget,
      totalGoalSaved,
      savingsRatePct: totalIncome > 0 ? ((remainingBalance / totalIncome) * 100).toFixed(1) : 0
    };
  }

  // Export / Import
  exportJSON() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: this.profile,
      selectedMonth: this.selectedMonth,
      transactions: this.transactions,
      budgets: this.budgets,
      savingsGoals: this.savingsGoals,
      recurringBills: this.recurringBills
    }, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.transactions && parsed.budgets) {
        this.transactions = parsed.transactions;
        this.budgets = parsed.budgets;
        if (parsed.savingsGoals) this.savingsGoals = parsed.savingsGoals;
        if (parsed.recurringBills) this.recurringBills = parsed.recurringBills;
        if (parsed.profile) this.profile = parsed.profile;
        if (parsed.selectedMonth) this.selectedMonth = parsed.selectedMonth;
        this.saveAll();
        return { success: true, count: this.transactions.length };
      }
      return { success: false, error: 'Invalid data format' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  // --- SMS Logs & Auto-Tracking ---
  getSMSLogs() {
    return this.smsLogs || [];
  }

  updateProfile(fields) {
    this.profile = { ...this.profile, ...fields };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.profile));
    return this.profile;
  }

  processIncomingSMS(rawText, sender = 'BANK-ALERT', autoImport = true) {
    const parsed = SMSParser.parse(rawText);
    const newLog = {
      id: 'sms_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      sender: sender.trim() || 'BANK-ALERT',
      receivedAt: new Date().toISOString(),
      rawText: rawText.trim(),
      parsed: parsed,
      status: 'pending',
      linkedTxId: null
    };

    if (autoImport && parsed && parsed.amount > 0 && this.profile.smsTrackingEnabled) {
      // Auto import as transaction
      const tx = this.addTransaction({
        type: parsed.type,
        amount: parsed.amount,
        date: parsed.date,
        category: parsed.category,
        description: parsed.merchant,
        paymentMethod: parsed.paymentMethod,
        notes: `Auto-logged from SMS (${sender})`
      });
      newLog.status = 'auto_imported';
      newLog.linkedTxId = tx.id;
    }

    if (!this.smsLogs) this.smsLogs = [];
    this.smsLogs.unshift(newLog);
    this.saveSMSLogs();
    return newLog;
  }

  importPendingSMS(smsId) {
    const log = this.smsLogs.find(l => l.id === smsId);
    if (!log || log.status === 'auto_imported') return null;

    const parsed = log.parsed;
    const tx = this.addTransaction({
      type: parsed.type,
      amount: parsed.amount,
      date: parsed.date,
      category: parsed.category,
      description: parsed.merchant,
      paymentMethod: parsed.paymentMethod,
      notes: `Imported from SMS: "${log.rawText.slice(0, 60)}..."`
    });

    log.status = 'auto_imported';
    log.linkedTxId = tx.id;
    this.saveSMSLogs();
    return { log, tx };
  }

  deleteSMSLog(smsId) {
    const prev = this.smsLogs.length;
    this.smsLogs = this.smsLogs.filter(l => l.id !== smsId);
    this.saveSMSLogs();
    return this.smsLogs.length < prev;
  }

  saveSMSLogs() {
    localStorage.setItem(STORAGE_KEYS.SMS_LOGS, JSON.stringify(this.smsLogs));
  }
}

// Global store instance
window.store = new BudgetStore();
window.SMSParser = SMSParser;
