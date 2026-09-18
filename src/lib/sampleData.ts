import { Transaction } from '@/types/finance';
import { detectAnomalies } from './analytics';

export function generateSampleTransactions(): Transaction[] {
  const rawList: Omit<Transaction, 'id' | 'isAnomaly' | 'anomalyConfidence' | 'anomalyReason'>[] = [];
  const now = new Date();

  // Helper to format YYYY-MM-DD
  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

  // Generate 6 months of historical Indian UPI & banking data up to current date
  for (let m = 5; m >= 0; m--) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = targetMonth.getFullYear();
    const month = targetMonth.getMonth();

    // 1. Monthly Salary (1st)
    rawList.push({
      date: formatDate(new Date(year, month, 1)),
      amount: 125000.00,
      type: 'income',
      category: 'Income & Salary',
      rawDescription: 'NEFT CR-HDFC000123-INFOSYS TECH LTD-SALARY-OCT26',
      cleanMerchant: 'Infosys Tech Salary',
      source: 'sample',
      account: 'HDFC Salary Account',
      tags: ['salary', 'direct-credit'],
    });

    // 2. House Rent via UPI/NEFT (1st)
    rawList.push({
      date: formatDate(new Date(year, month, 1)),
      amount: 32000.00,
      type: 'expense',
      category: 'Housing & Rent',
      rawDescription: 'UPI/382910293847/RENT-PAYMENT/landlord@okhdfcbank/HDFC',
      cleanMerchant: 'House Rent (Landlord)',
      source: 'sample',
      account: 'HDFC Salary Account',
      isRecurring: true,
      recurringCadence: 'monthly',
      tags: ['fixed', 'rent', 'upi'],
    });

    // 3. Utilities & Recharges
    rawList.push({
      date: formatDate(new Date(year, month, 7)),
      amount: 2350.00 + (m % 3) * 180,
      type: 'expense',
      category: 'Utilities & Recharge',
      rawDescription: 'UPI/492819284918/BESCOM-POWER/bescom@icici',
      cleanMerchant: 'BESCOM Electricity Bill',
      source: 'sample',
      account: 'HDFC Salary Account',
      isRecurring: true,
      recurringCadence: 'monthly',
      tags: ['utility', 'electricity', 'upi'],
    });

    rawList.push({
      date: formatDate(new Date(year, month, 11)),
      amount: 1179.00,
      type: 'expense',
      category: 'Utilities & Recharge',
      rawDescription: 'UPI/582910492819/JIO-FIBER/reliancejio@axis',
      cleanMerchant: 'Jio Fiber 5G Broadband',
      source: 'sample',
      account: 'HDFC Salary Account',
      isRecurring: true,
      recurringCadence: 'monthly',
      tags: ['utility', 'broadband', 'upi'],
    });

    // 4. Monthly Entertainment & Subscriptions
    rawList.push({
      date: formatDate(new Date(year, month, 5)),
      amount: 649.00,
      type: 'expense',
      category: 'Entertainment & Subs',
      rawDescription: 'UPI/692810394819/NETFLIX/netflix@icici',
      cleanMerchant: 'Netflix India',
      source: 'sample',
      account: 'Cred ICICI Card',
      isRecurring: true,
      recurringCadence: 'monthly',
      tags: ['subscription', 'streaming', 'upi'],
    });

    rawList.push({
      date: formatDate(new Date(year, month, 14)),
      amount: 119.00,
      type: 'expense',
      category: 'Entertainment & Subs',
      rawDescription: 'UPI/702918294819/SPOTIFY-INDIA/spotify@hdfc',
      cleanMerchant: 'Spotify Music',
      source: 'sample',
      account: 'Cred ICICI Card',
      isRecurring: true,
      recurringCadence: 'monthly',
      tags: ['subscription', 'music', 'upi'],
    });

    rawList.push({
      date: formatDate(new Date(year, month, 18)),
      amount: 1500.00,
      type: 'expense',
      category: 'Healthcare & Wellness',
      rawDescription: 'UPI/819201928394/CULTFIT/curefit@icici',
      cleanMerchant: 'Cult.fit Fitness',
      source: 'sample',
      account: 'HDFC Salary Account',
      isRecurring: true,
      recurringCadence: 'monthly',
      tags: ['subscription', 'gym', 'upi'],
    });

    // 5. Quick Commerce & Groceries (Zepto, Blinkit, DMart)
    [3, 9, 16, 23, 27].forEach((day) => {
      const items = [
        { raw: 'UPI/928192839102/ZEPTO-GROCERY/zepto@hdfcbank', clean: 'Zepto', amt: 640 },
        { raw: 'UPI/192839482918/BLINKIT-COMMERCE/blinkit@icici', clean: 'Blinkit', amt: 890 },
        { raw: 'UPI/382910394819/INSTAMART/swiggy@axisbank', clean: 'Swiggy Instamart', amt: 520 },
        { raw: 'POS 940281 DMART SUPERMARKET BANGALORE IN', clean: 'DMart Supermarket', amt: 2850 },
      ];
      const pick = items[day % items.length];
      rawList.push({
        date: formatDate(new Date(year, month, Math.min(day, 28))),
        amount: pick.amt,
        type: 'expense',
        category: 'Groceries & Quick Commerce',
        rawDescription: pick.raw,
        cleanMerchant: pick.clean,
        source: 'sample',
        account: 'HDFC Salary Account',
        tags: ['groceries', 'upi'],
      });
    });

    // 6. Food Delivery & Dining (Swiggy, Zomato, Chai Point)
    [4, 8, 13, 17, 21, 26].forEach((day) => {
      const dining = [
        { raw: 'UPI/492819284918/SWIGGY/swiggy@icici', clean: 'Swiggy Food', amt: 390 },
        { raw: 'UPI/582910394819/ZOMATO/zomato@axisbank', clean: 'Zomato Food', amt: 480 },
        { raw: 'UPI/692810394819/CHAI-POINT/chaipoint@hdfc', clean: 'Chai Point', amt: 160 },
        { raw: 'UPI/702918294819/THIRD-WAVE-COFFEE/twc@icici', clean: 'Third Wave Coffee', amt: 280 },
      ];
      const pick = dining[day % dining.length];
      rawList.push({
        date: formatDate(new Date(year, month, Math.min(day, 28))),
        amount: pick.amt,
        type: 'expense',
        category: 'Dining & Restaurants',
        rawDescription: pick.raw,
        cleanMerchant: pick.clean,
        source: 'sample',
        account: 'HDFC Salary Account',
        tags: ['dining', 'upi'],
      });
    });

    // 7. Cabs & Transit (Uber India, Ola, Metro)
    [6, 12, 19, 25].forEach((day) => {
      const transit = [
        { raw: 'UPI/819201928394/UBER-INDIA/uber@hdfc', clean: 'Uber Cabs', amt: 340 },
        { raw: 'UPI/928192839102/OLA-CABS/olacabs@icici', clean: 'Ola Cabs', amt: 290 },
        { raw: 'UPI/192839482918/BMRC-METRO-RECHARGE/bmrc@sbi', clean: 'Namma Metro', amt: 400 },
      ];
      const pick = transit[day % transit.length];
      rawList.push({
        date: formatDate(new Date(year, month, Math.min(day, 28))),
        amount: pick.amt,
        type: 'expense',
        category: 'Transportation & Cabs',
        rawDescription: pick.raw,
        cleanMerchant: pick.clean,
        source: 'sample',
        account: 'HDFC Salary Account',
        tags: ['travel', 'upi'],
      });
    });

    // 8. Shopping & E-Commerce (Amazon Pay, Flipkart, Myntra)
    rawList.push({
      date: formatDate(new Date(year, month, 15)),
      amount: 2450.00,
      type: 'expense',
      category: 'Shopping & E-Commerce',
      rawDescription: 'UPI/492819284918/AMAZON-PAY/amazonpay@icici',
      cleanMerchant: 'Amazon India',
      source: 'sample',
      account: 'Cred ICICI Card',
      tags: ['shopping', 'upi'],
    });

    rawList.push({
      date: formatDate(new Date(year, month, 22)),
      amount: 1890.00,
      type: 'expense',
      category: 'Shopping & E-Commerce',
      rawDescription: 'UPI/582910394819/FLIPKART/flipkart@axisbank',
      cleanMerchant: 'Flipkart',
      source: 'sample',
      account: 'Cred ICICI Card',
      tags: ['shopping', 'upi'],
    });

    // 9. Monthly Investment SIP (Zerodha / Mutual Funds)
    rawList.push({
      date: formatDate(new Date(year, month, 5)),
      amount: 25000.00,
      type: 'expense',
      category: 'Investments & SIPs',
      rawDescription: 'ACH DR-ZERODHA BROKING LTD-MONTHLY SIP',
      cleanMerchant: 'Zerodha Mutual Fund SIP',
      source: 'sample',
      account: 'HDFC Salary Account',
      isRecurring: true,
      recurringCadence: 'monthly',
      tags: ['investing', 'sip', 'wealth'],
    });
  }

  // Add 2 Real Indian Statistical Anomalies:
  // Anomaly 1: Emergency Hospitalization / Surgery (₹48,000) in Healthcare (where baseline is ~₹1,500)
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 14);
  rawList.push({
    date: formatDate(prevMonth),
    amount: 48000.00,
    type: 'expense',
    category: 'Healthcare & Wellness',
    rawDescription: 'POS 940182 MANIPAL HOSPITAL EMERGENCY ADMISSION BANGALORE',
    cleanMerchant: 'Manipal Hospital Emergency',
    source: 'sample',
    account: 'HDFC Salary Account',
    tags: ['health', 'emergency'],
  });

  // Anomaly 2: Vehicle Major Engine Overhaul (₹28,500) in Transport (where baseline is ~₹350)
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 19);
  rawList.push({
    date: formatDate(twoMonthsAgo),
    amount: 28500.00,
    type: 'expense',
    category: 'Transportation & Cabs',
    rawDescription: 'UPI/394810293847/AUTOSHOP-ENGINE-REPAIR/garage@okhdfcbank',
    cleanMerchant: 'Auto Engine Repair Workshop',
    source: 'sample',
    account: 'HDFC Salary Account',
    tags: ['transport', 'emergency', 'upi'],
  });

  const fullTx: Transaction[] = rawList.map((item, idx) => ({
    ...item,
    id: `tx-sample-inr-${idx + 1}`,
    createdAt: new Date().toISOString(),
  }));

  fullTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const { transactions } = detectAnomalies(fullTx);
  return transactions;
}
