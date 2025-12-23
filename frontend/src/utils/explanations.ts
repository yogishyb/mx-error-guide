/**
 * P1-002a: Template-based explanations
 * Generates "For Ops" and "For Devs" explanations based on category/severity
 */

import type { PaymentError, ErrorCategory, ErrorSeverity } from '../types/error';

type TemplateMap = Record<ErrorCategory, Record<ErrorSeverity, string>>;

const OPS_TEMPLATES: TemplateMap = {
  Account: {
    fatal:
      'This payment was rejected due to an account problem ({code}: {name}). The {detail}. Contact the beneficiary or sender to verify account details and request updated banking information before resubmitting.',
    temporary:
      'This payment is on hold due to a temporary account issue ({code}). The {detail}. This may resolve automatically, but consider contacting the account holder to verify status.',
  },
  Amount: {
    fatal:
      'Payment rejected due to an amount issue ({code}: {name}). The {detail}. Review the payment amount, check for limits or restrictions, and adjust before resubmitting.',
    temporary:
      'Payment delayed due to amount validation ({code}). The {detail}. Check daily/transaction limits and retry when limits reset.',
  },
  Party: {
    fatal:
      'Payment rejected due to party identification issue ({code}: {name}). The {detail}. Verify the sender or beneficiary details (name, address, ID) and correct before resubmitting.',
    temporary:
      'Payment on hold for party verification ({code}). The {detail}. Additional documentation may be required.',
  },
  Routing: {
    fatal:
      'Payment failed due to routing issue ({code}: {name}). The {detail}. Verify BIC/SWIFT codes, correspondent bank details, and clearing system identifiers before retry.',
    temporary:
      'Payment delayed due to routing issue ({code}). The {detail}. The intermediary bank may be temporarily unavailable.',
  },
  Regulatory: {
    fatal:
      'Payment blocked for regulatory/compliance reasons ({code}: {name}). The {detail}. Review sanctions lists, AML requirements, and ensure all regulatory documentation is complete.',
    temporary:
      'Payment under regulatory review ({code}). The {detail}. Additional compliance documentation may speed up processing.',
  },
  System: {
    fatal:
      "Payment failed due to a system error ({code}: {name}). The {detail}. This is typically a technical issue - retry later or contact your payment provider's support.",
    temporary:
      'Payment delayed due to system issues ({code}). The {detail}. The system should recover automatically - retry in a few minutes.',
  },
  Mandate: {
    fatal:
      'Direct debit/mandate issue ({code}: {name}). The {detail}. Verify the mandate is active and valid, check authorization dates, and ensure proper setup before retry.',
    temporary:
      'Mandate processing delayed ({code}). The {detail}. Allow additional time for mandate verification.',
  },
  Duplicate: {
    fatal:
      'Duplicate payment detected ({code}: {name}). The {detail}. This payment appears to have been submitted before. Verify whether the original was processed.',
    temporary:
      'Potential duplicate flagged ({code}). The {detail}. Review recent transactions before resubmitting.',
  },
  Cancellation: {
    fatal:
      'Cancellation failed ({code}: {name}). The {detail}. The original payment may have already been processed or the cancellation window has passed.',
    temporary:
      'Cancellation pending ({code}). The {detail}. Allow time for the cancellation request to be processed.',
  },
  Narrative: {
    fatal:
      'Payment rejected due to narrative/reference issue ({code}: {name}). The {detail}. Review payment description, reference fields, and ensure no prohibited characters or content.',
    temporary:
      'Payment held for narrative review ({code}). The {detail}. Review may be required for the payment description.',
  },
  Other: {
    fatal:
      'Payment rejected ({code}: {name}). The {detail}. Review the specific error details and contact your payment provider for guidance.',
    temporary:
      'Payment processing delayed ({code}). The {detail}. Monitor the payment status and contact support if not resolved.',
  },
};

