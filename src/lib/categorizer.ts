import { CategorizationRule } from '@/types/finance';
import { FAST_PATH_RULES } from './constants';

/**
 * Extracts clean merchant details from Indian UPI strings and NPCI bank formats.
 * e.g., "UPI/DR/428192839102/SWIGGY/swiggy@icici/HDFC Bank" -> "Swiggy"
 * e.g., "UPI/309182736451/ZEPTO/zepto@hdfcbank" -> "Zepto"
 * e.g., "UPI-ZOMATO-zomato@axisbank-4029182" -> "Zomato"
 */
export function extractUpiMerchant(raw: string): string | null {
  if (!raw) return null;

  // Pattern 1: Standard Bank Slash format: UPI/(DR|CR)/RefNum/Merchant/VPA or UPI/RefNum/Merchant/VPA
  const slashMatch = raw.match(/UPI(?:\/(?:DR|CR))?\/[A-Z0-9_-]+\/([^\/]+)(?:\/([^\/]+))?/i);
  if (slashMatch) {
    const rawMerchant = slashMatch[1].trim();
    const rawVpa = slashMatch[2]?.trim() || '';

    // If merchant segment contains a readable name, prefer it
    if (rawMerchant && !/^\d+$/.test(rawMerchant) && rawMerchant.length > 2) {
      return sanitizeUpiWord(rawMerchant);
    }
    // Otherwise extract from VPA handle (e.g. "swiggy@icici" -> "Swiggy")
    if (rawVpa && rawVpa.includes('@')) {
      const vpaName = rawVpa.split('@')[0];
      return sanitizeUpiWord(vpaName);
    }
  }

  // Pattern 2: Dash format: UPI-MERCHANT-vpa@bank
  const dashMatch = raw.match(/UPI-([A-Za-z0-9\s]+)-([a-zA-Z0-9._-]+@[a-zA-Z0-9]+)/i);
  if (dashMatch) {
    return sanitizeUpiWord(dashMatch[1]);
  }

  // Pattern 3: VPA presence in string e.g. "Payment to swiggy@icici"
  const vpaDirect = raw.match(/([a-zA-Z0-9._-]+)@(okhdfcbank|okaxis|okicici|oksbi|paytm|ybl|ibl|axl|upi)/i);
  if (vpaDirect) {
    return sanitizeUpiWord(vpaDirect[1]);
  }

  return null;
}

function sanitizeUpiWord(word: string): string {
  let clean = word.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  // Remove trailing merchant suffixes like 'pvtltd', 'ltd', 'retail'
  clean = clean.replace(/\b(pvt|ltd|limited|private|pay|merchant|store)\b/gi, '').trim();
  if (clean.length < 2) return word;
  return toTitleCase(clean);
}

/**
 * Normalizes cryptic bank POS strings, UPI strings, and wire descriptors.
 * e.g., "UPI/DR/428192839102/SWIGGY/swiggy@icici/HDFC" -> "Swiggy"
 * e.g., "POS 4029182 ZEPTOCART BANGALORE IN" -> "Zepto Cart"
 * e.g., "NEFT CR-HDFC000123-ACME TECH-SALARY" -> "Acme Tech Salary"
 */
