import Papa from 'papaparse';
import { Transaction, CategorizationRule } from '@/types/finance';
import { categorizeTransaction } from './categorizer';

export interface ColumnMapping {
  dateCol: string;
  descriptionCol: string;
  amountCol: string;
  categoryCol?: string;
  typeCol?: string;
  creditCol?: string;
  debitCol?: string;
}

export interface ParseCsvResult {
  transactions: Transaction[];
  totalRows: number;
  validRows: number;
  detectedHeaders: string[];
  suggestedMapping: ColumnMapping;
  errors: string[];
}

/**
 * Fuzzy matches CSV headers to identify financial fields.
 */
export function detectColumnMapping(headers: string[]): ColumnMapping {
  const normalize = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

  const dateKeywords = ['date', 'transdate', 'postingdate', 'transactiondate', 'time', 'timestamp'];
  const descKeywords = ['description', 'desc', 'merchant', 'payee', 'name', 'memo', 'rawdescription', 'details'];
  const amountKeywords = ['amount', 'amt', 'total', 'cost', 'netamount', 'value'];
  const debitKeywords = ['debit', 'debits', 'withdrawal', 'outflow', 'expense'];
  const creditKeywords = ['credit', 'credits', 'deposit', 'inflow', 'income'];
  const categoryKeywords = ['category', 'type', 'classification', 'tag'];

  const findMatch = (keywords: string[]) => {
    return headers.find((h) => keywords.includes(normalize(h))) || '';
  };

  const dateCol = findMatch(dateKeywords) || headers[0] || '';
  const descriptionCol = findMatch(descKeywords) || headers[1] || '';
  const debitCol = findMatch(debitKeywords);
  const creditCol = findMatch(creditKeywords);
  const amountCol = findMatch(amountKeywords) || (debitCol ? '' : headers[2] || '');
  const categoryCol = findMatch(categoryKeywords);

  return {
    dateCol,
    descriptionCol,
    amountCol,
    debitCol,
    creditCol,
    categoryCol,
  };
}

/**
 * Parses varied bank date strings into standardized ISO 'YYYY-MM-DD'.
 */
export function parseDateString(rawDate: string): string {
  if (!rawDate) return new Date().toISOString().slice(0, 10);

  const clean = rawDate.trim();

  // Try standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

  // Try MM/DD/YYYY or M/D/YYYY
  const mdy = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (mdy) {
    const month = mdy[1].padStart(2, '0');
    const day = mdy[2].padStart(2, '0');
    let year = mdy[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }

  // Fallback: Date.parse
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Cleans numerical amount string (strips currency symbols, commas, parentheses).
 */
export function parseAmount(val: unknown): number {
  if (typeof val === 'number') return Math.abs(val);
  if (!val) return 0;

  let str = String(val).trim();
  // Check for accounting negative notation e.g., "(123.45)"
  const isParenthesesNegative = /^\(.*\)$/.test(str);
  str = str.replace(/[$,€£¥\(\)]/g, '').trim();

  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  return isParenthesesNegative ? Math.abs(num) : Math.abs(num);
}

/**
 * Parses raw CSV string or file content into typed Transactions.
 */
export function parseCsvTransactions(
  csvContent: string,
  userRules: CategorizationRule[] = [],
  customMapping?: Partial<ColumnMapping>,
  accountName: string = 'Imported Statement'
): ParseCsvResult {
  const parsed = Papa.parse<Record<string, string>>(csvContent.trim(), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const headers = parsed.meta.fields || [];
  const autoMapping = detectColumnMapping(headers);
  const mapping: ColumnMapping = { ...autoMapping, ...customMapping };

  const transactions: Transaction[] = [];
  const errors: string[] = [];

  parsed.data.forEach((row, index) => {
    try {
      const rawDate = row[mapping.dateCol] || '';
      const rawDesc = row[mapping.descriptionCol] || '';

      if (!rawDesc && !rawDate) return; // Skip empty rows

      let amount = 0;
      let type: 'expense' | 'income' = 'expense';

      if (mapping.debitCol && mapping.creditCol) {
        const debit = parseAmount(row[mapping.debitCol]);
        const credit = parseAmount(row[mapping.creditCol]);
        if (credit > 0) {
          amount = credit;
          type = 'income';
        } else {
          amount = debit;
          type = 'expense';
        }
      } else if (mapping.amountCol) {
        const rawAmt = String(row[mapping.amountCol] || '');
        const isNegative = rawAmt.includes('-') || /^\(.*\)$/.test(rawAmt.trim());
        amount = parseAmount(rawAmt);
        
        // Check if description implies payroll or refund
        if (rawAmt.includes('+') || /payroll|direct dep|salary|deposit|refund/i.test(rawDesc)) {
          type = 'income';
        } else if (isNegative) {
          type = 'expense';
        } else {
          type = 'expense';
        }
      }

      if (amount === 0) return; // Skip zero amount line items

      const date = parseDateString(rawDate);
      const { category, cleanMerchant } = categorizeTransaction(rawDesc, userRules);

      // If CSV already had a reliable category, keep it unless it's blank/generic
      const finalCategory =
        mapping.categoryCol && row[mapping.categoryCol]?.trim()
          ? row[mapping.categoryCol].trim()
          : category;

      transactions.push({
        id: `tx-csv-${Date.now()}-${index}`,
        date,
        amount: Math.round(amount * 100) / 100,
        type: finalCategory === 'Income & Salary' ? 'income' : type,
        category: finalCategory,
        rawDescription: rawDesc,
        cleanMerchant,
        source: 'csv',
        account: accountName,
        tags: [],
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      errors.push(`Row ${index + 1}: ${err instanceof Error ? err.message : 'Parse error'}`);
    }
  });

  return {
    transactions,
    totalRows: parsed.data.length,
    validRows: transactions.length,
    detectedHeaders: headers,
    suggestedMapping: mapping,
    errors,
  };
}
