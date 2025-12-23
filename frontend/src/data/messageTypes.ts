export interface MessageField {
  path: string;
  name: string;
  description: string;
  required: boolean;
  commonErrors?: string[];
}

export interface MessageType {
  id: string;
  name: string;
  fullName: string;
  category: string;
  description: string;
  useCases: string[];
  keyFields: MessageField[];
  commonErrors: string[];
  relatedMessages: string[];
  exampleXPath: string;
}

export const MESSAGE_TYPES: MessageType[] = [
  {
    id: 'pacs.008',
    name: 'pacs.008',
    fullName: 'FIToFICustomerCreditTransfer',
    category: 'Payments Clearing and Settlement',
    description:
      'The most commonly used ISO 20022 payment message. Used by financial institutions to transfer funds on behalf of their customers to another financial institution. This is the core credit transfer message in SWIFT and domestic clearing systems.',
    useCases: [
      'Cross-border customer payments (SWIFT gpi)',
      'Domestic instant payments (FedNow, TIPS, Faster Payments)',
      'SEPA Credit Transfers (SCT)',
      'Corporate treasury payments',
      'Payroll and supplier payments',
    ],
    keyFields: [
      {
        path: '/Document/FIToFICstmrCdtTrf/GrpHdr/MsgId',
        name: 'Message ID',
        description: 'Unique identifier assigned by the instructing party',
        required: true,
        commonErrors: ['AM05 - Duplicate Message ID'],
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/GrpHdr/CreDtTm',
        name: 'Creation DateTime',
        description: 'Date and time when the message was created',
        required: true,
        commonErrors: ['DT01 - Invalid Date'],
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/GrpHdr/NbOfTxs',
        name: 'Number of Transactions',
        description: 'Total count of individual transactions in the message',
        required: true,
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/GrpHdr/SttlmInf/SttlmMtd',
        name: 'Settlement Method',
        description: 'Method used to settle the payment (INDA, INGA, COVE, CLRG)',
        required: true,
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/InstrId',
        name: 'Instruction ID',
        description: 'Unique ID assigned by instructing party for the transaction',
        required: false,
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/EndToEndId',
        name: 'End-to-End ID',
        description: 'Unique ID assigned by the originator, passed through entire chain',
        required: true,
        commonErrors: ['FF01 - Invalid End-to-End ID format'],
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/PmtId/UETR',
        name: 'UETR',
        description: 'Unique End-to-end Transaction Reference (SWIFT gpi)',
        required: true,
        commonErrors: ['FF01 - Missing or invalid UETR'],
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt',
        name: 'Interbank Settlement Amount',
        description: 'Amount to be settled between financial institutions',
        required: true,
        commonErrors: ['AM01 - Zero Amount', 'AM02 - Amount exceeds limit'],
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/ChrgBr',
        name: 'Charge Bearer',
        description: 'Party that bears the charges (DEBT, CRED, SHAR, SLEV)',
        required: true,
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Dbtr',
        name: 'Debtor',
        description: 'Party that owes the money (payer/originator)',
        required: true,
        commonErrors: ['BE01 - Inconsistent Debtor information'],
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAcct/Id/IBAN',
        name: 'Debtor Account (IBAN)',
        description: 'Account of the debtor to be debited',
        required: true,
        commonErrors: ['AC01 - Invalid Account', 'AC04 - Closed Account'],
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/DbtrAgt/FinInstnId/BICFI',
        name: 'Debtor Agent BIC',
        description: 'BIC of the debtor\'s financial institution',
        required: true,
        commonErrors: ['RC01 - Invalid BIC'],
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI',
        name: 'Creditor Agent BIC',
        description: 'BIC of the creditor\'s financial institution',
        required: true,
        commonErrors: ['RC01 - Invalid BIC', 'AG01 - Agent not found'],
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr',
        name: 'Creditor',
        description: 'Party that receives the money (beneficiary)',
        required: true,
        commonErrors: ['BE04 - Missing Creditor information'],
      },
      {
        path: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAcct/Id/IBAN',
        name: 'Creditor Account (IBAN)',
        description: 'Account of the creditor to be credited',
        required: true,
        commonErrors: ['AC01 - Invalid Account', 'AC06 - Blocked Account'],
      },
    ],
    commonErrors: [
      'AC01 - Incorrect Account Number',
      'AC04 - Closed Account Number',
      'AC06 - Blocked Account',
      'AG01 - Transaction Forbidden (Agent)',
      'AM01 - Zero Amount',
      'AM02 - Not Allowed Amount',
      'AM05 - Duplication',
      'BE01 - Inconsistent With End Customer',
      'RC01 - Bank Identifier Incorrect',
      'FF01 - Invalid File Format',
    ],
    relatedMessages: ['pacs.002', 'pacs.004', 'camt.053', 'camt.054'],
    exampleXPath: '/Document/FIToFICstmrCdtTrf/CdtTrfTxInf[1]/PmtId/EndToEndId',
  },
  {
    id: 'pacs.009',
    name: 'pacs.009',
    fullName: 'FinancialInstitutionCreditTransfer',
    category: 'Payments Clearing and Settlement',
    description:
      'Used for credit transfers between financial institutions where no underlying customer payment exists. Typically used for bank-to-bank transfers, cover payments, treasury movements, and interbank settlements.',
    useCases: [
      'Cover payments for correspondent banking',
      'Interbank liquidity transfers',
      'Treasury and funding operations',
      'Nostro/Vostro account funding',
      'Central bank settlement movements',
    ],
    keyFields: [
      {
        path: '/Document/FICdtTrf/GrpHdr/MsgId',
        name: 'Message ID',
        description: 'Unique identifier for the message',
        required: true,
        commonErrors: ['AM05 - Duplicate Message ID'],
      },
      {
        path: '/Document/FICdtTrf/GrpHdr/CreDtTm',
        name: 'Creation DateTime',
        description: 'Date and time when the message was created',
        required: true,
      },
      {
        path: '/Document/FICdtTrf/GrpHdr/NbOfTxs',
        name: 'Number of Transactions',
        description: 'Total count of credit transfer instructions',
        required: true,
      },
      {
        path: '/Document/FICdtTrf/GrpHdr/SttlmInf/SttlmMtd',
        name: 'Settlement Method',
        description: 'Settlement method (typically INDA or CLRG)',
        required: true,
      },
      {
        path: '/Document/FICdtTrf/CdtTrfTxInf/PmtId/InstrId',
        name: 'Instruction ID',
        description: 'Unique instruction identifier',
        required: false,
      },
      {
        path: '/Document/FICdtTrf/CdtTrfTxInf/PmtId/EndToEndId',
        name: 'End-to-End ID',
        description: 'End-to-end reference (often NOTPROVIDED for FI transfers)',
        required: true,
      },
      {
        path: '/Document/FICdtTrf/CdtTrfTxInf/PmtId/UETR',
        name: 'UETR',
        description: 'Unique End-to-end Transaction Reference',
        required: true,
      },
      {
        path: '/Document/FICdtTrf/CdtTrfTxInf/IntrBkSttlmAmt',
        name: 'Interbank Settlement Amount',
        description: 'Amount and currency of the transfer',
        required: true,
        commonErrors: ['AM01 - Zero Amount', 'AM03 - Currency mismatch'],
      },
      {
        path: '/Document/FICdtTrf/CdtTrfTxInf/InstgAgt/FinInstnId/BICFI',
        name: 'Instructing Agent BIC',
        description: 'BIC of the instructing financial institution',
        required: true,
        commonErrors: ['RC01 - Invalid BIC'],
      },
      {
        path: '/Document/FICdtTrf/CdtTrfTxInf/InstdAgt/FinInstnId/BICFI',
        name: 'Instructed Agent BIC',
        description: 'BIC of the instructed financial institution',
        required: true,
        commonErrors: ['RC01 - Invalid BIC'],
      },
      {
        path: '/Document/FICdtTrf/CdtTrfTxInf/Dbtr/FinInstnId/BICFI',
        name: 'Debtor FI BIC',
        description: 'BIC of the debtor financial institution',
        required: true,
      },
      {
        path: '/Document/FICdtTrf/CdtTrfTxInf/DbtrAcct/Id/Othr/Id',
        name: 'Debtor Account',
        description: 'Account identifier at the debtor FI',
        required: false,
      },
      {
        path: '/Document/FICdtTrf/CdtTrfTxInf/Cdtr/FinInstnId/BICFI',
        name: 'Creditor FI BIC',
        description: 'BIC of the creditor financial institution',
        required: true,
      },
      {
        path: '/Document/FICdtTrf/CdtTrfTxInf/CdtrAcct/Id/Othr/Id',
        name: 'Creditor Account',
        description: 'Account identifier at the creditor FI',
        required: false,
      },
    ],
    commonErrors: [
      'AC01 - Incorrect Account Number',
      'AG01 - Transaction Forbidden',
      'AM01 - Zero Amount',
      'AM03 - Not Allowed Currency',
      'AM05 - Duplication',
      'RC01 - Bank Identifier Incorrect',
      'RC04 - Creditor Bank Identifier Incorrect',
      'FOCR - Following Cancellation Request',
    ],
    relatedMessages: ['pacs.002', 'pacs.008', 'camt.056'],
    exampleXPath: '/Document/FICdtTrf/CdtTrfTxInf[1]/IntrBkSttlmAmt',
  },
  {
    id: 'camt.053',
    name: 'camt.053',
    fullName: 'BankToCustomerStatement',
    category: 'Cash Management',
    description:
      'Provides detailed information about all entries booked to an account. Used to report end-of-day account statements to customers, including opening/closing balances, all transactions, and their details. Essential for reconciliation and cash management.',
    useCases: [
      'End-of-day account statements',
      'Cash position reporting',
      'Treasury reconciliation',
      'Automated cash management',
      'Corporate ERP integration',
      'Regulatory reporting inputs',
    ],
    keyFields: [
      {
        path: '/Document/BkToCstmrStmt/GrpHdr/MsgId',
        name: 'Message ID',
        description: 'Unique message identifier',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/GrpHdr/CreDtTm',
        name: 'Creation DateTime',
        description: 'When the statement was generated',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Id',
        name: 'Statement ID',
        description: 'Unique identifier for the statement',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/ElctrncSeqNb',
        name: 'Electronic Sequence Number',
        description: 'Sequential number for statement ordering',
        required: false,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/CreDtTm',
        name: 'Statement Creation DateTime',
        description: 'When this specific statement was created',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/FrToDt/FrDtTm',
        name: 'From DateTime',
        description: 'Start of the statement period',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/FrToDt/ToDtTm',
        name: 'To DateTime',
        description: 'End of the statement period',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Acct/Id/IBAN',
        name: 'Account IBAN',
        description: 'IBAN of the account being reported',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Acct/Ccy',
        name: 'Account Currency',
        description: 'Currency of the account',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Bal/Tp/CdOrPrtry/Cd',
        name: 'Balance Type Code',
        description: 'Type of balance (OPBD, CLBD, ITBD, etc.)',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Bal/Amt',
        name: 'Balance Amount',
        description: 'Balance amount with currency',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Bal/CdtDbtInd',
        name: 'Credit/Debit Indicator',
        description: 'Whether balance is credit (CRDT) or debit (DBIT)',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Ntry/Amt',
        name: 'Entry Amount',
        description: 'Amount of the transaction entry',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Ntry/CdtDbtInd',
        name: 'Entry Credit/Debit',
        description: 'Whether entry is credit or debit',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Ntry/Sts/Cd',
        name: 'Entry Status',
        description: 'Status of entry (BOOK, PDNG, INFO)',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Ntry/BookgDt/Dt',
        name: 'Booking Date',
        description: 'Date when entry was booked',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Ntry/ValDt/Dt',
        name: 'Value Date',
        description: 'Value date of the entry',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Ntry/BkTxCd/Domn/Cd',
        name: 'Bank Transaction Code Domain',
        description: 'Domain of the transaction (PMNT, CAMT, etc.)',
        required: true,
      },
      {
        path: '/Document/BkToCstmrStmt/Stmt/Ntry/NtryDtls/TxDtls/Refs/EndToEndId',
        name: 'Entry End-to-End ID',
        description: 'End-to-end reference from original payment',
        required: false,
      },
    ],
    commonErrors: [
      'AC01 - Incorrect Account Number',
      'DT01 - Invalid Date',
      'AM03 - Currency Mismatch',
      'NARR - Missing Narrative',
      'FF01 - Invalid File Format',
      'DUPL - Duplicate Statement',
    ],
    relatedMessages: ['camt.052', 'camt.054', 'pacs.008', 'pacs.002'],
    exampleXPath: '/Document/BkToCstmrStmt/Stmt/Ntry[1]/NtryDtls/TxDtls/Refs/EndToEndId',
  },
];

export const getMessageTypeById = (id: string): MessageType | undefined => {
  return MESSAGE_TYPES.find((mt) => mt.id === id);
};
