// Test script for Indian UPI parsing and Currency Formatting

function extractUpiMerchant(raw) {
  if (!raw) return null;
  const slashMatch = raw.match(/UPI(?:\/(?:DR|CR))?\/[A-Z0-9_-]+\/([^\/]+)(?:\/([^\/]+))?/i);
  if (slashMatch) {
    const rawMerchant = slashMatch[1].trim();
    const rawVpa = slashMatch[2]?.trim() || '';
    if (rawMerchant && !/^\d+$/.test(rawMerchant) && rawMerchant.length > 2) {
      return sanitizeUpiWord(rawMerchant);
    }
    if (rawVpa && rawVpa.includes('@')) {
      return sanitizeUpiWord(rawVpa.split('@')[0]);
    }
  }
  const dashMatch = raw.match(/UPI-([A-Za-z0-9\s]+)-([a-zA-Z0-9._-]+@[a-zA-Z0-9]+)/i);
  if (dashMatch) return sanitizeUpiWord(dashMatch[1]);
  return null;
}

function sanitizeUpiWord(word) {
  let clean = word.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  clean = clean.replace(/\b(pvt|ltd|limited|private|pay|merchant|store)\b/gi, '').trim();
  return clean
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

console.log('--- TEST 1: Indian UPI String Extraction ---');
const t1 = 'UPI/DR/428192839102/SWIGGY/swiggy@icici/HDFC';
const t2 = 'UPI/309182736451/ZEPTO/zepto@hdfcbank';
const t3 = 'UPI-ZOMATO-zomato@axisbank-4029182';

console.log(`Input 1: "${t1}" -> Extracted: "${extractUpiMerchant(t1)}"`);
console.log(`Input 2: "${t2}" -> Extracted: "${extractUpiMerchant(t2)}"`);
console.log(`Input 3: "${t3}" -> Extracted: "${extractUpiMerchant(t3)}"`);

if (
  extractUpiMerchant(t1) === 'Swiggy' &&
  extractUpiMerchant(t2) === 'Zepto' &&
  extractUpiMerchant(t3) === 'Zomato'
) {
  console.log('✓ PASS: All Indian UPI strings extracted successfully!');
} else {
  throw new Error('FAIL: UPI extraction error');
}

console.log('\n--- TEST 2: Indian Numbering System (Lakhs & Crores) ---');
const amount = 150000;
const inrFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
console.log(`Amount: ${amount} in en-IN -> ${inrFormatted}`);

if (inrFormatted.includes('1,50,000')) {
  console.log('✓ PASS: Indian numbering grouping (1,50,000) verified!');
} else {
  throw new Error('FAIL: Indian number format incorrect');
}

console.log('\n>>> ALL INDIAN LOCALIZATION TESTS PASSED! <<<');