export function cleanMerchantName(raw: string): string {
  if (!raw) return 'Unknown Merchant';

  // 1. Try dedicated UPI extractor first
  const upiExtracted = extractUpiMerchant(raw);
  if (upiExtracted && upiExtracted.length > 2) {
    return upiExtracted;
  }

  let cleaned = raw;

  // 2. Remove Indian & International Payment prefixes
  cleaned = cleaned.replace(/^(UPI\/|IMPS\/|NEFT\s*(?:CR|DR)?[-:]?|RTGS\s*(?:CR|DR)?[-:]?|ACH\s*(?:CR|DR)?[-:]?|NACH\s*[-:]?|POS\s*\d*\s*)/i, '');
  cleaned = cleaned.replace(/^(SQ\s*\*|TST\*\s*|SP\s*\*|PAYPAL\s*\*|CHECKCARD\s*|POS\s*DEBIT\s*|PURCHASE\s*AUTHORIZED\s*ON\s*\d{2}\/\d{2}\s*)/i, '');
  cleaned = cleaned.replace(/^(APLPAY\s*|GOOGLE\s*\*|AMZN\s*Mktp\s*US\*)/i, '');

  // 3. Remove transaction reference numbers & store IDs (e.g. "492819284918", "#1234")
  cleaned = cleaned.replace(/\b\d{8,16}\b/g, '');
  cleaned = cleaned.replace(/(#\d+|\bSTORE\s*\d+|\bUNIT\s*\d+|\*\s*[A-Z0-9]{4,})/gi, '');

  // 4. Remove location suffixes (e.g., "BANGALORE IN", "MUMBAI MH", "NEW DELHI DL", "CA 94103")
  cleaned = cleaned.replace(/\b(BANGALORE|BENGALURU|MUMBAI|DELHI|NEW DELHI|HYDERABAD|CHENNAI|PUNE|KOLKATA|GURGAON|NOIDA)\s+(IN|IND)?\b/gi, '');
  cleaned = cleaned.replace(/\b[A-Z]{2}\s+\d{5,6}\b/g, '');
  cleaned = cleaned.replace(/\s+IN$/i, '');

  // 5. Remove web/phone artifacts
  cleaned = cleaned.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '');
  cleaned = cleaned.replace(/\b(WWW\.|HTTP|\.COM|\.IN|\.NET|\.ORG)\b/gi, '');
  cleaned = cleaned.replace(/[\*\_\#\:\;\/\-]/g, ' ');

  // 6. Collapse spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (cleaned.length < 2) {
    cleaned = raw.trim();
  }

  return toTitleCase(cleaned);
}

function toTitleCase(str: string): string {
  const smallWords = /^(a|an|and|as|at|but|by|for|if|in|nor|of|on|or|so|the|to|up|yet)$/i;
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word, index) => {
      if (index > 0 && smallWords.test(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export interface CategorizeResult {
  category: string;
  cleanMerchant: string;
  confidence: number;
  method: 'rule' | 'ai' | 'fallback';
}

/**
 * Two-Tier Automated Categorization Engine
 * Tier 1: Fast-Path Regex & User Rules Dictionary with UPI Intelligence (<1ms)
 * Tier 2: Heuristic & NLP Semantic Classification for unknown merchants
 */
export function categorizeTransaction(
  rawDescription: string,
  userRules: CategorizationRule[] = []
): CategorizeResult {
  const normalizedDesc = rawDescription.toLowerCase();
  const cleanedName = cleanMerchantName(rawDescription);

  // --- TIER 1A: User-Defined Custom Rules (Highest Priority) ---
  for (const rule of userRules) {
    try {
      const regex = new RegExp(rule.pattern, 'i');
      if (regex.test(normalizedDesc) || regex.test(cleanedName.toLowerCase())) {
        return {
          category: rule.targetCategory,
          cleanMerchant: rule.cleanMerchantName || cleanedName,
          confidence: 0.99,
          method: 'rule',
        };
      }
    } catch {
      if (normalizedDesc.includes(rule.pattern.toLowerCase())) {
        return {
          category: rule.targetCategory,
          cleanMerchant: rule.cleanMerchantName || cleanedName,
          confidence: 0.95,
          method: 'rule',
        };
      }
    }
  }

  // --- TIER 1B: Fast-Path Rule Dictionary (Indian UPI + Global) ---
  for (const rule of FAST_PATH_RULES) {
    try {
      const regex = new RegExp(rule.pattern, 'i');
      if (regex.test(normalizedDesc) || regex.test(cleanedName.toLowerCase())) {
        return {
          category: rule.targetCategory,
          cleanMerchant: cleanedName,
          confidence: 0.94,
          method: 'rule',
        };
      }
    } catch {
      if (normalizedDesc.includes(rule.pattern.toLowerCase())) {
        return {
          category: rule.targetCategory,
          cleanMerchant: cleanedName,
          confidence: 0.90,
          method: 'rule',
        };
      }
    }
  }

  // --- TIER 2: Semantic Heuristic NLP Classifier ---
  const semanticPatterns: { keywords: string[]; category: string; confidence: number }[] = [
    { keywords: ['hospital', 'pharmacy', 'meds', 'clinic', 'dentist', 'apollo', 'diagnostic', 'dr '], category: 'Healthcare & Wellness', confidence: 0.84 },
    { keywords: ['kitchen', 'grill', 'biryani', 'curry', 'dhaba', 'canteen', 'sweets', 'bhojanalaya', 'dosa', 'chai'], category: 'Dining & Restaurants', confidence: 0.88 },
    { keywords: ['flight', 'airways', 'airline', 'hotel', 'resort', 'stay', 'lodge', 'railway', 'train'], category: 'Travel & Trips', confidence: 0.85 },
    { keywords: ['petrol', 'diesel', 'fuel', 'cabs', 'toll', 'parking', 'auto', 'metro', 'fare'], category: 'Transportation & Cabs', confidence: 0.83 },
    { keywords: ['supermarket', 'mart', 'kirana', 'provisions', 'vegetables', 'fruits', 'dairy', 'milk'], category: 'Groceries & Quick Commerce', confidence: 0.86 },
    { keywords: ['power', 'electricity', 'broadband', 'recharge', 'dth', 'cylinder', 'gas bill', 'water bill'], category: 'Utilities & Recharge', confidence: 0.87 },
    { keywords: ['fashion', 'apparel', 'clothing', 'jewellery', 'mall', 'bazaar', 'electronics'], category: 'Shopping & E-Commerce', confidence: 0.80 },
    { keywords: ['salon', 'spa', 'massage', 'parlour', 'grooming', 'haircut'], category: 'Personal Care', confidence: 0.83 },
    { keywords: ['cinema', 'movie', 'show', 'game', 'play', 'theatre', 'amusement'], category: 'Entertainment & Subs', confidence: 0.80 },
    { keywords: ['salary', 'wages', 'stipend', 'bonus', 'direct credit', 'interest earned'], category: 'Income & Salary', confidence: 0.92 },
    { keywords: ['mutual fund', 'sip ', 'stocks', 'equity', 'nifty', 'demat', 'trading', 'gold'], category: 'Investments & SIPs', confidence: 0.89 },
  ];

  for (const entry of semanticPatterns) {
    if (entry.keywords.some((kw) => normalizedDesc.includes(kw))) {
      return {
        category: entry.category,
        cleanMerchant: cleanedName,
        confidence: entry.confidence,
        method: 'ai',
      };
    }
  }

  // Fallback
  return {
    category: 'Other Expenses',
    cleanMerchant: cleanedName,
    confidence: 0.50,
    method: 'fallback',
  };
}
