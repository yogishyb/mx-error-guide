export interface ErrorType {
  id: string;
  name: string;
  prefix: string[];
  description: string;
  icon: string;
  commonCodes: Array<{
    code: string;
    name: string;
  }>;
  typicalCauses: string[];
  resolutionApproach: string;
  severity: 'fatal' | 'temporary' | 'mixed';
}

export const ERROR_TYPES: ErrorType[] = [
  {
    id: 'account',
    name: 'Account Errors',
    prefix: ['AC'],
    description: 'Account-related errors occur when there are issues with the debtor or creditor account. These include invalid account numbers, closed accounts, blocked accounts, or accounts that cannot process the specific transaction type.',
    icon: 'AccountBalance',
    commonCodes: [
      { code: 'AC01', name: 'Incorrect Account Number' },
      { code: 'AC04', name: 'Closed Account Number' },
      { code: 'AC06', name: 'Blocked Account' },
      { code: 'AC13', name: 'Invalid Debtor Account Type' },
      { code: 'AC14', name: 'Invalid Creditor Account Type' },
    ],
    typicalCauses: [
      'Account number changed or incorrect',
      'Account closed by customer or bank',
      'Account frozen due to legal/compliance reasons',
      'Account type does not support the transaction',
      'IBAN check digit validation failure',
    ],
    resolutionApproach: 'Verify account details with the beneficiary. Check account status with the receiving bank. Update account information in your system. For blocked accounts, investigate with compliance team.',
    severity: 'fatal',
  },
  {
    id: 'amount',
    name: 'Amount Errors',
    prefix: ['AM'],
    description: 'Amount-related errors occur when there are issues with the transaction amount or currency. This includes insufficient funds, duplicate payments, amount limits exceeded, or currency mismatches.',
    icon: 'AttachMoney',
    commonCodes: [
      { code: 'AM01', name: 'Zero Amount' },
      { code: 'AM02', name: 'Not Allowed Amount' },
      { code: 'AM03', name: 'Not Allowed Currency' },
      { code: 'AM04', name: 'Insufficient Funds' },
      { code: 'AM05', name: 'Duplication' },
      { code: 'AM09', name: 'Wrong Amount' },
    ],
    typicalCauses: [
      'Insufficient balance in debtor account',
      'Payment amount exceeds transaction or daily limits',
      'Duplicate message ID or end-to-end reference',
      'Currency not supported by corridor or account',
      'Amount validation failed (zero, negative, too many decimals)',
    ],
    resolutionApproach: 'Check account balance and available funds. Verify transaction limits with the bank. Ensure unique message IDs for each transaction. Confirm currency support for the payment corridor. Validate amount format and decimals.',
    severity: 'mixed',
  },
  {
    id: 'party',
    name: 'Party Identification Errors',
    prefix: ['BE'],
    description: 'Beneficiary and debtor identification errors occur when there are issues with party information. This includes missing names, mismatched details, or inconsistent identification between different message elements.',
    icon: 'Person',
    commonCodes: [
      { code: 'BE01', name: 'Inconsistent With End Customer' },
      { code: 'BE04', name: 'Missing Creditor Address' },
      { code: 'BE05', name: 'Unrecognised Initiating Party' },
      { code: 'BE06', name: 'Unknown End Customer' },
      { code: 'BE07', name: 'Missing Debtor Address' },
    ],
    typicalCauses: [
      'Name mismatch between account holder and payment instruction',
      'Missing or incomplete address information',
      'Beneficiary details do not match account records',
      'Special characters or formatting issues in names',
      'Country code mismatch with account location',
    ],
    resolutionApproach: 'Verify beneficiary name matches account holder exactly. Include complete address with country code. Avoid special characters that may not be supported. Check name/account matching requirements for the destination country.',
    severity: 'fatal',
  },
  {
    id: 'routing',
    name: 'Routing & Clearing Errors',
    prefix: ['RC', 'AG'],
    description: 'Routing and clearing errors occur when there are issues with bank identification codes (BIC), clearing system codes, or the routing path. These prevent the payment from reaching the correct financial institution.',
    icon: 'Route',
    commonCodes: [
      { code: 'RC01', name: 'Bank Identifier Incorrect' },
      { code: 'RC04', name: 'Invalid Creditor Bank BIC' },
      { code: 'RC07', name: 'Invalid Debtor Bank BIC' },
      { code: 'AG01', name: 'Transaction Forbidden' },
      { code: 'AG02', name: 'Invalid Bank Operation Code' },
    ],
    typicalCauses: [
      'Invalid or non-existent BIC code',
      'BIC does not match account IBAN country',
      'Bank not reachable via the payment scheme',
      'Clearing system code incorrect',
      'Intermediary bank routing issue',
    ],
    resolutionApproach: 'Validate BIC against SWIFT directory or ISO 9362. Ensure BIC matches IBAN country code. Check if bank participates in the payment scheme (SWIFT, SEPA, etc.). Verify clearing system codes are correct.',
    severity: 'fatal',
  },
  {
    id: 'regulatory',
    name: 'Regulatory & Compliance Errors',
    prefix: ['RR', 'AG', 'CUST'],
    description: 'Regulatory and compliance errors occur when payments fail due to sanctions screening, missing regulatory information, or compliance policy violations. These are often related to AML/CFT requirements.',
    icon: 'Gavel',
    commonCodes: [
      { code: 'RR01', name: 'Missing Regulatory Reporting' },
      { code: 'RR02', name: 'Invalid Regulatory Reporting' },
      { code: 'RR04', name: 'Regulatory Reason' },
      { code: 'CUST', name: 'Requested By Customer' },
      { code: 'AG07', name: 'Transaction Not Supported' },
    ],
    typicalCauses: [
      'Sanctions screening hit (OFAC, UN, EU)',
      'Missing legal entity identifier (LEI)',
      'Missing purpose of payment or remittance info',
      'Cross-border reporting requirements not met',
      'PEP (Politically Exposed Person) flagged',
    ],
    resolutionApproach: 'Check sanctions lists and PEP databases. Include all required regulatory fields (purpose code, LEI). Provide complete remittance information. Contact compliance team for sanctions hits. Ensure proper KYC/AML documentation.',
    severity: 'fatal',
  },
  {
    id: 'system',
    name: 'System & Technical Errors',
    prefix: ['FF', 'AB', 'TECH'],
    description: 'System and technical errors occur due to message format issues, system downtime, communication failures, or XML validation errors. These are often temporary and can be retried.',
    icon: 'Computer',
    commonCodes: [
      { code: 'FF01', name: 'Invalid File Format' },
      { code: 'FF05', name: 'Invalid Local Instrument' },
      { code: 'AB03', name: 'Invalid Debtor Account Number' },
      { code: 'AB05', name: 'Invalid Creditor Account Number' },
      { code: 'TECH', name: 'Technical Problem' },
    ],
    typicalCauses: [
      'XML schema validation failure',
      'Invalid characters in fields',
      'Field length exceeded',
      'System timeout or unavailable',
      'Network connectivity issues',
      'Message structure incorrect',
    ],
    resolutionApproach: 'Validate XML against ISO 20022 schema. Check character encoding (UTF-8). Verify field lengths and formats. Retry after system downtime. Review technical specifications for the payment scheme.',
    severity: 'temporary',
  },
  {
    id: 'mandate',
    name: 'Mandate Errors',
    prefix: ['MD', 'MM', 'SL'],
    description: 'Mandate-related errors occur in direct debit transactions when there are issues with the mandate (authorization). This includes missing mandates, revoked mandates, or mandate details that do not match the payment instruction.',
    icon: 'Description',
    commonCodes: [
      { code: 'MD01', name: 'No Mandate' },
      { code: 'MD02', name: 'Missing Mandatory Info' },
      { code: 'MD06', name: 'Refund Request By End Customer' },
      { code: 'MD07', name: 'End Customer Deceased' },
      { code: 'SL01', name: 'Specific Service Offered By Debtor Agent' },
    ],
    typicalCauses: [
      'Mandate not found in bank system',
      'Mandate cancelled or expired',
      'Customer disputes the debit',
      'Mandate reference incorrect',
      'First collection vs. recurring flag mismatch',
    ],
    resolutionApproach: 'Verify mandate is registered with debtor bank. Check mandate reference matches. Ensure mandate is active and not expired. For disputes, provide proof of mandate to the bank. Update mandate status in your system.',
    severity: 'fatal',
  },
  {
    id: 'datetime',
    name: 'Date & Time Errors',
    prefix: ['DT', 'CH'],
    description: 'Date and time errors occur when there are issues with timing, cut-off times, or date validation. This includes past dates, future dates beyond limits, or missed processing deadlines.',
    icon: 'Schedule',
    commonCodes: [
      { code: 'DT01', name: 'Invalid Date' },
      { code: 'DT02', name: 'Invalid Value Date' },
      { code: 'CH03', name: 'Requested Execution Date Too Far In Future' },
      { code: 'CH04', name: 'Requested Execution Date Too Soon' },
      { code: 'CH11', name: 'Cut-off Time' },
    ],
    typicalCauses: [
      'Payment submitted after daily cut-off time',
      'Requested execution date is a non-business day',
      'Date format invalid or parsing error',
      'Value date in the past',
      'Future date exceeds allowed timeframe',
    ],
    resolutionApproach: 'Check payment scheme cut-off times. Validate dates against business day calendars. Use ISO 8601 date format (YYYY-MM-DD). Ensure value date is within acceptable range. Submit payments before cut-off.',
    severity: 'temporary',
  },
];

export const getErrorTypeById = (id: string): ErrorType | undefined => {
  return ERROR_TYPES.find((et) => et.id === id);
};

export const getErrorTypeByCode = (code: string): ErrorType | undefined => {
  const prefix = code.substring(0, 2);
  return ERROR_TYPES.find((et) => et.prefix.includes(prefix));
};
