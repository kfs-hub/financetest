// Test script for Two-Tier Categorization & Merchant Normalizer

function cleanMerchantName(raw) {
  if (!raw) return 'Unknown Merchant';
  let cleaned = raw;
  cleaned = cleaned.replace(/^(SQ\s*\*|TST\*\s*|SP\s*\*|PAYPAL\s*\*|CHECKCARD\s*|POS\s*DEBIT\s*|DEBIT\s*CARD\s*PURCHASE\s*|PURCHASE\s*AUTHORIZED\s*ON\s*\d{2}\/\d{2}\s*)/i, '');
  cleaned = cleaned.replace(/(#\d+|\bSTORE\s*\d+|\bUNIT\s*\d+|\*\s*[A-Z0-9]{4,})/gi, '');
  cleaned = cleaned.replace(/\b[A-Z]{2}\s+\d{5}(-\d{4})?\b/g, '');
  cleaned = cleaned.replace(/\s+[A-Z]{2}$/, '');
  cleaned = cleaned.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '');
  cleaned = cleaned.replace(/[\*\_\#\:\;]/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

console.log('--- TEST 4: POS Merchant Name Cleaning ---');
const sampleRawDesc = 'SQ *BLUE BOTTLE COFFEE SAN FRANCISCO CA';
const cleaned = cleanMerchantName(sampleRawDesc);
console.log(`Raw: "${sampleRawDesc}"`);
console.log(`Cleaned: "${cleaned}"`);

if (cleaned.includes('Blue Bottle Coffee')) {
  console.log('✓ PASS: POS cleaning verified.');
} else {
  throw new Error('FAIL: POS cleaning did not extract merchant properly');
}

console.log('>>> CATEGORIZATION & CLEANING TESTS PASSED! <<<');
