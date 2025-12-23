/**
 * P1-005: Search Synonyms
 * Maps common payment terms to related words for better search
 */

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  // Account terms
  account: ['iban', 'acct', 'bank account', 'acc'],
  iban: ['account', 'account number', 'international bank account'],
  closed: ['inactive', 'terminated', 'shut', 'cancelled', 'deactivated'],
  blocked: ['frozen', 'suspended', 'locked', 'restricted', 'held'],

  // Amount terms
  amount: ['sum', 'value', 'payment', 'funds', 'money'],
  insufficient: ['not enough', 'low balance', 'short', 'lacking'],
  limit: ['maximum', 'cap', 'threshold', 'ceiling', 'restriction'],
  exceeded: ['over', 'surpassed', 'breached', 'above'],

  // Party/beneficiary terms
  beneficiary: ['recipient', 'payee', 'creditor', 'receiver'],
  creditor: ['beneficiary', 'recipient', 'payee', 'receiver'],
  debtor: ['sender', 'payer', 'originator', 'remitter'],
  sender: ['debtor', 'payer', 'originator', 'remitter'],

  // Routing terms
  bic: ['swift', 'swift code', 'bank code', 'routing'],
  swift: ['bic', 'swift code', 'bank identifier'],
  routing: ['bic', 'swift', 'correspondent', 'intermediary'],
  correspondent: ['intermediary', 'agent', 'routing bank'],

  // Status terms
  rejected: ['declined', 'refused', 'failed', 'returned'],
  failed: ['rejected', 'error', 'unsuccessful', 'declined'],
  timeout: ['timed out', 'delay', 'slow', 'unresponsive'],
  duplicate: ['already sent', 'repeat', 'double', 'existing'],

  // Regulatory terms
  sanctions: ['ofac', 'blocked', 'restricted', 'compliance'],
  aml: ['anti-money laundering', 'compliance', 'kyc'],
  kyc: ['know your customer', 'verification', 'identity'],
  regulatory: ['compliance', 'legal', 'requirement', 'rule'],

  // Technical terms
  invalid: ['wrong', 'incorrect', 'bad', 'malformed'],
  missing: ['absent', 'not provided', 'empty', 'blank'],
  format: ['structure', 'syntax', 'layout', 'schema'],
  xml: ['message', 'payload', 'document', 'file'],

  // Common abbreviations
  ac: ['account'],
  am: ['amount'],
  ag: ['agent'],
  be: ['beneficiary'],
  rc: ['regulatory', 'compliance'],
  ff: ['format', 'field'],
  dt: ['date', 'time'],
  md: ['mandate'],
  du: ['duplicate'],
  ts: ['technical', 'system'],
};

/**
 * Expand search query with synonyms
 */
export function expandQueryWithSynonyms(query: string): string {
  if (!query) return query;

  const words = query.toLowerCase().split(/\s+/);
  const expandedWords = new Set(words);

  words.forEach((word) => {
    // Add synonyms for this word
    if (SEARCH_SYNONYMS[word]) {
      SEARCH_SYNONYMS[word].forEach((syn) => expandedWords.add(syn));
    }

    // Also check if any synonym maps to this word
    Object.entries(SEARCH_SYNONYMS).forEach(([key, synonyms]) => {
      if (synonyms.includes(word)) {
        expandedWords.add(key);
      }
    });
  });

  return Array.from(expandedWords).join(' ');
}
