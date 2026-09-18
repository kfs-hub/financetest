import { Category, CategorizationRule } from '@/types/finance';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'dining', name: 'Dining & Restaurants', color: '#f97316', icon: 'Utensils', monthlyBudget: 8000 },
  { id: 'groceries', name: 'Groceries & Quick Commerce', color: '#10b981', icon: 'ShoppingCart', monthlyBudget: 15000 },
  { id: 'housing', name: 'Housing & Rent', color: '#6366f1', icon: 'Home', monthlyBudget: 32000 },
  { id: 'utilities', name: 'Utilities & Recharge', color: '#06b6d4', icon: 'Zap', monthlyBudget: 4500 },
  { id: 'transport', name: 'Transportation & Cabs', color: '#eab308', icon: 'Car', monthlyBudget: 6000 },
  { id: 'shopping', name: 'Shopping & E-Commerce', color: '#ec4899', icon: 'ShoppingBag', monthlyBudget: 10000 },
  { id: 'entertainment', name: 'Entertainment & Subs', color: '#8b5cf6', icon: 'Film', monthlyBudget: 2500 },
  { id: 'healthcare', name: 'Healthcare & Wellness', color: '#14b8a6', icon: 'Activity', monthlyBudget: 4000 },
  { id: 'travel', name: 'Travel & Trips', color: '#3b82f6', icon: 'Plane', monthlyBudget: 8000 },
  { id: 'personal', name: 'Personal Care', color: '#f43f5e', icon: 'Smile', monthlyBudget: 3000 },
  { id: 'income', name: 'Income & Salary', color: '#22c55e', icon: 'TrendingUp', monthlyBudget: 0 },
  { id: 'investments', name: 'Investments & SIPs', color: '#a855f7', icon: 'PiggyBank', monthlyBudget: 25000 },
  { id: 'other', name: 'Other Expenses', color: '#64748b', icon: 'MoreHorizontal', monthlyBudget: 3000 },
];

