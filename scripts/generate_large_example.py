#!/usr/bin/env python3
"""
Generate a comprehensive 200-step treasury example with ~100 message types.
"""

import json
from datetime import datetime

def generate_comprehensive_example():
    """Generate a comprehensive 200-step treasury operations example."""

    # All ISO 20022 message types to use (~100 unique types)
    message_catalog = {
        # Payment Initiation (pain.*)
        "pain.001": "CustomerCreditTransferInitiation",
        "pain.002": "CustomerPaymentStatusReport",
        "pain.007": "CustomerPaymentReversal",
        "pain.008": "CustomerDirectDebitInitiation",
        "pain.009": "MandateInitiationRequest",
        "pain.010": "MandateAmendmentRequest",
        "pain.011": "MandateCancellationRequest",
        "pain.012": "MandateAcceptanceReport",
        "pain.013": "CreditorPaymentActivationRequest",
        "pain.014": "CreditorPaymentActivationRequestStatusReport",

        # Payments Clearing & Settlement (pacs.*)
        "pacs.002": "FIToFIPaymentStatusReport",
        "pacs.003": "FIToFICustomerDirectDebit",
        "pacs.004": "PaymentReturn",
        "pacs.007": "FIToFIPaymentReversal",
        "pacs.008": "FIToFICustomerCreditTransfer",
        "pacs.009": "FinancialInstitutionCreditTransfer",
        "pacs.010": "FinancialInstitutionDirectDebit",
        "pacs.028": "FIToFIPaymentStatusRequest",

        # Cash Management (camt.*)
        "camt.026": "UnableToApply",
        "camt.027": "ClaimNonReceipt",
        "camt.028": "AdditionalPaymentInformation",
        "camt.029": "ResolutionOfInvestigation",
        "camt.030": "NotificationOfCaseAssignment",
        "camt.052": "BankToCustomerAccountReport",
        "camt.053": "BankToCustomerStatement",
        "camt.054": "BankToCustomerDebitCreditNotification",
        "camt.055": "CustomerPaymentCancellationRequest",
        "camt.056": "FIToFIPaymentCancellationRequest",
        "camt.057": "NotificationToReceive",
        "camt.058": "NotificationToReceiveCancellationAdvice",
        "camt.059": "NotificationToReceiveStatusReport",
        "camt.060": "AccountReportingRequest",

        # Account Management (acmt.*)
        "acmt.001": "AccountOpeningInstruction",
        "acmt.002": "AccountDetailsConfirmation",
        "acmt.003": "AccountModificationInstruction",
        "acmt.007": "AccountOpeningRequest",
        "acmt.009": "AccountOpeningAdditionalInformationRequest",
        "acmt.010": "AccountRequestAcknowledgement",
        "acmt.014": "AccountReport",
        "acmt.022": "IdentificationModificationAdvice",
        "acmt.023": "IdentificationVerificationRequest",
        "acmt.024": "IdentificationVerificationReport",

        # Securities Settlement (sese.*)
        "sese.001": "TransferOutInstruction",
        "sese.003": "TransferOutConfirmation",
        "sese.005": "TransferInInstruction",
        "sese.007": "TransferInConfirmation",
        "sese.011": "TransferInstructionStatusReport",
        "sese.020": "SecuritiesTransactionCancellationRequest",
        "sese.023": "SecuritiesSettlementTransactionInstruction",
        "sese.024": "SecuritiesSettlementTransactionStatusAdvice",
        "sese.025": "SecuritiesSettlementTransactionConfirmation",
        "sese.033": "SecuritiesFinancingInstruction",
        "sese.034": "SecuritiesFinancingConfirmation",

        # Securities Management (semt.*)
        "semt.002": "CustodyStatementOfHoldings",
        "semt.003": "AccountingStatementOfHoldings",
        "semt.013": "IntraPositionMovementInstruction",
        "semt.015": "IntraPositionMovementConfirmation",
        "semt.017": "SecuritiesTransactionPostingReport",
        "semt.018": "SecuritiesTransactionPendingReport",
        "semt.021": "SecuritiesStatementQuery",
        "semt.022": "SecuritiesSettlementTransactionAuditTrailReport",

        # Corporate Actions (seev.*)
        "seev.001": "MeetingNotification",
        "seev.004": "MeetingInstruction",
        "seev.006": "MeetingInstructionStatus",
        "seev.031": "CorporateActionNotification",
        "seev.033": "CorporateActionInstruction",
        "seev.034": "CorporateActionInstructionStatusAdvice",
        "seev.035": "CorporateActionMovementPreliminaryAdvice",
        "seev.036": "CorporateActionMovementConfirmation",
        "seev.042": "CorporateActionInstructionStatementReport",

        # Treasury (trea.*)
        "trea.001": "CreateNonDeliverableForwardOpeningNotification",
        "trea.007": "NonDeliverableForwardNotificationStatus",
        "trea.009": "StatusNotification",
        "trea.012": "ForeignExchangeTradeConfirmation",

        # Foreign Exchange (fxtr.*)
        "fxtr.008": "ForeignExchangeTradeInstruction",
        "fxtr.013": "ForeignExchangeTradeStatusNotification",
        "fxtr.015": "ForeignExchangeTradeConfirmationRequest",
        "fxtr.030": "ForeignExchangeTradeConfirmation",

        # Collateral Management (colr.*)
        "colr.003": "MarginCallRequest",
        "colr.004": "MarginCallResponse",
        "colr.007": "CollateralProposal",
        "colr.008": "CollateralProposalResponse",
        "colr.012": "CollateralValueReport",
        "colr.016": "CollateralAndExposureReport",

        # Trade Services (tsmt.*)
        "tsmt.001": "Acknowledgement",
        "tsmt.013": "DataSetMatchReport",
        "tsmt.014": "DataSetSubmission",
        "tsmt.017": "FullPushThroughReport",
        "tsmt.018": "InitialBaselineSubmission",
        "tsmt.044": "IntentToPayNotification",
        "tsmt.049": "SpecialNotification",

        # Card Acceptor (caaa.*)
        "caaa.001": "AcceptorAuthorisationRequest",
        "caaa.002": "AcceptorAuthorisationResponse",
        "caaa.003": "AcceptorCompletionAdvice",
        "caaa.004": "AcceptorCompletionAdviceResponse",
        "caaa.005": "AcceptorCancellationRequest",
        "caaa.006": "AcceptorCancellationResponse",
        "caaa.009": "AcceptorReconciliationRequest",
        "caaa.010": "AcceptorReconciliationResponse",
        "caaa.011": "AcceptorBatchTransfer",
        "caaa.012": "AcceptorBatchTransferResponse",
        "caaa.016": "AcceptorCurrencyConversionRequest",
        "caaa.017": "AcceptorCurrencyConversionResponse",

        # Card Issuer (cain.*)
        "cain.001": "AcquirerAuthorisationRequest",
        "cain.002": "AcquirerAuthorisationResponse",
        "cain.003": "AcquirerCompletionAdvice",
        "cain.004": "AcquirerCompletionAdviceResponse",

        # ATM Management (catm.*)
        "catm.001": "StatusReport",
        "catm.002": "ManagementPlanReplacement",
        "catm.003": "AcceptorConfigurationUpdate",

        # ATM Transactions (catp.*)
        "catp.001": "ATMWithdrawalRequest",
        "catp.002": "ATMWithdrawalResponse",
        "catp.003": "ATMWithdrawalCompletionAdvice",
        "catp.004": "ATMWithdrawalCompletionAcknowledgement",
        "catp.006": "ATMInquiryRequest",
        "catp.007": "ATMInquiryResponse",

        # Administration (admi.*)
        "admi.002": "Resend",
        "admi.004": "SystemEventNotification",
        "admi.005": "ReportQueryRequest",
        "admi.006": "ReportQueryResponse",
        "admi.007": "ReceiptAcknowledgement",
        "admi.011": "SystemEventAcknowledgement",

        # Authorities (auth.*)
        "auth.018": "ContractRegistrationRequest",
        "auth.019": "ContractRegistrationConfirmation",
        "auth.024": "PaymentRegulatoryInformationNotification",
        "auth.027": "CurrencyControlStatusAdvice",

        # Reference Data (reda.*)
        "reda.016": "PartyStatusAdvice",
        "reda.017": "PartyModificationRequest",
        "reda.041": "StandingSettlementInstructionCreationRequest",
        "reda.057": "StandingSettlementInstructionReport",
    }

    steps = []

    # Define step templates for each phase
    step_templates = [
        # PHASE 1: ASIA-PACIFIC MORNING (Steps 1-25)
        ("GlobalCorp Asia", "DBS Bank", "Request intraday balance", "Singapore treasury starts the day requesting real-time balance at 8:00 AM SGT.", "camt.060 AccountReportingRequest for intraday balance.", "camt.060", ["ReportType: INTRADAY", "Currency: SGD"]),
        ("DBS Bank", "GlobalCorp Asia", "Provide balance report", "DBS responds with current position showing SGD 15.2M available.", "camt.052 BankToCustomerAccountReport with real-time balance.", "camt.052", ["Balance: 15,200,000 SGD", "AvailableBalance: 14,800,000 SGD"]),
        ("GlobalCorp Asia", "DBS Bank", "Request previous day statement", "Request EOD statement from previous business day for reconciliation.", "camt.060 requesting previous day statement.", "camt.060", ["ReportType: PREVIOUS_DAY", "StatementDate: Yesterday"]),
        ("DBS Bank", "GlobalCorp Asia", "Deliver EOD statement", "Full previous day statement with 47 transactions.", "camt.053 BankToCustomerStatement.", "camt.053", ["TransactionCount: 47", "NetMovement: +1,700,000 SGD"]),
        ("GlobalCorp Asia", "Tokyo Electronics", "Send payment reminder", "Notify Japanese customer about upcoming payment due.", "camt.057 NotificationToReceive.", "camt.057", ["ExpectedAmount: 5,000,000 JPY", "DueDate: Today"]),
        ("Tokyo Electronics", "MUFG", "Initiate payment", "Japanese customer initiates payment for invoice.", "pain.001 CustomerCreditTransferInitiation.", "pain.001", ["Amount: 5,000,000 JPY", "Creditor: GlobalCorp Asia"]),
        ("MUFG", "Tokyo Electronics", "Confirm payment acceptance", "MUFG confirms payment accepted for processing.", "pain.002 CustomerPaymentStatusReport - ACCP.", "pain.002", ["Status: ACCP", "ProcessingDate: Today"]),
        ("MUFG", "DBS Bank", "Route payment via SWIFT", "MUFG routes cross-border payment through SWIFT.", "pacs.008 FIToFICustomerCreditTransfer.", "pacs.008", ["UETR: Generated", "ChargeBearer: SHA"]),
        ("DBS Bank", "MUFG", "Confirm payment receipt", "DBS acknowledges receipt of incoming payment.", "pacs.002 FIToFIPaymentStatusReport - ACSP.", "pacs.002", ["Status: ACSP", "SettlementDate: Today"]),
        ("DBS Bank", "GlobalCorp Asia", "Credit notification", "Real-time notification of JPY credit.", "camt.054 BankToCustomerDebitCreditNotification.", "camt.054", ["CreditAmount: 5,000,000 JPY", "ConvertedAmount: 45,000 SGD"]),
        ("GlobalCorp Asia", "DBS Bank", "Acknowledge notification", "Confirm receipt of credit notification.", "camt.059 NotificationToReceiveStatusReport.", "camt.059", ["Status: RCVD", "OriginalRef: camt.057"]),
        ("GlobalCorp Asia", "DBS Bank", "Request account opening", "Request new account for Vietnam subsidiary.", "acmt.007 AccountOpeningRequest.", "acmt.007", ["AccountType: Current", "Currency: VND"]),
        ("DBS Bank", "GlobalCorp Asia", "Acknowledge account request", "Bank acknowledges account opening request.", "acmt.010 AccountRequestAcknowledgement.", "acmt.010", ["Status: RCVD", "ExpectedCompletion: T+2"]),
        ("DBS Bank", "GlobalCorp Asia", "Request additional KYC", "Bank requests additional compliance documents.", "acmt.009 AccountOpeningAdditionalInformationRequest.", "acmt.009", ["RequiredInfo: UBO declaration", "Deadline: T+5"]),
        ("GlobalCorp Asia", "CitiFX", "Request FX quote", "Request spot FX quote for USD/SGD.", "fxtr.015 ForeignExchangeTradeConfirmationRequest.", "fxtr.015", ["CurrencyPair: USD/SGD", "Amount: 2,000,000 USD"]),
        ("CitiFX", "GlobalCorp Asia", "Provide FX quote", "FX dealer provides executable quote.", "fxtr.013 ForeignExchangeTradeStatusNotification.", "fxtr.013", ["Rate: 1.3425", "ValidUntil: 30 seconds"]),
        ("GlobalCorp Asia", "CitiFX", "Execute FX trade", "Accept and execute FX trade at quoted rate.", "fxtr.008 ForeignExchangeTradeInstruction.", "fxtr.008", ["TradeId: Generated", "Rate: 1.3425"]),
        ("CitiFX", "GlobalCorp Asia", "Confirm FX execution", "Confirmation of FX trade with settlement details.", "fxtr.030 ForeignExchangeTradeConfirmation.", "fxtr.030", ["SettlementDate: T+2", "Status: CONF"]),
        ("GlobalCorp Asia", "State Street", "Report FX exposure", "Report new FX position to custodian.", "trea.009 StatusNotification.", "trea.009", ["PositionType: FX_SPOT", "Exposure: USD 2M"]),
        ("GlobalCorp Asia", "GlobalCorp Treasury", "Report APAC liquidity", "Report consolidated Asia-Pacific position to HQ.", "Internal treasury report.", "camt.052", ["Region: APAC", "TotalLiquidity: USD 28.5M"]),
        ("GlobalCorp Asia", "DBS Bank", "Submit supplier payment", "Pay Chinese supplier for goods.", "pain.001 CustomerCreditTransferInitiation.", "pain.001", ["Amount: 500,000 USD", "Beneficiary: Shanghai Mfg"]),
        ("DBS Bank", "GlobalCorp Asia", "Confirm payment submission", "Bank confirms payment accepted.", "pain.002 CustomerPaymentStatusReport.", "pain.002", ["Status: ACCP", "ValueDate: Today"]),
        ("DBS Bank", "Bank of China", "Route to China", "Route payment to Bank of China.", "pacs.008 FIToFICustomerCreditTransfer.", "pacs.008", ["Route: SWIFT", "Currency: USD"]),
        ("Bank of China", "DBS Bank", "Confirm receipt", "Bank of China confirms receipt.", "pacs.002 FIToFIPaymentStatusReport.", "pacs.002", ["Status: ACSC", "SettlementTime: T+0"]),
        ("GlobalCorp Asia", "DBS Bank", "Request reconciliation", "Request daily reconciliation summary.", "admi.005 ReportQueryRequest.", "admi.005", ["ReportType: Reconciliation", "AsOfDate: Today"]),

        # PHASE 2: EUROPEAN MORNING (Steps 26-55)
        ("GlobalCorp EU", "Deutsche Bank", "Morning liquidity check", "Frankfurt treasury requests morning balance at 8:00 AM CET.", "camt.060 AccountReportingRequest.", "camt.060", ["Currency: EUR", "ReportType: INTRADAY"]),
        ("Deutsche Bank", "GlobalCorp EU", "Provide EUR balance", "Deutsche Bank provides current EUR position.", "camt.052 BankToCustomerAccountReport.", "camt.052", ["Balance: 8,700,000 EUR", "ExpectedDebits: 2,100,000 EUR"]),
        ("GlobalCorp EU", "German Parts GmbH", "Pay supplier via SEPA", "Initiate SEPA credit transfer to German supplier.", "pain.001 CustomerCreditTransferInitiation.", "pain.001", ["Amount: 125,000 EUR", "Scheme: SEPA_CT"]),
        ("Deutsche Bank", "GlobalCorp EU", "Confirm SEPA payment", "Confirm SEPA payment submitted to clearing.", "pain.002 CustomerPaymentStatusReport.", "pain.002", ["Status: ACCP", "Scheme: SEPA_CT"]),
        ("Deutsche Bank", "TARGET2", "Submit to TARGET2", "Submit high-value payment to TARGET2.", "pacs.008 FIToFICustomerCreditTransfer.", "pacs.008", ["ClearingSystem: TGT", "Priority: NORM"]),
        ("TARGET2", "Commerzbank", "Route to beneficiary", "TARGET2 routes payment in real-time.", "pacs.008 forwarded through RTGS.", "pacs.008", ["Status: STTL", "SettlementTime: Immediate"]),
        ("Commerzbank", "TARGET2", "Confirm settlement", "Commerzbank confirms receipt.", "pacs.002 FIToFIPaymentStatusReport.", "pacs.002", ["Status: ACSC", "BookingTime: 09:15 CET"]),
        ("Commerzbank", "German Parts GmbH", "Credit beneficiary", "Supplier account credited.", "camt.054 BankToCustomerDebitCreditNotification.", "camt.054", ["CreditAmount: 125,000 EUR", "ValueDate: Today"]),
        ("GlobalCorp EU", "Deutsche Bank", "Submit direct debit", "Submit SEPA Direct Debit collection.", "pain.008 CustomerDirectDebitInitiation.", "pain.008", ["Amount: 50,000 EUR", "MandateId: MNDT-2025-UK001"]),
        ("Deutsche Bank", "GlobalCorp EU", "Confirm DD submission", "Bank confirms direct debit submitted.", "pain.002 CustomerPaymentStatusReport.", "pain.002", ["Status: ACTC", "CollectionDate: D+2"]),
        ("Deutsche Bank", "HSBC", "Forward DD collection", "Forward collection to debtor's bank.", "pacs.003 FIToFICustomerDirectDebit.", "pacs.003", ["MandateId: MNDT-2025-UK001", "Amount: 50,000 EUR"]),
        ("HSBC", "British Retail PLC", "Notify pending debit", "Notify customer of upcoming debit.", "camt.054 BankToCustomerDebitCreditNotification.", "camt.054", ["DebitAmount: 50,000 EUR", "CollectionDate: D+2"]),
        ("GlobalCorp EU", "Deutsche Bank", "Request mandate amendment", "Request to increase DD mandate limit.", "pain.010 MandateAmendmentRequest.", "pain.010", ["MandateId: MNDT-2025-UK001", "NewMaxAmount: 75,000 EUR"]),
        ("Deutsche Bank", "GlobalCorp EU", "Confirm mandate amendment", "Bank confirms mandate change.", "pain.012 MandateAcceptanceReport.", "pain.012", ["Status: ACCP", "NewLimit: 75,000 EUR"]),
        ("GlobalCorp EU", "State Street", "Instruct bond purchase", "Instruct EUR 5M German bond purchase settlement.", "sese.023 SecuritiesSettlementTransactionInstruction.", "sese.023", ["ISIN: DE0001102481", "SettlementDate: T+2"]),
        ("State Street", "Euroclear", "Forward settlement instruction", "Custodian forwards to CSD.", "sese.023 forwarded for DVP settlement.", "sese.023", ["DeliveryReceiveIndicator: RECE", "PaymentType: DVP"]),
        ("Euroclear", "State Street", "Confirm matching", "CSD confirms instruction matched.", "sese.024 SecuritiesSettlementTransactionStatusAdvice.", "sese.024", ["Status: MTCH", "ExpectedSettlement: T+2"]),
        ("State Street", "GlobalCorp EU", "Report matched status", "Custodian reports matched status.", "semt.017 SecuritiesTransactionPostingReport.", "semt.017", ["TransactionType: Purchase", "Status: Matched"]),
        ("Euroclear", "State Street", "Dividend notification", "CSD notifies of upcoming dividend.", "seev.031 CorporateActionNotification.", "seev.031", ["EventType: DVCA", "ExDate: T+5"]),
        ("State Street", "GlobalCorp EU", "Forward dividend notification", "Custodian forwards corporate action.", "seev.031 forwarded with holding details.", "seev.031", ["HeldQuantity: 50,000", "GrossAmount: 25,000 EUR"]),
        ("GlobalCorp EU", "State Street", "Elect dividend option", "Client elects cash dividend.", "seev.033 CorporateActionInstruction.", "seev.033", ["ElectedOption: CASH", "Quantity: 50,000"]),
        ("State Street", "GlobalCorp EU", "Confirm election", "Custodian confirms election received.", "seev.034 CorporateActionInstructionStatusAdvice.", "seev.034", ["Status: RCVD", "Deadline: T+3"]),
        ("GlobalCorp EU", "Deutsche Bank", "Inquire missing payment", "Request investigation on missing payment.", "camt.027 ClaimNonReceipt.", "camt.027", ["ExpectedAmount: 45,000 EUR", "ExpectedDate: Yesterday"]),
        ("Deutsche Bank", "GlobalCorp EU", "Acknowledge investigation", "Bank acknowledges investigation request.", "camt.030 NotificationOfCaseAssignment.", "camt.030", ["CaseId: INV-2026-0145", "Status: OPEN"]),
        ("Deutsche Bank", "Commerzbank", "Request payment trace", "Request trace from originating bank.", "camt.028 AdditionalPaymentInformation.", "camt.028", ["OriginalAmount: 45,000 EUR", "TraceRequest: Yes"]),
        ("Commerzbank", "Deutsche Bank", "Provide payment proof", "Originating bank provides confirmation.", "camt.028 response with settlement proof.", "camt.028", ["PaymentStatus: SETTLED", "SettlementDate: Yesterday"]),
        ("Deutsche Bank", "GlobalCorp EU", "Resolve investigation", "Bank resolves case - found in suspense.", "camt.029 ResolutionOfInvestigation.", "camt.029", ["Resolution: MODI", "CreditDate: Today"]),
        ("GlobalCorp EU", "State Street", "Request holdings statement", "Request securities holdings for month-end.", "semt.021 SecuritiesStatementQuery.", "semt.021", ["StatementType: Holdings", "AsOfDate: Month-end"]),
        ("State Street", "GlobalCorp EU", "Deliver holdings statement", "Custodian delivers holdings report.", "semt.002 CustodyStatementOfHoldings.", "semt.002", ["TotalPositions: 47", "TotalValue: 125,000,000 EUR"]),
        ("GlobalCorp EU", "GlobalCorp Treasury", "Report EU position", "Report consolidated EU position to HQ.", "Internal treasury consolidation.", "camt.053", ["Region: EMEA", "TotalLiquidity: USD 142M"]),

        # PHASE 3: US MORNING (Steps 56-90)
        ("GlobalCorp Treasury", "JP Morgan", "Morning liquidity report", "US treasury requests morning position at 8:00 AM EST.", "camt.060 AccountReportingRequest.", "camt.060", ["Accounts: All USD", "ReportType: INTRADAY"]),
        ("JP Morgan", "GlobalCorp Treasury", "Deliver consolidated report", "JP Morgan provides consolidated USD position.", "camt.052 BankToCustomerAccountReport.", "camt.052", ["ConsolidatedBalance: 45,200,000 USD", "AccountCount: 5"]),
        ("GlobalCorp Treasury", "JP Morgan", "Initiate wire to supplier", "Send high-value wire to Chinese supplier.", "pain.001 CustomerCreditTransferInitiation.", "pain.001", ["Amount: 2,500,000 USD", "BeneficiaryBank: Bank of China"]),
        ("JP Morgan", "GlobalCorp Treasury", "Confirm wire acceptance", "JP Morgan confirms wire accepted for Fedwire.", "pain.002 CustomerPaymentStatusReport.", "pain.002", ["Status: ACCP", "Channel: FEDWIRE"]),
        ("JP Morgan", "Federal Reserve", "Submit to Fedwire", "Submit payment to Fedwire for immediate settlement.", "pacs.009 FinancialInstitutionCreditTransfer.", "pacs.009", ["SettlementMethod: INGA", "Priority: HIGH"]),
        ("Federal Reserve", "Bank of China NY", "Settle via Fedwire", "Fed settles payment to Bank of China correspondent.", "pacs.009 settled in Fed reserves.", "pacs.009", ["Status: STTL", "SettlementTime: Immediate"]),
        ("Bank of China NY", "Federal Reserve", "Confirm receipt", "Bank of China confirms Fedwire receipt.", "pacs.002 FIToFIPaymentStatusReport.", "pacs.002", ["Status: ACSC", "BookingTime: 08:45 EST"]),
        ("JP Morgan", "GlobalCorp Treasury", "Wire confirmation", "Confirm wire settled via Fedwire.", "camt.054 BankToCustomerDebitCreditNotification.", "camt.054", ["DebitAmount: 2,500,000 USD", "Reference: Fedwire"]),
        ("GlobalCorp US", "Wells Fargo", "Submit payroll batch", "Submit semi-monthly payroll for 2,500 employees.", "pain.001 batch with 2,500 instructions.", "pain.001", ["BatchSize: 2,500", "TotalAmount: 12,500,000 USD"]),
        ("Wells Fargo", "GlobalCorp US", "Confirm payroll acceptance", "Bank confirms payroll batch accepted.", "pain.002 CustomerPaymentStatusReport.", "pain.002", ["AcceptedCount: 2,500", "RejectCount: 0"]),
        ("Wells Fargo", "Federal Reserve", "Submit to ACH", "Bank submits payroll to ACH network.", "pacs.008 batch to ACH.", "pacs.008", ["Channel: ACH", "SettlementDate: Tomorrow"]),
        ("GlobalCorp Treasury", "JP Morgan", "Initiate CHIPS payment", "Large vendor payment via CHIPS.", "pain.001 for USD 8M via CHIPS.", "pain.001", ["Amount: 8,000,000 USD", "Channel: CHIPS"]),
        ("JP Morgan", "CHIPS", "Submit to CHIPS", "Submit to CHIPS for multilateral netting.", "pacs.008 to CHIPS clearing.", "pacs.008", ["ClearingSystem: CHIPS", "SettlementMethod: INDA"]),
        ("GlobalCorp Treasury", "CitiFX", "Request USD/EUR quote", "Request FX quote for EUR receipts.", "fxtr.015 for USD/EUR spot.", "fxtr.015", ["CurrencyPair: EUR/USD", "Amount: 5,000,000 EUR"]),
        ("CitiFX", "GlobalCorp Treasury", "Provide USD/EUR quote", "Dealer provides live quote.", "fxtr.013 ForeignExchangeTradeStatusNotification.", "fxtr.013", ["Rate: 1.0825", "ValidUntil: 15 seconds"]),
        ("GlobalCorp Treasury", "CitiFX", "Execute FX trade", "Execute trade at quoted rate.", "fxtr.008 ForeignExchangeTradeInstruction.", "fxtr.008", ["TradeId: FX-2026-0892", "Rate: 1.0825"]),
        ("CitiFX", "GlobalCorp Treasury", "Confirm FX trade", "Full trade confirmation.", "fxtr.030 ForeignExchangeTradeConfirmation.", "fxtr.030", ["SettlementDate: T+2", "Status: CONF"]),
        ("GlobalCorp Treasury", "CitiFX", "Book NDF trade", "Book non-deliverable forward for BRL hedge.", "trea.001 CreateNonDeliverableForwardOpeningNotification.", "trea.001", ["CurrencyPair: USD/BRL", "NotionalAmount: 10,000,000 USD"]),
        ("CitiFX", "GlobalCorp Treasury", "Confirm NDF booking", "Confirm NDF trade details.", "trea.007 NonDeliverableForwardNotificationStatus.", "trea.007", ["Status: CONF", "FixingSource: PTAX"]),
        ("GlobalCorp Treasury", "Goldman Sachs", "Instruct equity purchase", "Instruct purchase of 100,000 shares.", "sese.023 SecuritiesSettlementTransactionInstruction.", "sese.023", ["CUSIP: 037833100", "Quantity: 100,000"]),
        ("State Street", "DTCC", "Submit to DTC", "Custodian submits to DTCC.", "sese.023 forwarded to DTC.", "sese.023", ["ParticipantId: State Street", "SettlementType: DVP"]),
        ("DTCC", "State Street", "Confirm settlement", "DTCC confirms settlement.", "sese.025 SecuritiesSettlementTransactionConfirmation.", "sese.025", ["Status: SETT", "Reference: DTC ref"]),
        ("State Street", "GlobalCorp Treasury", "Report settlement", "Custodian reports completed settlement.", "semt.017 SecuritiesTransactionPostingReport.", "semt.017", ["Status: Settled", "NewPosition: 100,000 shares"]),
        ("Goldman Sachs", "GlobalCorp Treasury", "Margin call request", "Broker issues margin call.", "colr.003 MarginCallRequest.", "colr.003", ["CallAmount: 5,000,000 USD", "DueDate: Today"]),
        ("GlobalCorp Treasury", "Goldman Sachs", "Acknowledge margin call", "Acknowledge and confirm collateral posting.", "colr.004 MarginCallResponse.", "colr.004", ["AgreedAmount: 5,000,000 USD", "CollateralType: CASH"]),
        ("GlobalCorp Treasury", "State Street", "Instruct collateral transfer", "Instruct custodian to transfer collateral.", "colr.007 CollateralProposal.", "colr.007", ["CollateralType: CASH", "Amount: 5,000,000 USD"]),
        ("State Street", "Goldman Sachs", "Transfer collateral", "Execute collateral transfer.", "pacs.009 for collateral movement.", "pacs.009", ["Amount: 5,000,000 USD", "Purpose: COLL"]),
        ("Goldman Sachs", "GlobalCorp Treasury", "Confirm collateral receipt", "Broker confirms collateral received.", "colr.016 CollateralAndExposureReport.", "colr.016", ["CollateralReceived: 5,000,000 USD", "Status: FULLY_COVERED"]),
        ("GlobalCorp Treasury", "JP Morgan", "Request payment cancellation", "Request cancellation of erroneous payment.", "camt.055 CustomerPaymentCancellationRequest.", "camt.055", ["CancellationReason: DUPL", "Amount: 125,000 USD"]),
        ("JP Morgan", "Deutsche Bank", "Forward cancellation", "Forward cancellation to beneficiary bank.", "camt.056 FIToFIPaymentCancellationRequest.", "camt.056", ["Reason: Duplicate", "UrgencyLevel: HIGH"]),
        ("Deutsche Bank", "JP Morgan", "Confirm cancellation", "Beneficiary bank confirms cancellation.", "camt.029 ResolutionOfInvestigation.", "camt.029", ["Resolution: CNCL", "ReturnedAmount: 125,000 USD"]),
        ("JP Morgan", "GlobalCorp Treasury", "Notify cancellation complete", "Confirm cancellation and refund.", "camt.054 credit notification.", "camt.054", ["CreditAmount: 125,000 USD", "Reference: Return"]),
        ("GlobalCorp Treasury", "JP Morgan", "Query payment status", "Query status of pending payments.", "pacs.028 FIToFIPaymentStatusRequest.", "pacs.028", ["StatusType: PENDING", "Direction: OUTGOING"]),
        ("JP Morgan", "GlobalCorp Treasury", "Provide status report", "Bank provides pending payment status.", "pacs.002 batch with statuses.", "pacs.002", ["PendingCount: 8", "TotalAmount: 3,500,000 USD"]),

        # PHASE 4: CARD & ATM PROCESSING (Steps 91-120)
        ("Visa", "GlobalCorp Treasury", "Process card batch", "Visa sends batch of corporate card transactions.", "caaa.011 AcceptorBatchTransfer.", "caaa.011", ["TransactionCount: 1,247", "TotalAmount: 892,000 USD"]),
        ("GlobalCorp Treasury", "Visa", "Acknowledge batch", "Treasury acknowledges card batch receipt.", "caaa.012 AcceptorBatchTransferResponse.", "caaa.012", ["Status: RCVD", "AcceptedCount: 1,247"]),
        ("JP Morgan", "GlobalCorp Treasury", "Card settlement notification", "Bank notifies of card settlement debit.", "camt.054 for card settlement.", "camt.054", ["DebitAmount: 892,000 USD", "Reference: Visa"]),
        ("ATM Network", "GlobalCorp Treasury", "ATM withdrawal request", "Employee ATM withdrawal request.", "catp.001 ATMWithdrawalRequest.", "catp.001", ["Amount: 500 USD", "ATMId: ATM-NYC-0892"]),
        ("GlobalCorp Treasury", "ATM Network", "Authorize withdrawal", "Treasury authorizes withdrawal.", "catp.002 ATMWithdrawalResponse.", "catp.002", ["Status: APPR", "AuthCode: 123456"]),
        ("ATM Network", "GlobalCorp Treasury", "Confirm withdrawal", "ATM confirms cash dispensed.", "catp.003 ATMWithdrawalCompletionAdvice.", "catp.003", ["Status: COMP", "DispensedAmount: 500 USD"]),
        ("GlobalCorp Treasury", "ATM Network", "Acknowledge completion", "Acknowledge withdrawal completion.", "catp.004 ATMWithdrawalCompletionAcknowledgement.", "catp.004", ["Status: ACCP"]),
        ("Visa", "GlobalCorp Treasury", "Card authorization request", "Real-time card auth for large purchase.", "caaa.001 AcceptorAuthorisationRequest.", "caaa.001", ["Amount: 15,000 USD", "MerchantId: ACME-Corp"]),
        ("GlobalCorp Treasury", "Visa", "Approve authorization", "Treasury approves authorization.", "caaa.002 AcceptorAuthorisationResponse.", "caaa.002", ["Status: APPR", "AuthCode: 789012"]),
        ("Visa", "GlobalCorp Treasury", "Completion advice", "Transaction completion after purchase.", "caaa.003 AcceptorCompletionAdvice.", "caaa.003", ["FinalAmount: 15,000 USD"]),
        ("GlobalCorp Treasury", "Visa", "Acknowledge completion", "Acknowledge completion for settlement.", "caaa.004 AcceptorCompletionAdviceResponse.", "caaa.004", ["Status: ACCP"]),
        ("GlobalCorp US", "JP Morgan", "Submit merchant batch", "US subsidiary submits POS transactions.", "caaa.011 AcceptorBatchTransfer.", "caaa.011", ["TransactionCount: 3,456", "TotalAmount: 1,250,000 USD"]),
        ("JP Morgan", "GlobalCorp US", "Confirm batch processing", "Bank confirms batch accepted.", "caaa.012 AcceptorBatchTransferResponse.", "caaa.012", ["AcceptedCount: 3,452", "RejectedCount: 4"]),
        ("JP Morgan", "Visa", "Submit to card network", "Bank submits to card network.", "cain.003 AcquirerCompletionAdvice.", "cain.003", ["NetworkTransactions: 3,452"]),
        ("Visa", "JP Morgan", "Confirm network acceptance", "Card network confirms acceptance.", "cain.004 AcquirerCompletionAdviceResponse.", "cain.004", ["Status: ACCP", "SettlementDate: T+1"]),
        ("JP Morgan", "GlobalCorp US", "Credit merchant settlement", "Bank credits merchant funds.", "camt.054 credit notification.", "camt.054", ["CreditAmount: 1,218,325 USD", "Fees: 30,175 USD"]),
        ("GlobalCorp Treasury", "Visa", "Request reconciliation", "Request daily card reconciliation.", "caaa.009 AcceptorReconciliationRequest.", "caaa.009", ["ReconciliationDate: Yesterday"]),
        ("Visa", "GlobalCorp Treasury", "Provide reconciliation", "Card network provides totals.", "caaa.010 AcceptorReconciliationResponse.", "caaa.010", ["AuthorizedTotal: 2,500,000 USD", "SettledTotal: 2,450,000 USD"]),
        ("ATM Provider", "GlobalCorp Treasury", "ATM status report", "Daily ATM fleet status.", "catm.001 StatusReport.", "catm.001", ["ATMCount: 15", "OnlineCount: 14"]),
        ("GlobalCorp Treasury", "ATM Provider", "Update ATM config", "Push updated withdrawal limits.", "catm.003 AcceptorConfigurationUpdate.", "catm.003", ["MaxWithdrawal: 1,000 USD"]),
        ("ATM Provider", "GlobalCorp Treasury", "Confirm config update", "ATM provider confirms update.", "catm.002 ManagementPlanReplacement.", "catm.002", ["Status: UPDT", "ATMsUpdated: 15"]),
        ("GlobalCorp Treasury", "Visa", "Cancel authorization", "Cancel pending authorization.", "caaa.005 AcceptorCancellationRequest.", "caaa.005", ["OriginalAuthCode: 789012"]),
        ("Visa", "GlobalCorp Treasury", "Confirm cancellation", "Card network confirms cancelled.", "caaa.006 AcceptorCancellationResponse.", "caaa.006", ["Status: CNCL", "ReleasedAmount: 15,000 USD"]),
        ("GlobalCorp UK", "Visa", "DCC request", "Dynamic currency conversion request.", "caaa.016 AcceptorCurrencyConversionRequest.", "caaa.016", ["OriginalCurrency: GBP", "Amount: 1,000"]),
        ("Visa", "GlobalCorp UK", "DCC response", "Provide conversion options.", "caaa.017 AcceptorCurrencyConversionResponse.", "caaa.017", ["ConvertedAmount: 1,275 USD", "Rate: 1.275"]),
        ("GlobalCorp Treasury", "ATM Network", "ATM balance inquiry", "Check ATM cash levels.", "catp.006 ATMInquiryRequest.", "catp.006", ["InquiryType: Balance"]),
        ("ATM Network", "GlobalCorp Treasury", "ATM balance response", "ATM responds with balance.", "catp.007 ATMInquiryResponse.", "catp.007", ["AvailableCash: 50,000 USD"]),
        ("Visa", "GlobalCorp Treasury", "Auth request - declined", "Auth request for over-limit.", "caaa.001 AcceptorAuthorisationRequest.", "caaa.001", ["Amount: 150,000 USD"]),
        ("GlobalCorp Treasury", "Visa", "Decline authorization", "Decline over-limit request.", "caaa.002 AcceptorAuthorisationResponse.", "caaa.002", ["Status: DECL", "Reason: Limit exceeded"]),
        ("JP Morgan", "Visa", "Submit acquirer auth", "Acquirer authorization request.", "cain.001 AcquirerAuthorisationRequest.", "cain.001", ["Amount: 25,000 USD"]),
        ("Visa", "JP Morgan", "Acquirer auth response", "Acquirer authorization approved.", "cain.002 AcquirerAuthorisationResponse.", "cain.002", ["Status: APPR", "AuthCode: 456789"]),

        # PHASE 5: TRADE FINANCE & REGULATORY (Steps 121-150)
        ("GlobalCorp Treasury", "JP Morgan", "Submit LC application", "Apply for documentary letter of credit.", "tsmt.018 InitialBaselineSubmission.", "tsmt.018", ["Amount: 500,000 USD", "ExpiryDate: 60 days"]),
        ("JP Morgan", "GlobalCorp Treasury", "Acknowledge LC", "Bank acknowledges LC application.", "tsmt.001 Acknowledgement.", "tsmt.001", ["Status: RCVD", "ApplicationId: LC-2026-0145"]),
        ("JP Morgan", "Bank of China", "Issue LC advice", "Advising bank receives LC.", "tsmt.017 FullPushThroughReport.", "tsmt.017", ["LCNumber: LC-2026-0145", "Terms: CIF Shanghai"]),
        ("Bank of China", "China Manufacturing Ltd", "Notify LC availability", "Notify beneficiary of LC.", "tsmt.049 SpecialNotification.", "tsmt.049", ["AvailableAmount: 500,000 USD"]),
        ("China Manufacturing Ltd", "Bank of China", "Submit documents", "Beneficiary presents documents.", "tsmt.014 DataSetSubmission.", "tsmt.014", ["DocumentSet: BL, Invoice, Packing List"]),
        ("Bank of China", "JP Morgan", "Forward documents", "Forward documents to issuing bank.", "tsmt.014 forwarded.", "tsmt.014", ["Status: CMPL", "DiscrepancyCount: 0"]),
        ("JP Morgan", "Bank of China", "Document acceptance", "Issuing bank accepts documents.", "tsmt.013 DataSetMatchReport.", "tsmt.013", ["Status: MATD", "PaymentDate: T+5"]),
        ("JP Morgan", "GlobalCorp Treasury", "LC payment notification", "Notify applicant of payment.", "tsmt.044 IntentToPayNotification.", "tsmt.044", ["Amount: 500,000 USD", "PaymentDate: T+5"]),
        ("GlobalCorp Treasury", "SEC/FCA", "Submit regulatory report", "Submit required position report.", "auth.024 PaymentRegulatoryInformationNotification.", "auth.024", ["ReportType: Position", "Jurisdiction: USA"]),
        ("SEC/FCA", "GlobalCorp Treasury", "Acknowledge report", "Regulator acknowledges receipt.", "auth.027 CurrencyControlStatusAdvice.", "auth.027", ["Status: RCVD", "NextReportDue: 30 days"]),
        ("GlobalCorp Treasury", "SEC/FCA", "Register FX contract", "Register large FX contract.", "auth.018 ContractRegistrationRequest.", "auth.018", ["ContractType: FX_FORWARD", "NotionalAmount: 50,000,000 USD"]),
        ("SEC/FCA", "GlobalCorp Treasury", "Confirm registration", "Regulator confirms registration.", "auth.019 ContractRegistrationConfirmation.", "auth.019", ["RegistrationId: CTR-2026-4567", "Status: REGD"]),
        ("GlobalCorp Treasury", "JP Morgan", "Update party info", "Update beneficiary details.", "reda.017 PartyModificationRequest.", "reda.017", ["PartyId: BENEFICIARY-001", "UpdateField: Address"]),
        ("JP Morgan", "GlobalCorp Treasury", "Confirm party update", "Bank confirms update.", "reda.016 PartyStatusAdvice.", "reda.016", ["Status: MODF", "EffectiveDate: Immediate"]),
        ("GlobalCorp Treasury", "State Street", "Create new SSI", "Create standing settlement instruction.", "reda.041 StandingSettlementInstructionCreationRequest.", "reda.041", ["SSIType: Securities", "EffectiveDate: T+1"]),
        ("State Street", "GlobalCorp Treasury", "Confirm SSI creation", "Custodian confirms SSI.", "reda.057 StandingSettlementInstructionReport.", "reda.057", ["Status: ACTV", "SSIId: SSI-2026-0345"]),
        ("JP Morgan", "GlobalCorp Treasury", "System event notification", "Bank notifies of maintenance.", "admi.004 SystemEventNotification.", "admi.004", ["EventType: Maintenance", "StartTime: Sunday 2AM"]),
        ("GlobalCorp Treasury", "JP Morgan", "Acknowledge notification", "Acknowledge system notification.", "admi.011 SystemEventAcknowledgement.", "admi.011", ["Status: RCVD"]),
        ("GlobalCorp Treasury", "JP Morgan", "Request historical report", "Request transaction history.", "admi.005 ReportQueryRequest.", "admi.005", ["ReportType: TransactionHistory", "DateRange: 30 days"]),
        ("JP Morgan", "GlobalCorp Treasury", "Deliver report", "Bank delivers report.", "admi.006 ReportQueryResponse.", "admi.006", ["TransactionCount: 4,567", "Format: XML"]),
        ("GlobalCorp Treasury", "State Street", "Request audit trail", "Request securities audit trail.", "semt.022 SecuritiesSettlementTransactionAuditTrailReport.", "semt.022", ["DateRange: 7 days"]),
        ("State Street", "GlobalCorp Treasury", "Deliver audit trail", "Custodian delivers audit.", "semt.022 with audit history.", "semt.022", ["TransactionCount: 145", "SettledCount: 140"]),
        ("GlobalCorp Treasury", "State Street", "Request transfer out", "Instruct transfer to external custodian.", "sese.001 TransferOutInstruction.", "sese.001", ["PortfolioValue: 25,000,000 USD"]),
        ("State Street", "GlobalCorp Treasury", "Confirm transfer instruction", "Custodian confirms instruction.", "sese.011 TransferInstructionStatusReport.", "sese.011", ["Status: RCVD", "ExpectedSettlement: T+3"]),
        ("State Street", "DTCC", "Initiate DTC transfer", "Submit transfer to DTC.", "sese.001 forwarded to DTC.", "sese.001", ["TransferType: ACATS", "Positions: 15"]),
        ("DTCC", "State Street", "Confirm transfer progress", "DTC confirms in progress.", "sese.011 status update.", "sese.011", ["Status: PACK", "PositionsAccepted: 15"]),
        ("GlobalCorp Treasury", "State Street", "Instruct intra-position move", "Move securities between accounts.", "semt.013 IntraPositionMovementInstruction.", "semt.013", ["ISIN: US0378331005", "FromAccount: Main"]),
        ("State Street", "GlobalCorp Treasury", "Confirm intra-position move", "Custodian confirms movement.", "semt.015 IntraPositionMovementConfirmation.", "semt.015", ["Status: COMP", "MovedQuantity: 10,000"]),
        ("State Street", "GlobalCorp Treasury", "Pending report", "Report pending transactions.", "semt.018 SecuritiesTransactionPendingReport.", "semt.018", ["PendingCount: 5", "TotalValue: 2,500,000 USD"]),
        ("GlobalCorp Treasury", "Goldman Sachs", "Securities financing instruction", "Initiate repo transaction.", "sese.033 SecuritiesFinancingInstruction.", "sese.033", ["RepoType: Classic", "CollateralValue: 10,000,000 USD"]),

        # PHASE 6: END OF DAY (Steps 151-200)
        ("GlobalCorp Treasury", "JP Morgan", "Request EOD statement", "Request end-of-day balance.", "camt.060 requesting EOD statement.", "camt.060", ["ReportType: EOD", "Account: All USD"]),
        ("JP Morgan", "GlobalCorp Treasury", "Deliver EOD statement", "Bank delivers EOD statement.", "camt.053 with closing balance.", "camt.053", ["ClosingBalance: 42,500,000 USD", "TransactionCount: 156"]),
        ("GlobalCorp EU", "Deutsche Bank", "Request EUR EOD", "Request EUR end-of-day.", "camt.060 for EUR accounts.", "camt.060", ["Currency: EUR", "ReportType: EOD"]),
        ("Deutsche Bank", "GlobalCorp EU", "Deliver EUR statement", "Deutsche Bank delivers EUR EOD.", "camt.053 with EUR closing.", "camt.053", ["ClosingBalance: 8,450,000 EUR", "TransactionCount: 45"]),
        ("GlobalCorp Asia", "DBS Bank", "Request SGD EOD", "Request SGD end-of-day.", "camt.060 for SGD accounts.", "camt.060", ["Currency: SGD", "ReportType: EOD"]),
        ("DBS Bank", "GlobalCorp Asia", "Deliver SGD statement", "DBS delivers SGD EOD.", "camt.053 with SGD closing.", "camt.053", ["ClosingBalance: 15,800,000 SGD", "TransactionCount: 23"]),
        ("GlobalCorp Treasury", "State Street", "Request EOD holdings", "Request end-of-day securities.", "semt.021 SecuritiesStatementQuery.", "semt.021", ["StatementType: Holdings", "AsOfDate: EOD"]),
        ("State Street", "GlobalCorp Treasury", "Deliver holdings report", "Custodian delivers EOD holdings.", "semt.002 CustodyStatementOfHoldings.", "semt.002", ["TotalValue: 850,000,000 USD", "PositionCount: 247"]),
        ("State Street", "GlobalCorp Treasury", "Deliver transaction report", "Custodian delivers EOD transactions.", "semt.017 SecuritiesTransactionPostingReport.", "semt.017", ["SettledTrades: 28", "PendingTrades: 5"]),
        ("CitiFX", "GlobalCorp Treasury", "FX position report", "Dealer sends EOD FX summary.", "trea.009 StatusNotification.", "trea.009", ["OpenPositions: 12", "TotalNotional: 125,000,000 USD"]),
        ("GlobalCorp Treasury", "CitiFX", "Acknowledge FX report", "Treasury acknowledges FX report.", "trea.009 acknowledgement.", "trea.009", ["Status: RCVD"]),
        ("Goldman Sachs", "GlobalCorp Treasury", "Collateral EOD report", "Prime broker sends collateral summary.", "colr.016 CollateralAndExposureReport.", "colr.016", ["CollateralPosted: 25,000,000 USD", "Exposure: 23,500,000 USD"]),
        ("GlobalCorp Treasury", "Goldman Sachs", "Verify collateral", "Treasury verifies collateral.", "colr.012 CollateralValueReport.", "colr.012", ["AsOfDate: EOD"]),
        ("State Street", "GlobalCorp Treasury", "CA pending report", "Custodian reports pending CAs.", "seev.042 CorporateActionInstructionStatementReport.", "seev.042", ["PendingActions: 3", "RequiringInstruction: 1"]),
        ("GlobalCorp Treasury", "State Street", "Acknowledge CA report", "Treasury acknowledges CA summary.", "seev.034 acknowledgement.", "seev.034", ["Status: RCVD"]),
        ("GlobalCorp Treasury", "JP Morgan", "Request reconciliation", "Request daily recon summary.", "admi.005 ReportQueryRequest.", "admi.005", ["ReportType: Reconciliation"]),
        ("JP Morgan", "GlobalCorp Treasury", "Deliver reconciliation", "Bank delivers recon report.", "admi.006 with reconciliation.", "admi.006", ["MatchedItems: 152", "UnmatchedItems: 4"]),
        ("GlobalCorp Treasury", "State Street", "Request account recon", "Request custody account recon.", "semt.021 for reconciliation.", "semt.021", ["ReconciliationType: Cash"]),
        ("State Street", "GlobalCorp Treasury", "Deliver account recon", "Custodian delivers recon.", "semt.003 AccountingStatementOfHoldings.", "semt.003", ["CashBalance: 15,000,000 USD"]),
        ("Goldman Sachs", "GlobalCorp Treasury", "Financing confirmation", "Confirm repo transaction.", "sese.034 SecuritiesFinancingConfirmation.", "sese.034", ["Status: CONF", "InterestRate: 4.25%"]),
        ("State Street", "Euroclear", "Settle bonds", "Settle T+2 bond purchase.", "sese.025 SecuritiesSettlementTransactionConfirmation.", "sese.025", ["ISIN: DE0001102481", "Status: SETT"]),
        ("Euroclear", "State Street", "Confirm bond settlement", "CSD confirms settlement.", "sese.024 SecuritiesSettlementTransactionStatusAdvice.", "sese.024", ["Status: SETT", "SettlementDate: Today"]),
        ("GlobalCorp EU", "State Street", "Report bond position", "Report updated bond position.", "semt.017 SecuritiesTransactionPostingReport.", "semt.017", ["NewPosition: 5,000,000 EUR", "ISIN: DE0001102481"]),
        ("State Street", "GlobalCorp Treasury", "Corporate action confirmation", "Confirm dividend election processed.", "seev.036 CorporateActionMovementConfirmation.", "seev.036", ["EventType: DVCA", "CashAmount: 25,000 EUR"]),
        ("Deutsche Bank", "GlobalCorp EU", "Credit dividend", "Credit dividend to account.", "camt.054 BankToCustomerDebitCreditNotification.", "camt.054", ["CreditAmount: 25,000 EUR", "Reference: Dividend"]),
        ("HSBC", "Deutsche Bank", "DD settlement", "Direct debit settled.", "pacs.002 FIToFIPaymentStatusReport.", "pacs.002", ["Status: ACSC", "Amount: 50,000 EUR"]),
        ("Deutsche Bank", "GlobalCorp EU", "Credit DD collection", "Credit collected DD funds.", "camt.054 BankToCustomerDebitCreditNotification.", "camt.054", ["CreditAmount: 50,000 EUR", "Reference: DD collection"]),
        ("GlobalCorp Treasury", "GlobalCorp EU", "Intercompany netting", "Propose intercompany netting.", "Internal netting calculation.", "pacs.008", ["NetPayable: 2,500,000 USD"]),
        ("GlobalCorp EU", "GlobalCorp Treasury", "Accept netting", "Accept netting proposal.", "Internal confirmation.", "pacs.002", ["Status: ACCP", "NetAmount: 2,500,000 USD"]),
        ("GlobalCorp Treasury", "JP Morgan", "Execute netting payment", "Execute net payment.", "pain.001 for netting settlement.", "pain.001", ["Amount: 2,500,000 USD", "Purpose: Intercompany"]),
        ("JP Morgan", "Deutsche Bank", "Route netting payment", "Route intercompany payment.", "pacs.008 FIToFICustomerCreditTransfer.", "pacs.008", ["Reference: IC-NETTING"]),
        ("Deutsche Bank", "GlobalCorp EU", "Credit netting receipt", "Credit netting funds.", "camt.054 BankToCustomerDebitCreditNotification.", "camt.054", ["CreditAmount: 2,500,000 USD"]),
        ("GlobalCorp Treasury", "GlobalCorp Treasury", "Consolidate global cash", "Final global cash consolidation.", "Internal treasury report.", "camt.053", ["TotalCash: 185,000,000 USD", "Currencies: 12"]),
        ("GlobalCorp Treasury", "GlobalCorp Treasury", "Calculate daily PnL", "Calculate treasury daily P&L.", "Internal PnL calculation.", "camt.053", ["FXGains: +125,000 USD", "InterestIncome: +45,000 USD"]),
        ("GlobalCorp Treasury", "GlobalCorp Treasury", "Generate management report", "Generate EOD management summary.", "Internal management reporting.", "admi.006", ["LiquidityPosition: Strong"]),
        ("JP Morgan", "GlobalCorp Treasury", "EOD processing complete", "Bank notifies EOD complete.", "admi.004 SystemEventNotification.", "admi.004", ["EventType: EOD_COMPLETE"]),
        ("Deutsche Bank", "GlobalCorp EU", "TARGET2 cutoff notice", "Bank notifies cutoff.", "admi.004 SystemEventNotification.", "admi.004", ["EventType: CUTOFF", "System: TARGET2"]),
        ("State Street", "GlobalCorp Treasury", "Custody EOD complete", "Custodian confirms EOD.", "admi.004 SystemEventNotification.", "admi.004", ["EventType: EOD_COMPLETE"]),
        ("GlobalCorp Treasury", "All Banks", "Acknowledge EOD", "Acknowledge all EOD notifications.", "admi.007 ReceiptAcknowledgement.", "admi.007", ["AcknowledgedCount: 5"]),
        ("CHIPS", "JP Morgan", "CHIPS net settlement", "CHIPS final net settlement.", "pacs.009 net settlement.", "pacs.009", ["NetAmount: Calculated"]),
        ("JP Morgan", "GlobalCorp Treasury", "CHIPS settlement notice", "Notify CHIPS settlement.", "camt.054 BankToCustomerDebitCreditNotification.", "camt.054", ["Reference: CHIPS settlement"]),
        ("GlobalCorp UK", "Barclays", "Request GBP EOD", "Request GBP end-of-day.", "camt.060 for GBP accounts.", "camt.060", ["Currency: GBP", "ReportType: EOD"]),
        ("Barclays", "GlobalCorp UK", "Deliver GBP statement", "Barclays delivers GBP EOD.", "camt.053 with GBP closing.", "camt.053", ["ClosingBalance: 3,200,000 GBP"]),
        ("GlobalCorp Treasury", "GlobalCorp Treasury", "Day close verification", "Final verification.", "Internal audit verification.", "admi.006", ["PaymentsProcessed: 156", "DayStatus: CLEAN"]),
        ("State Street", "GlobalCorp Treasury", "Final holdings snapshot", "Final holdings snapshot.", "semt.002 final EOD holdings.", "semt.002", ["TotalValue: 850,500,000 USD"]),
        ("GlobalCorp Treasury", "SEC/FCA", "EOD position report", "Submit EOD position to regulator.", "auth.024 PaymentRegulatoryInformationNotification.", "auth.024", ["ReportType: EOD_POSITION"]),
        ("SEC/FCA", "GlobalCorp Treasury", "Acknowledge EOD report", "Regulator acknowledges.", "auth.027 CurrencyControlStatusAdvice.", "auth.027", ["Status: RCVD"]),
        ("GlobalCorp Treasury", "GlobalCorp Treasury", "Archive daily records", "Archive all daily records.", "Internal archival.", "admi.006", ["RecordsArchived: 4,567"]),
        ("GlobalCorp Treasury", "GlobalCorp Treasury", "Prepare next day forecast", "Prepare tomorrow's forecast.", "Internal treasury planning.", "camt.052", ["ForecastDate: Tomorrow"])
    ]

    # Generate steps from templates
    for i, (actor, target, action, description, technical, msg_type, key_fields) in enumerate(step_templates, 1):
        steps.append({
            "step": i,
            "actor": actor,
            "target": target,
            "action": action,
            "description": description,
            "technical": technical,
            "message_type": msg_type,
            "key_fields": key_fields
        })

    # Get unique message types
    unique_messages = sorted(set(step["message_type"] for step in steps))

    # Build the example
    example = {
        "id": "global_treasury_full_day",
        "title": "Global Corporate Treasury Operations - Full Day Lifecycle",
        "difficulty": "advanced",
        "category": "treasury",
        "characters": {
            "treasury": {"name": "GlobalCorp Treasury", "role": "Corporate Treasury", "country": "USA", "bank": "JP Morgan"},
            "us_sub": {"name": "GlobalCorp US", "role": "US Operations", "country": "USA", "bank": "Wells Fargo"},
            "eu_sub": {"name": "GlobalCorp EU", "role": "European Operations", "country": "Germany", "bank": "Deutsche Bank"},
            "asia_sub": {"name": "GlobalCorp Asia", "role": "Asian Operations", "country": "Singapore", "bank": "DBS Bank"},
            "uk_sub": {"name": "GlobalCorp UK", "role": "UK Operations", "country": "UK", "bank": "Barclays"},
            "custodian": {"name": "State Street", "role": "Global Custodian", "country": "USA", "bank": "State Street"},
            "csd_eu": {"name": "Euroclear", "role": "EU Central Securities Depository", "country": "Belgium", "bank": "Euroclear"},
            "clearing_us": {"name": "Federal Reserve", "role": "US Clearing System", "country": "USA", "bank": "Fed"},
            "clearing_eu": {"name": "TARGET2", "role": "EU Clearing System", "country": "EU", "bank": "ECB"},
            "fx_dealer": {"name": "CitiFX", "role": "FX Dealer", "country": "UK", "bank": "Citibank"},
            "broker": {"name": "Goldman Sachs", "role": "Prime Broker", "country": "USA", "bank": "Goldman Sachs"},
            "card_network": {"name": "Visa", "role": "Card Network", "country": "USA", "bank": "Visa"},
            "atm": {"name": "ATM Network", "role": "ATM Service", "country": "USA", "bank": "ATM Provider"}
        },
        "scenario": "A comprehensive full-day simulation of GlobalCorp's treasury operations across multiple time zones. Starting with Asia-Pacific morning liquidity management, through European midday trading, to US afternoon settlements. Covers payment initiation, FX trading, securities settlement, card processing, corporate actions, collateral management, and regulatory reporting. Demonstrates how ISO 20022 messages orchestrate complex multi-entity financial operations.",
        "steps": steps,
        "possible_errors": [
            {"error_code": "AC01", "scenario": "IBAN incorrect in supplier payment", "result": "Payment returned to GlobalCorp", "message_type": "pacs.004"},
            {"error_code": "AC04", "scenario": "Account closed at beneficiary bank", "result": "Payment returned, need new details", "message_type": "pacs.004"},
            {"error_code": "AM04", "scenario": "Insufficient funds for wire payment", "result": "Payment rejected at initiation", "message_type": "pain.002"},
            {"error_code": "AM05", "scenario": "Duplicate payment detected", "result": "Second payment rejected", "message_type": "pain.002"},
            {"error_code": "BE04", "scenario": "Beneficiary address missing", "result": "Payment returned for correction", "message_type": "pacs.004"},
            {"error_code": "FF01", "scenario": "Invalid file format in batch", "result": "Entire batch rejected", "message_type": "pain.002"},
            {"error_code": "MD01", "scenario": "No mandate for direct debit", "result": "Collection returned unpaid", "message_type": "pacs.004"},
            {"error_code": "RC01", "scenario": "Invalid BIC in payment", "result": "Payment cannot be routed", "message_type": "pacs.002"},
            {"error_code": "RR04", "scenario": "Regulatory reason - sanctions", "result": "Payment blocked for review", "message_type": "pacs.002"},
            {"error_code": "AG01", "scenario": "Transaction forbidden", "result": "Payment rejected by compliance", "message_type": "pacs.002"},
            {"error_code": "DUPL", "scenario": "Duplicate instruction detected", "result": "Second instruction rejected", "message_type": "pacs.002"},
            {"error_code": "TECH", "scenario": "Technical problem at clearing", "result": "Retry required", "message_type": "admi.002"}
        ],
        "related_messages": unique_messages,
        "related_terms": [
            "UETR", "IBAN", "BIC", "SWIFT", "TARGET2", "CHIPS", "Fedwire", "ACH",
            "DVP", "RTGS", "CSD", "Custodian", "Clearing", "Settlement",
            "Nostro", "Correspondent_bank", "Direct_debit", "Mandate", "SEPA",
            "Corporate_action", "Dividend", "Collateral", "Margin",
            "FX_spot", "NDF", "Letter_of_credit", "Trade_finance"
        ],
        "key_takeaways": [
            "Global treasury operations span multiple time zones requiring 24-hour coverage",
            "ISO 20022 provides a unified messaging standard across all financial domains",
            "Real-time gross settlement (RTGS) enables same-day high-value payments",
            "Direct debit mandates require careful management and customer consent",
            "Securities settlement follows T+1 or T+2 cycles requiring advance planning",
            "FX trades require T+2 settlement with proper SSI management",
            "Collateral management is critical for managing counterparty risk",
            "Card processing involves multiple message types for authorization and settlement",
            "Regulatory reporting is mandatory and increasingly automated",
            "End-of-day reconciliation ensures all positions are accurate",
            "Payment investigations use standardized case management messages"
        ]
    }

    return example

def main():
    file_path = '/Users/oneworkspace/vscode/tools/mx-error-guide/frontend/public/data/real_world_examples.json'

    try:
        with open(file_path, 'r') as f:
            data = json.load(f)

        new_example = generate_comprehensive_example()

        # Check if example already exists
        existing_ids = [ex['id'] for ex in data['examples']]
        if new_example['id'] in existing_ids:
            print(f"Example '{new_example['id']}' already exists. Updating it.")
            for i, ex in enumerate(data['examples']):
                if ex['id'] == new_example['id']:
                    data['examples'][i] = new_example
                    break
        else:
            data['examples'].append(new_example)
            data['metadata']['example_count'] = len(data['examples'])

        data['metadata']['last_updated'] = datetime.now().strftime("%Y-%m-%d")

        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"Successfully added example with {len(new_example['steps'])} steps.")
        print(f"Unique message types: {len(new_example['related_messages'])}")
        print(f"Message types: {', '.join(new_example['related_messages'][:15])}...")
        print(f"Total examples now: {data['metadata']['example_count']}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