const DEV_TEMPLATES: TemplateMap = {
  Account: {
    fatal:
      'Error {code} ({name}): Account validation failed. Check the following XML elements: DbtrAcct/Id/IBAN or CdtrAcct/Id/IBAN. Ensure the account exists, is active, and currency matches. Implement pre-submission account validation via API if available.',
    temporary:
      'Error {code}: Temporary account status issue. The account may be under maintenance or pending activation. Implement retry logic with exponential backoff (recommended: 3 retries, 5/15/60 min intervals).',
  },
  Amount: {
    fatal:
      'Error {code} ({name}): Amount validation failed. Verify InstdAmt or EqvtAmt elements. Check: (1) Amount > 0, (2) Within transaction limits, (3) Currency code valid (ISO 4217), (4) Decimal places match currency. Implement client-side amount validation before submission.',
    temporary:
      'Error {code}: Amount limit temporarily exceeded. Check IntrBkSttlmAmt against daily aggregate limits. Implement limit tracking to prevent over-submission.',
  },
  Party: {
    fatal:
      'Error {code} ({name}): Party identification failed. Check Dbtr/Nm, Cdtr/Nm, and related Id elements. Ensure: (1) Name format matches bank requirements, (2) Address is complete, (3) ID type/number valid. Consider implementing name matching algorithm for validation.',
    temporary:
      'Error {code}: Party verification pending. The bank may require additional KYC data. Prepare to supply SplmtryData with additional party information if requested.',
  },
  Routing: {
    fatal:
      'Error {code} ({name}): Routing lookup failed. Verify: (1) CdtrAgt/FinInstnId/BICFI is valid 8 or 11 char BIC, (2) ClrSysMmbId if using national clearing, (3) Correspondent chain is complete. Use SWIFT BIC directory API for validation.',
    temporary:
      'Error {code}: Intermediary agent temporarily unavailable. The correspondent bank may be offline. Implement circuit breaker pattern and route via alternate correspondent if available.',
  },
  Regulatory: {
    fatal:
      'Error {code} ({name}): Regulatory check failed. Review: (1) RgltryRptg elements for completeness, (2) Purp/Cd matches allowed values, (3) Party names against sanctions lists. Implement pre-flight regulatory screening.',
    temporary:
      'Error {code}: Regulatory review in progress. Payment queued for compliance check. No action needed - monitor via pacs.002 status messages.',
  },
  System: {
    fatal:
      'Error {code} ({name}): System-level failure. This indicates infrastructure issues. Log full error context, implement retry with backoff. If persistent, escalate to payment gateway support. Check GrpHdr/CreDtTm is within acceptable window.',
    temporary:
      'Error {code}: Transient system error. Implement automatic retry: (1) Wait 30 seconds, (2) Retry with same MsgId, (3) Max 3 attempts. If using SWIFT, check for network status updates.',
  },
  Mandate: {
    fatal:
      "Error {code} ({name}): Mandate validation failed. Check MndtRltdInf elements: MndtId, DtOfSgntr, FrqcyPrd. Ensure mandate is registered and active in creditor's mandate management system before submission.",
    temporary:
      'Error {code}: Mandate activation pending. New mandates may take 1-3 business days. Implement mandate status polling before first collection attempt.',
  },
  Duplicate: {
    fatal:
      'Error {code} ({name}): Duplicate detected. The MsgId or EndToEndId matches a previous submission. Implement idempotency: (1) Track submitted IDs, (2) Check before submission, (3) Query status of original. Consider TxId uniqueness per UTC day.',
    temporary:
      "Error {code}: Potential duplicate flagged for review. Your deduplication window may overlap with the bank's. Adjust EndToEndId generation to include microsecond precision.",
  },
  Cancellation: {
    fatal:
      'Error {code} ({name}): Cancellation request rejected. Check CtrlSum and NbOfTxs in camt.056 match original. Cancellation may be rejected if payment already settled. Query payment status via camt.052 before cancellation.',
    temporary:
      'Error {code}: Cancellation request queued. Implement async callback handler for camt.029 response. Settlement finality rules may delay cancellation processing.',
  },
  Narrative: {
    fatal:
      'Error {code} ({name}): Narrative validation failed. Check RmtInf/Ustrd for: (1) Prohibited characters (avoid &, <, >), (2) Max length (140 chars for SEPA), (3) Encoding (UTF-8). Sanitize user input before message construction.',
    temporary:
      'Error {code}: Narrative under review. Structured remittance (RmtInf/Strd) may process faster than unstructured. Consider using Cdtr/Ref for critical reference data.',
  },
  Other: {
    fatal:
      'Error {code} ({name}): Unclassified rejection. Parse the full AddtlInf element for bank-specific error details. Log complete pacs.002/camt.053 response for debugging. Contact payment gateway support with MsgId for investigation.',
    temporary:
      'Error {code}: Processing delay. Monitor via status inquiry (pacs.028). Implement webhook or polling for status updates. Most temporary errors resolve within 4 hours.',
  },
};

export interface Explanations {
  forOps: string;
  forDevs: string;
}

/**
 * Generate contextual explanations for an error
 */
export function generateExplanations(error: PaymentError): Explanations {
  const category = error.category || 'Other';
  const severity: ErrorSeverity = error.severity === 'temporary' ? 'temporary' : 'fatal';

  const opsTemplate = OPS_TEMPLATES[category]?.[severity] || OPS_TEMPLATES.Other[severity];
  const devTemplate = DEV_TEMPLATES[category]?.[severity] || DEV_TEMPLATES.Other[severity];

  const detail =
    error.description?.short || error.description?.detailed || error.name || 'error occurred';

  const replacePlaceholders = (template: string): string => {
    return template
      .replace(/{code}/g, error.code)
      .replace(/{name}/g, error.name || 'Unknown')
      .replace(/{detail}/g, detail.toLowerCase());
  };

  return {
    forOps: replacePlaceholders(opsTemplate),
    forDevs: replacePlaceholders(devTemplate),
  };
}