export const FAST_PATH_RULES: Omit<CategorizationRule, 'id' | 'createdAt'>[] = [
  // --- Indian UPI Food Delivery & Quick Commerce ---
  { pattern: 'swiggy|bundl tech|swiggyinstamart|instamart', targetCategory: 'Dining & Restaurants', cleanMerchantName: 'Swiggy' },
  { pattern: 'zomato|eternal|zomato media', targetCategory: 'Dining & Restaurants', cleanMerchantName: 'Zomato' },
  { pattern: 'zepto|kirana cart', targetCategory: 'Groceries & Quick Commerce', cleanMerchantName: 'Zepto Quick Commerce' },
  { pattern: 'blinkit|blink commerce|grofers', targetCategory: 'Groceries & Quick Commerce', cleanMerchantName: 'Blinkit' },
  { pattern: 'bigbasket|supermarket grocery|bb daily|bbdaily', targetCategory: 'Groceries & Quick Commerce', cleanMerchantName: 'BigBasket' },
  { pattern: 'mcdonald|starbucks|dunkin|chipotle|subway|wendy|kfc|burger king|domino|pizza hut', targetCategory: 'Dining & Restaurants', cleanMerchantName: 'Fast Food' },
  { pattern: 'haldiram|bikanervala|saravana bhavan|udupi|chai point|chaayos|blue tokai|third wave coffee', targetCategory: 'Dining & Restaurants', cleanMerchantName: 'Cafe / Restaurant' },
  { pattern: 'coffee|cafe|roaster|bakery|diner|bistro|pub|bar & grill|brewery|tavern', targetCategory: 'Dining & Restaurants', cleanMerchantName: 'Cafe / Bar' },

  // --- Indian Transport, Cabs & Fastag ---
  { pattern: 'ola cabs|ani tech|ola money', targetCategory: 'Transportation & Cabs', cleanMerchantName: 'Ola Cabs' },
  { pattern: 'uber |uber trip|uber\\.com|uber india', targetCategory: 'Transportation & Cabs', cleanMerchantName: 'Uber Cabs' },
  { pattern: 'rapido|roppen trans', targetCategory: 'Transportation & Cabs', cleanMerchantName: 'Rapido Bike Taxi' },
  { pattern: 'irctc|indian railway|cris', targetCategory: 'Transportation & Cabs', cleanMerchantName: 'IRCTC Rail' },
  { pattern: 'fastag|nhai|toll plaza|netc', targetCategory: 'Transportation & Cabs', cleanMerchantName: 'FASTag Highway Toll' },
  { pattern: 'metro rail|dmrc|bmrc|cmrl|metro card', targetCategory: 'Transportation & Cabs', cleanMerchantName: 'City Metro' },
  { pattern: 'iocl|indian oil|bpcl|bharat petro|hpcl|hindustan petro|shell|petrol bunk|fuel', targetCategory: 'Transportation & Cabs', cleanMerchantName: 'Fuel / Petrol' },

  // --- Indian E-Commerce & Retail ---
  { pattern: 'flipkart|internet pvt ltd', targetCategory: 'Shopping & E-Commerce', cleanMerchantName: 'Flipkart' },
  { pattern: 'myntra|myntra designs', targetCategory: 'Shopping & E-Commerce', cleanMerchantName: 'Myntra Fashion' },
  { pattern: 'amazon pay|amazon seller|amzn mktp|amazon\\.in|amazon in', targetCategory: 'Shopping & E-Commerce', cleanMerchantName: 'Amazon India' },
  { pattern: 'meesho|fashnear', targetCategory: 'Shopping & E-Commerce', cleanMerchantName: 'Meesho' },
  { pattern: 'ajio|reliance retail|trends', targetCategory: 'Shopping & E-Commerce', cleanMerchantName: 'AJIO / Reliance Retail' },
  { pattern: 'dmart|avenue supermarts|smart bazaar', targetCategory: 'Groceries & Quick Commerce', cleanMerchantName: 'DMart Supermarket' },
  { pattern: 'tata cliq|nykaa|fsn e-commerce', targetCategory: 'Shopping & E-Commerce', cleanMerchantName: 'Nykaa / Tata CLiQ' },

  // --- Utilities, Telecom & Recharges ---
  { pattern: 'jio|reliance jio|jio prepaid|jio fiber', targetCategory: 'Utilities & Recharge', cleanMerchantName: 'Jio Telecom & Fiber' },
  { pattern: 'airtel|bharti airtel|airtel broadband', targetCategory: 'Utilities & Recharge', cleanMerchantName: 'Airtel Broadband / 5G' },
  { pattern: 'vi prepaid|vodafone idea', targetCategory: 'Utilities & Recharge', cleanMerchantName: 'Vodafone Idea' },
  { pattern: 'bescom|mseb|tata power|adani electricity|cesc|tneb|upcl|discom', targetCategory: 'Utilities & Recharge', cleanMerchantName: 'Electricity Bill' },
  { pattern: 'indane|hp gas|bharat gas|lpg cylinder', targetCategory: 'Utilities & Recharge', cleanMerchantName: 'LPG Gas Cylinder' },
  { pattern: 'bwssb|delhi jal board|water bill|municipal corp', targetCategory: 'Utilities & Recharge', cleanMerchantName: 'Water & Municipal' },

  // --- Subscriptions, Entertainment & Events ---
  { pattern: 'hotstar|disney\\+ hotstar|novi digital', targetCategory: 'Entertainment & Subs', cleanMerchantName: 'Disney+ Hotstar' },
  { pattern: 'netflix|nflx', targetCategory: 'Entertainment & Subs', cleanMerchantName: 'Netflix' },
  { pattern: 'spotify|apple music|gaana|jiosaavn|wynk', targetCategory: 'Entertainment & Subs', cleanMerchantName: 'Music Streaming' },
  { pattern: 'bookmyshow|bigtree entertainment', targetCategory: 'Entertainment & Subs', cleanMerchantName: 'BookMyShow Movies' },
  { pattern: 'prime video|amazon prime', targetCategory: 'Entertainment & Subs', cleanMerchantName: 'Amazon Prime' },
  { pattern: 'youtube premium|google play', targetCategory: 'Entertainment & Subs', cleanMerchantName: 'YouTube Premium' },
  { pattern: 'sonyliv|zee5|jiocinema', targetCategory: 'Entertainment & Subs', cleanMerchantName: 'Streaming Video' },

  // --- Housing & Rent Payments ---
  { pattern: 'nobroker|cred rent|housing\\.com|magicbricks|rent payment|society maintenance', targetCategory: 'Housing & Rent', cleanMerchantName: 'House Rent / Maintenance' },

  // --- Investments & Wealth ---
  { pattern: 'zerodha|rainmatter|kite', targetCategory: 'Investments & SIPs', cleanMerchantName: 'Zerodha Broking' },
  { pattern: 'groww|nextbillion', targetCategory: 'Investments & SIPs', cleanMerchantName: 'Groww Investments' },
  { pattern: 'indmoney|kuvera|coin by zerodha|smallcase', targetCategory: 'Investments & SIPs', cleanMerchantName: 'Mutual Fund SIP' },
  { pattern: 'mfu|cams|kfintech|uti mf|hdfc mf|sbi mf|icici pru', targetCategory: 'Investments & SIPs', cleanMerchantName: 'Direct Mutual Fund' },

  // --- Credit Cards & FinTech ---
  { pattern: 'cred|dreamplug|cred pay', targetCategory: 'Utilities & Recharge', cleanMerchantName: 'CRED Bill Payment' },
  { pattern: 'paytm|one97|paytm postpaid', targetCategory: 'Shopping & E-Commerce', cleanMerchantName: 'Paytm' },
  { pattern: 'phonepe|phonepe pvt ltd', targetCategory: 'Shopping & E-Commerce', cleanMerchantName: 'PhonePe' },

  // --- Healthcare & Fitness ---
  { pattern: 'cult\\.fit|curefit|cult fit', targetCategory: 'Healthcare & Wellness', cleanMerchantName: 'Cult.fit Fitness' },
  { pattern: 'apollo pharmacy|apollo 247|netmeds|tata 1mg|pharmeasy', targetCategory: 'Healthcare & Wellness', cleanMerchantName: 'Online Pharmacy / Meds' },
  { pattern: 'dr lal path|metropolis|thyrocare|diagnostic', targetCategory: 'Healthcare & Wellness', cleanMerchantName: 'Diagnostics & Health' },

  // --- Travel & Stay ---
  { pattern: 'makemytrip|mmt|goibibo|ixigo|yatra', targetCategory: 'Travel & Trips', cleanMerchantName: 'MakeMyTrip' },
  { pattern: 'indigo|interglobe aviation|air india|vistara|spicejet|akasa air', targetCategory: 'Travel & Trips', cleanMerchantName: 'Domestic Flight' },
  { pattern: 'oyo|treebo|fabhotels|airbnb', targetCategory: 'Travel & Trips', cleanMerchantName: 'Hotels & Stay' },

  // --- Income & Payroll ---
  { pattern: 'salary|payroll|direct dep|tcs |infosys|wipro|cognizant|accenture|hcl |deloitte|amazon payroll|google india', targetCategory: 'Income & Salary', cleanMerchantName: 'Salary Credit' },
];
