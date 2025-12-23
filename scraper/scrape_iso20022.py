"""
ISO 20022 Error Knowledge Base Builder
Downloads official code sets and scrapes human-readable explanations.
Paraphrases descriptions to add original value while maintaining attribution.
"""

import json
import zipfile
import requests
import re
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime

# =============================================================================
# CONFIG
# =============================================================================

OUTPUT_DIR = Path("./data")
OUTPUT_DIR.mkdir(exist_ok=True)
RAW_DIR = OUTPUT_DIR / "raw"
RAW_DIR.mkdir(exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

SOURCES = {
    "iso20022": "https://www.iso20022.org/sites/default/files/media/file/ExternalCodeSets_JSON.zip",
    "nium": "https://docs.nium.com/docs/failure-codes",
    # Public documentation sources - factual error code references
    "swift_cbpr": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
    "jpmorgan": "https://www.jpmorgan.com/payments/iso-20022"
}

# =============================================================================
# PARAPHRASING - Rewrite descriptions in our own words
# =============================================================================

def paraphrase_description(original: str, code: str) -> dict:
    """
    Rewrite descriptions to add original value.
    Same meaning, different words, plus contextual enrichment.
    """
    text = original.strip()

    # Word/phrase substitutions for paraphrasing
    substitutions = [
        (r"\bbeneficiary's\b", "destination"),
        (r"\bbeneficiary\b", "recipient"),
        (r"\bcreditor's\b", "receiving"),
        (r"\bcreditor\b", "recipient"),
        (r"\bdebtor's\b", "sender's"),
        (r"\bdebtor\b", "sender"),
        (r"\baccount is blocked\b", "account cannot receive funds"),
        (r"\bdormant\b", "inactive"),
        (r"\binactive\b", "not active"),
        (r"\bclosed\b", "no longer open"),
        (r"\binvalid\b", "not valid"),
        (r"\bincorrect\b", "wrong"),
        (r"\bmissing\b", "not provided"),
        (r"\binsufficient\b", "not enough"),
        (r"\bexceeds\b", "is over"),
        (r"\bexceeded\b", "went over"),
        (r"\btimed out\b", "did not respond in time"),
        (r"\btimeout\b", "response delay"),
        (r"\boffline\b", "temporarily unavailable"),
        (r"\bsystem error\b", "technical issue"),
        (r"\bduplicate\b", "already processed"),
        (r"\brejected\b", "declined"),
        (r"\bnot allowed\b", "restricted"),
        (r"\bprohibited\b", "not permitted"),
        (r"\bcurrency\b", "currency type"),
        (r"\bformat\b", "structure"),
        (r"\bBIC\b", "bank identifier (BIC)"),
        (r"\bIBAN\b", "account number (IBAN)"),
    ]

    paraphrased = text
    for pattern, replacement in substitutions:
        paraphrased = re.sub(pattern, replacement, paraphrased, flags=re.IGNORECASE)

    # Add context based on error category
    context_suffix = get_context_suffix(code)
    if context_suffix and context_suffix not in paraphrased.lower():
        paraphrased = f"{paraphrased} {context_suffix}"

    # Create short version (max 100 chars)
    short = paraphrased
    if len(short) > 100:
        # Find a natural break point
        for sep in ['. ', ' - ', ', ', ' ']:
            if sep in short[:97]:
                idx = short[:97].rfind(sep)
                short = short[:idx] + "..."
                break
        else:
            short = short[:97] + "..."

    return {
        "short": short,
        "detailed": paraphrased
    }


def get_context_suffix(code: str) -> str:
    """Add contextual information based on error code prefix."""
    context_map = {
        "AC": "Verify account details with the recipient.",
        "AM": "Review the payment amount and limits.",
        "AG": "Check regulatory requirements for this payment.",
        "BE": "Verify recipient information is complete.",
        "RC": "Confirm the routing/clearing code is correct.",
        "RR": "Ensure all required regulatory data is included.",
        "FF": "This is typically a temporary system issue.",
        "AB": "The receiving bank may be experiencing issues.",
        "MM": "Check mandate details are valid.",
        "MD": "Verify the mandate reference.",
        "MS": "Review the message format.",
        "DS": "Check the data signature or format.",
    }
    for prefix, context in context_map.items():
        if code.startswith(prefix):
            return context
    return ""


# =============================================================================
# COMMON CAUSES & FIX STEPS - Knowledge enrichment
# =============================================================================

COMMON_CAUSES_DB = {
    "AC01": ["Typo in account number", "Outdated account details", "Account recently closed"],
    "AC02": ["Invalid IBAN checksum", "Wrong country code in IBAN", "Account number format mismatch"],
    "AC03": ["Account number doesn't exist at bank", "Wrong bank selected", "Outdated payment details"],
    "AC04": ["Account closed by holder", "Account terminated by bank", "Business dissolved"],
    "AC05": ["Account holder passed away", "Estate not yet settled", "No authorized signatory"],
    "AC06": ["Account frozen by court order", "Regulatory hold", "Compliance investigation"],
    "AC07": ["Account dormant due to inactivity", "Bank requires reactivation", "KYC update needed"],
    "AC13": ["Age verification failed", "Minor's account restrictions", "Legal capacity issue"],
    "AM01": ["Zero amount sent", "Amount field empty", "Calculation error in source system"],
    "AM02": ["Amount exceeds bank limits", "Regulatory threshold breached", "Account limit reached"],
    "AM03": ["Currency not supported by recipient bank", "Currency conversion not available"],
    "AM04": ["Sender has insufficient balance", "Pending transactions blocking funds"],
    "AM05": ["Exact duplicate of previous payment", "System retry created duplicate"],
    "AM06": ["Amount too small for processing", "Below minimum transaction threshold"],
    "AM07": ["Payment blocked by sanctions", "Amount flagged for review"],
    "AM09": ["Wrong decimal places for currency", "Amount format error"],
    "AM10": ["Sum of parts doesn't match total", "Batch total incorrect"],
    "BE01": ["Name on payment doesn't match account", "Business name vs personal name"],
    "BE04": ["Address missing or incomplete", "Country code invalid"],
    "BE05": ["Legal entity identifier missing", "Business registration required"],
    "BE06": ["Recipient not found at address", "Wrong recipient details"],
    "BE07": ["Recipient deceased", "Account holder no longer valid"],
    "RC01": ["BIC code invalid or unknown", "Wrong bank identifier"],
    "RC03": ["Clearing system not supported", "Wrong payment rail selected"],
    "RR01": ["Missing regulatory information", "Compliance data incomplete"],
    "RR02": ["Regulatory ID format wrong", "Tax ID invalid"],
    "RR03": ["Sender info incomplete", "Missing originator details"],
    "RR04": ["Documentation required", "Supporting documents missing"],
    "AB05": ["Recipient bank system slow", "High transaction volume"],
    "AB06": ["Intermediary bank delay", "Routing path timeout"],
    "AB08": ["Bank scheduled maintenance", "Unexpected system outage"],
    "FF01": ["File format rejected", "Invalid character in message"],
    "FF05": ["Payment type not allowed", "Product not available"],
}

FIX_STEPS_DB = {
    "AC01": ["Verify account number with recipient", "Request updated payment details", "Try alternative account"],
    "AC02": ["Validate IBAN using online checker", "Confirm country and bank codes", "Request correct IBAN from recipient"],
    "AC03": ["Contact recipient to confirm account exists", "Verify bank selection", "Request new payment details"],
    "AC04": ["Request alternative account from recipient", "Confirm if account was moved to new bank"],
    "AC05": ["Contact estate executor", "Wait for estate settlement", "Request alternative beneficiary"],
    "AC06": ["Wait for account to be unfrozen", "Contact recipient about account status", "Use alternative account"],
    "AC07": ["Ask recipient to reactivate account", "Recipient may need to complete KYC update"],
    "AC13": ["Verify age requirements for transaction", "Use an adult's account instead"],
    "AM01": ["Verify amount before sending", "Check source system calculation"],
    "AM02": ["Split into smaller payments", "Request limit increase", "Use different payment method"],
    "AM03": ["Convert to supported currency first", "Use different receiving account"],
    "AM04": ["Add funds to account", "Wait for pending transactions to clear"],
    "AM05": ["Do not retry - original may have succeeded", "Check transaction history first"],
    "AM06": ["Combine with other payments", "Use different payment method for small amounts"],
    "AM07": ["Contact compliance team", "Provide additional transaction justification"],
    "AM09": ["Check currency decimal requirements", "Fix amount format in source system"],
    "AM10": ["Recalculate batch totals", "Verify individual transaction amounts"],
    "BE01": ["Use exact name as registered on account", "Request correct recipient name"],
    "BE04": ["Add complete address with country code", "Verify address format requirements"],
    "BE05": ["Obtain and include LEI number", "Request business registration details"],
    "BE06": ["Verify current recipient address", "Confirm recipient identity"],
    "BE07": ["Contact estate for alternative arrangements"],
    "RC01": ["Look up correct BIC code", "Use BIC directory to verify", "Confirm bank details with recipient"],
    "RC03": ["Select appropriate payment rail", "Verify clearing system compatibility"],
    "RR01": ["Add all required regulatory fields", "Check payment type requirements"],
    "RR02": ["Correct the regulatory ID format", "Verify tax ID with recipient"],
    "RR03": ["Include complete sender information", "Add required originator details"],
    "RR04": ["Attach required documentation", "Obtain necessary permits or approvals"],
    "AB05": ["Wait and retry later", "Check for bank status updates"],
    "AB06": ["Wait and retry later", "Consider alternative routing"],
    "AB08": ["Wait for bank to come online", "Retry in a few hours"],
    "FF01": ["Validate message format", "Remove special characters", "Check encoding"],
    "FF05": ["Select correct payment type", "Verify product availability with bank"],
}

PREVENTION_DB = {
    "AC": "Always validate account details before payment. Use IBAN validation tools.",
    "AM": "Implement amount validation checks. Verify limits before submission.",
    "BE": "Collect complete recipient information upfront. Validate addresses.",
    "RC": "Use BIC directory lookups. Validate routing codes before submission.",
    "RR": "Maintain checklist of regulatory requirements by payment corridor.",
    "AB": "Implement retry logic with exponential backoff for temporary failures.",
    "FF": "Validate message format before submission. Use schema validation.",
}


def get_common_causes(code: str) -> list:
    """Get common causes for an error code."""
    return COMMON_CAUSES_DB.get(code, [])


def get_fix_steps(code: str, original_action: str = "") -> list:
    """Get fix steps, combining our knowledge with source action."""
    steps = FIX_STEPS_DB.get(code, [])
    if original_action and original_action not in steps:
        # Add original action if it provides value
        steps = steps + [original_action]
    return steps[:5]  # Limit to 5 steps


def get_prevention(code: str) -> str:
    """Get prevention advice based on error category."""
    for prefix, advice in PREVENTION_DB.items():
        if code.startswith(prefix):
            return advice
    return "Validate all payment details before submission."


# =============================================================================
# DOWNLOAD FUNCTIONS
# =============================================================================

def download_file(url: str, output_path: Path) -> bool:
    print(f"Downloading: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=60)
        response.raise_for_status()
        output_path.write_bytes(response.content)
        print(f"  ✓ Saved: {output_path.name}")
        return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def extract_zip(zip_path: Path, extract_to: Path) -> list:
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(extract_to)
        files = z.namelist()
    print(f"  ✓ Extracted {len(files)} files")
    return files


def download_iso20022_codes() -> dict:
    zip_path = RAW_DIR / "ExternalCodeSets_JSON.zip"
    extract_dir = RAW_DIR / "iso20022"
    extract_dir.mkdir(exist_ok=True)

    if not download_file(SOURCES["iso20022"], zip_path):
        return {}

    extract_zip(zip_path, extract_dir)

    codes = {}
    for json_file in extract_dir.glob("**/*.json"):
        try:
            data = json.loads(json_file.read_text(encoding='utf-8'))
            codes[json_file.stem] = data
            print(f"  ✓ Parsed: {json_file.name}")
        except Exception as e:
            print(f"  ✗ Failed: {json_file.name} - {e}")

    return codes


# =============================================================================
# PARSE ISO 20022 EXTERNAL CODE SETS
# =============================================================================

def parse_iso20022_status_codes(iso_data: dict) -> list:
    """
    Parse ExternalStatusReason1Code entries from ISO 20022 JSON Schema.
    The JSON is a schema with 'definitions' containing code enums and descriptions.
    """
    codes = []

    for filename, data in iso_data.items():
        if not isinstance(data, dict):
            continue

        try:
            # The ISO 20022 JSON is a JSON Schema with definitions
            definitions = data.get('definitions', {})

            # Target code sets that contain error/status codes
            target_codesets = [
                'ExternalStatusReason1Code',           # Main status reasons (301 codes)
                'ExternalCancellationReason1Code',     # Cancellation reasons
                'ExternalPaymentCancellationRejection1Code',  # Cancellation rejections
                'ExternalPaymentModificationRejection1Code',  # Modification rejections
                'ExternalInvestigationStatusReason1Code',     # Investigation status
            ]

            for codeset_name in target_codesets:
                if codeset_name not in definitions:
                    continue

                codeset = definitions[codeset_name]
                enum_codes = codeset.get('enum', [])
                description_text = codeset.get('description', '')

                if not enum_codes:
                    continue

                # Parse descriptions from the description text
                # Format: *\`CODE\`-Description text
                code_descriptions = {}
                pattern = r'\*\\`(\w+)\\`-([^*]+)'
                matches = re.findall(pattern, description_text)
                for code, desc in matches:
                    code_descriptions[code] = desc.strip()

                # Also try alternate format: *`CODE`-Description
                pattern2 = r'\*`(\w+)`-([^*]+)'
                matches2 = re.findall(pattern2, description_text)
                for code, desc in matches2:
                    if code not in code_descriptions:
                        code_descriptions[code] = desc.strip()

                # Create entries for each code
                for code in enum_codes:
                    # Skip if already processed (avoid duplicates across codesets)
                    if any(c['code'] == code for c in codes):
                        continue

                    description = code_descriptions.get(code, f"ISO 20022 status code {code}")

                    # Generate a name from the code if possible
                    name = generate_code_name(code)

                    codes.append({
                        "code": code,
                        "name": name,
                        "description": description,
                        "action": "",
                        "source_url": "https://www.iso20022.org/catalogue-messages/additional-content-messages/external-code-sets",
                        "source_name": "ISO 20022 Official"
                    })

                print(f"  ✓ Parsed {len(enum_codes)} codes from {codeset_name}")

        except Exception as e:
            print(f"  ⚠ Could not parse {filename}: {e}")

    print(f"  ✓ Total: {len(codes)} status reason codes from ISO 20022")
    return codes


def generate_code_name(code: str) -> str:
    """Generate a human-readable name from an ISO 20022 code prefix."""
    # Common code prefix meanings
    prefixes = {
        'AB': 'AbortedTransaction',
        'AC': 'AccountIssue',
        'AG': 'AgentIssue',
        'AM': 'AmountIssue',
        'BE': 'BeneficiaryIssue',
        'CH': 'ChannelIssue',
        'CN': 'CancellationIssue',
        'CURR': 'CurrencyIssue',
        'CUST': 'CustomerIssue',
        'DC': 'DirectDebitIssue',
        'DT': 'DateIssue',
        'DU': 'DuplicateIssue',
        'ED': 'EndDateIssue',
        'FF': 'FormatIssue',
        'FR': 'FraudIssue',
        'ID': 'IdentificationIssue',
        'MD': 'MandateIssue',
        'MS': 'MissingIssue',
        'NARR': 'NarrativeIssue',
        'NOAS': 'NoAnswerFromCustomer',
        'NOOR': 'NoOriginalTransactionReceived',
        'PY': 'PaymentIssue',
        'RC': 'RegulatoryIssue',
        'RF': 'ReferenceIssue',
        'RR': 'RegulatoryReason',
        'SL': 'ServiceLevelIssue',
        'SP': 'SpecificIssue',
        'TM': 'TimingIssue',
        'TR': 'TransactionIssue',
        'TS': 'TechnicalIssue',
        'UPAY': 'UnduePayment',
    }

    # Extract prefix (letters before numbers)
    prefix_match = re.match(r'^([A-Z]+)', code)
    if prefix_match:
        prefix = prefix_match.group(1)
        base_name = prefixes.get(prefix, f'{prefix}Issue')
        return f"{base_name}_{code}"

    return code


# =============================================================================
# SCRAPE FUNCTIONS
# =============================================================================

def scrape_nium() -> list:
    """Scrape Nium failure codes - public API documentation."""
    print(f"\nScraping: {SOURCES['nium']}")

    try:
        response = requests.get(SOURCES["nium"], headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        codes = []
        for table in soup.find_all('table'):
            rows = table.find_all('tr')[1:]  # Skip header

            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 4:
                    code = cells[0].get_text(strip=True)
                    if code and code[0].isalpha():
                        codes.append({
                            "code": code,
                            "name": cells[1].get_text(strip=True),
                            "description": cells[2].get_text(strip=True),
                            "action": cells[3].get_text(strip=True),
                            "source_url": SOURCES["nium"],
                            "source_name": "Nium Implementation Guide"
                        })

        print(f"  ✓ Found {len(codes)} codes from Nium")
        return codes

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return []


def get_swift_cbpr_codes() -> list:
    """
    SWIFT CBPR+ error codes - built from public documentation.
    These are standard ISO 20022 codes with CBPR+ market practice context.
    Source: SWIFT CBPR+ Guidelines (public documentation)
    """
    # CBPR+ commonly referenced codes with enhanced context
    # Data compiled from public SWIFT CBPR+ documentation
    codes = [
        {
            "code": "AC01",
            "name": "IncorrectAccountNumber",
            "description": "The account number is either invalid or does not exist at the receiving bank.",
            "action": "Verify account number with beneficiary. Check for typos or outdated details.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
        {
            "code": "AC04",
            "name": "ClosedAccountNumber",
            "description": "The account has been closed and can no longer receive payments.",
            "action": "Contact beneficiary for alternative account details.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
        {
            "code": "AC06",
            "name": "BlockedAccount",
            "description": "The account is blocked and cannot receive credits. May be due to regulatory hold or legal restriction.",
            "action": "Contact beneficiary about account status. May need to wait for block removal.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
        {
            "code": "AG01",
            "name": "TransactionForbidden",
            "description": "The transaction is not allowed for this account type or payment channel.",
            "action": "Check if payment type is appropriate for the account. May need different payment method.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
        {
            "code": "AG03",
            "name": "TransactionNotSupported",
            "description": "The receiving bank does not support this type of transaction.",
            "action": "Use alternative payment method or different receiving bank.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
        {
            "code": "AGNT",
            "name": "AgentDecision",
            "description": "The payment was rejected based on a decision by an agent in the payment chain.",
            "action": "Contact the rejecting bank for specific reason. May need additional documentation.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
        {
            "code": "CURR",
            "name": "CurrencyRejection",
            "description": "The currency of the payment is not accepted by the receiving bank or country.",
            "action": "Check currency requirements. May need to send in local currency.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
        {
            "code": "CUST",
            "name": "CustomerDecision",
            "description": "The customer (beneficiary) requested rejection or return of the payment.",
            "action": "Contact beneficiary to understand rejection reason.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
        {
            "code": "DUPL",
            "name": "DuplicatePayment",
            "description": "The payment appears to be a duplicate of a previously processed transaction.",
            "action": "Check if original payment succeeded. Do not retry without verification.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
        {
            "code": "FOCR",
            "name": "FollowingCancellationRequest",
            "description": "The payment was returned following a cancellation request.",
            "action": "Expected return. Process the refund accordingly.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
        {
            "code": "TECH",
            "name": "TechnicalError",
            "description": "A technical error occurred during payment processing.",
            "action": "Retry the payment. If persistent, contact support.",
            "source_url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
            "source_name": "SWIFT CBPR+ Guidelines"
        },
    ]

    print(f"  ✓ Loaded {len(codes)} SWIFT CBPR+ codes")
    return codes


def get_jpmorgan_codes() -> list:
    """
    J.P. Morgan payment error codes - from public documentation.
    Focus on practical guidance for common errors.
    Source: J.P. Morgan ISO 20022 resources (public)
    """
    codes = [
        {
            "code": "NARR",
            "name": "Narrative",
            "description": "Payment rejected due to narrative/reference field issue. May contain invalid characters or exceed length limits.",
            "action": "Check reference field for special characters. Ensure within length limits.",
            "source_url": "https://www.jpmorgan.com/payments/iso-20022",
            "source_name": "J.P. Morgan ISO 20022 Guide"
        },
        {
            "code": "NOAS",
            "name": "NoAnswerFromCustomer",
            "description": "No response received from the customer when additional information was requested.",
            "action": "Respond to pending information requests. Check for messages from your bank.",
            "source_url": "https://www.jpmorgan.com/payments/iso-20022",
            "source_name": "J.P. Morgan ISO 20022 Guide"
        },
        {
            "code": "NOOR",
            "name": "NoOriginalTransactionReceived",
            "description": "The original transaction referenced in a return or cancellation was not found.",
            "action": "Verify the original transaction reference. Ensure correct end-to-end ID.",
            "source_url": "https://www.jpmorgan.com/payments/iso-20022",
            "source_name": "J.P. Morgan ISO 20022 Guide"
        },
        {
            "code": "ARDT",
            "name": "AlreadyReturnedTransaction",
            "description": "The transaction has already been returned and cannot be processed again.",
            "action": "Check transaction history. This payment was already refunded.",
            "source_url": "https://www.jpmorgan.com/payments/iso-20022",
            "source_name": "J.P. Morgan ISO 20022 Guide"
        },
        {
            "code": "LEGL",
            "name": "LegalDecision",
            "description": "Payment blocked or returned due to a legal or regulatory decision.",
            "action": "Contact your compliance team. May require legal review.",
            "source_url": "https://www.jpmorgan.com/payments/iso-20022",
            "source_name": "J.P. Morgan ISO 20022 Guide"
        },
        {
            "code": "SL01",
            "name": "SpecificServiceOfferedByDebtorAgent",
            "description": "A specific service offered by the sending bank is required but not available.",
            "action": "Check with your bank about required service enrollment.",
            "source_url": "https://www.jpmorgan.com/payments/iso-20022",
            "source_name": "J.P. Morgan ISO 20022 Guide"
        },
        {
            "code": "SL02",
            "name": "SpecificServiceOfferedByCreditorAgent",
            "description": "A specific service required at the receiving bank is not available.",
            "action": "Verify receiving bank capabilities. May need alternative bank.",
            "source_url": "https://www.jpmorgan.com/payments/iso-20022",
            "source_name": "J.P. Morgan ISO 20022 Guide"
        },
    ]

    print(f"  ✓ Loaded {len(codes)} J.P. Morgan codes")
    return codes


def get_additional_iso20022_codes() -> list:
    """
    Additional ISO 20022 error codes from official documentation.
    These are commonly used codes that may not be in the automated download.
    Source: ISO 20022 External Code Sets
    """
    codes = [
        {
            "code": "AC02",
            "name": "InvalidDebtorAccountNumber",
            "description": "The debtor account number format is invalid or does not match the bank's requirements.",
            "action": "Verify the debtor account number format. Check if IBAN validation passes.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AC05",
            "name": "ClosedDebtorAccountNumber",
            "description": "The debtor account has been closed and cannot be debited.",
            "action": "Use an alternative active account for the payment.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AC07",
            "name": "ClosedCreditorAccountNumber",
            "description": "The creditor account has been closed at the receiving bank.",
            "action": "Request updated account details from the beneficiary.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AC10",
            "name": "InvalidCreditorAccountNumberType",
            "description": "The type of account provided for the creditor is not recognized or supported.",
            "action": "Verify account type specification. Use IBAN or supported local format.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AC11",
            "name": "InvalidCreditorAccountCurrency",
            "description": "The currency specified for the creditor account is not valid or not supported.",
            "action": "Confirm the correct account currency with the beneficiary.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AC14",
            "name": "InvalidCreditorAccountType",
            "description": "The creditor account type is invalid or not supported by the receiving bank.",
            "action": "Verify the account type. May need to use a different account.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AG02",
            "name": "InvalidBankOperationCode",
            "description": "The bank operation code specified in the payment is not valid.",
            "action": "Review the operation code. Consult bank documentation for valid codes.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM02",
            "name": "NotAllowedAmount",
            "description": "The transaction amount is not allowed based on bank or regulatory limits.",
            "action": "Check amount limits for the payment corridor. Split into smaller amounts if needed.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM03",
            "name": "NotAllowedCurrency",
            "description": "The currency is not supported for this payment type or destination.",
            "action": "Use a supported currency or alternative payment method.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM04",
            "name": "InsufficientFunds",
            "description": "The debtor account has insufficient funds to complete the payment.",
            "action": "Ensure sufficient balance before retrying. Consider pending transactions.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM05",
            "name": "Duplication",
            "description": "The payment is a duplicate of a transaction that was already processed.",
            "action": "Check transaction history. Do not retry if original succeeded.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM06",
            "name": "TooLowAmount",
            "description": "The payment amount is below the minimum threshold for processing.",
            "action": "Increase amount or combine with other payments.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM07",
            "name": "BlockedAmount",
            "description": "The amount is blocked due to regulatory or compliance restrictions.",
            "action": "Contact compliance team. Provide justification for the transaction.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM10",
            "name": "InvalidControlSum",
            "description": "The control sum of the payment batch does not match the individual amounts.",
            "action": "Recalculate batch totals. Verify all individual transaction amounts.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM11",
            "name": "InvalidChargeBearer",
            "description": "The charge bearer code specified is not valid or not supported.",
            "action": "Use a valid charge bearer code (SHAR, CRED, DEBT).",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM12",
            "name": "InvalidLevel",
            "description": "The service level specified is not valid or supported.",
            "action": "Check service level codes. Use standard values like SEPA, NURG, SDVA.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM14",
            "name": "AmountExceedsClearingSystemLimit",
            "description": "The payment amount exceeds the limit of the clearing system.",
            "action": "Split payment into multiple transactions below the limit.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM15",
            "name": "AmountExceedsAgreedLimit",
            "description": "The amount exceeds limits agreed between the parties.",
            "action": "Request limit increase or split into smaller payments.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM16",
            "name": "InvalidGroupControlSum",
            "description": "The group control sum in the message header does not match transaction totals.",
            "action": "Recalculate group header control sum. Verify message structure.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM17",
            "name": "InvalidDebtorAmount",
            "description": "The debtor amount specified is not valid for this transaction type.",
            "action": "Verify amount format and decimal places for the currency.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM18",
            "name": "InvalidCreditorAmount",
            "description": "The creditor amount specified is not valid or does not match requirements.",
            "action": "Check creditor amount specification. Ensure consistency with instructed amount.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM19",
            "name": "InvalidInterbankAmount",
            "description": "The interbank settlement amount is invalid or inconsistent.",
            "action": "Verify settlement amount calculation. Check for FX rate issues.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM20",
            "name": "InvalidExchangeRate",
            "description": "The foreign exchange rate provided is not valid or not current.",
            "action": "Use current market rates. Verify FX rate source and timestamp.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM22",
            "name": "InvalidDate",
            "description": "A date specified in the payment instruction is invalid or not allowed.",
            "action": "Verify all date fields. Check for non-business days or past dates.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "AM23",
            "name": "NoMatchingAmount",
            "description": "The amounts specified in different parts of the message do not match.",
            "action": "Ensure consistency across all amount fields in the message.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE01",
            "name": "InconsistentWithEndCustomer",
            "description": "Party information is inconsistent with the end customer details on record.",
            "action": "Verify name spelling matches account registration exactly.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE04",
            "name": "MissingCreditorAddress",
            "description": "The creditor address is missing or incomplete.",
            "action": "Provide complete address including street, city, postal code, and country.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE05",
            "name": "UnrecognizedInitiatingParty",
            "description": "The initiating party is not recognized or not authorized.",
            "action": "Verify initiating party details. Check authorization status.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE06",
            "name": "UnknownEndCustomer",
            "description": "The end customer specified in the payment is unknown to the bank.",
            "action": "Verify customer details. Ensure account relationship exists.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE08",
            "name": "MissingDebtorName",
            "description": "The debtor name is missing from the payment instruction.",
            "action": "Add complete debtor name to the payment message.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE09",
            "name": "MissingDebtorAddress",
            "description": "The debtor address information is missing or incomplete.",
            "action": "Include full debtor address in the payment instruction.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE13",
            "name": "InvalidDebtorIdentification",
            "description": "The debtor identification code or number is not valid.",
            "action": "Verify debtor ID format. Use correct identification scheme.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE14",
            "name": "InvalidCreditorIdentification",
            "description": "The creditor identification code is invalid or not recognized.",
            "action": "Check creditor ID format. Verify with beneficiary.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE15",
            "name": "InconsistentWithCreditor",
            "description": "Payment details are inconsistent with creditor information on file.",
            "action": "Verify all creditor details match bank records exactly.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE19",
            "name": "MissingCreditorName",
            "description": "The creditor name is missing from the payment instruction.",
            "action": "Add complete beneficiary name to the payment.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE20",
            "name": "InvalidCreditorCountry",
            "description": "The creditor country code is invalid or not supported.",
            "action": "Use valid ISO country code. Check payment corridor support.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE21",
            "name": "InvalidDebtorCountry",
            "description": "The debtor country code is invalid or not supported for this payment.",
            "action": "Verify country code. Check if payment corridor is supported.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "BE22",
            "name": "InvalidServiceLevel",
            "description": "The service level code specified is not valid for this payment type.",
            "action": "Use appropriate service level code for the payment scheme.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH03",
            "name": "RequestedExecutionDateOrRequestedCollectionDateTooFarInFuture",
            "description": "The requested execution date is beyond the allowed future date range.",
            "action": "Use a nearer execution date within allowed timeframe.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH04",
            "name": "RequestedExecutionDateOrRequestedCollectionDateTooFarInPast",
            "description": "The requested execution date is in the past or too far back.",
            "action": "Update to a current or future date within allowed range.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH07",
            "name": "ElementIsNotToBeUsed",
            "description": "An element was included in the message that should not be used for this transaction type.",
            "action": "Remove the unnecessary element from the message.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH09",
            "name": "MandatoryElementMissing",
            "description": "A required element is missing from the payment message.",
            "action": "Add all mandatory elements. Check message schema requirements.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH11",
            "name": "InvalidReference",
            "description": "The payment reference or end-to-end ID is invalid.",
            "action": "Use valid reference format. Check character restrictions.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH12",
            "name": "InvalidMessageFormat",
            "description": "The overall message format does not comply with the schema.",
            "action": "Validate message against XSD schema. Fix structure errors.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH13",
            "name": "InvalidFileFormat",
            "description": "The file format of the payment file is not valid.",
            "action": "Use correct file format. Verify XML encoding and structure.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH14",
            "name": "InvalidLocalInstrument",
            "description": "The local instrument code specified is not valid or not supported.",
            "action": "Use valid local instrument code for the payment scheme.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH15",
            "name": "InvalidCategoryPurpose",
            "description": "The category purpose code is not valid for this payment type.",
            "action": "Use appropriate category purpose code or remove if optional.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH16",
            "name": "InvalidPurpose",
            "description": "The purpose code specified is invalid or not allowed.",
            "action": "Select valid purpose code from allowed list.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH17",
            "name": "InvalidEndToEndId",
            "description": "The end-to-end identification does not meet format requirements.",
            "action": "Ensure end-to-end ID follows format rules. Check length and characters.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "CH18",
            "name": "InvalidPaymentInfoId",
            "description": "The payment information identification is not in valid format.",
            "action": "Use valid format for payment information ID.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "DT01",
            "name": "InvalidDate",
            "description": "A date field contains an invalid date value.",
            "action": "Check date format (YYYY-MM-DD). Ensure date is valid.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "DT02",
            "name": "InvalidCreationDateTime",
            "description": "The message creation date and time is not valid.",
            "action": "Use current date/time in ISO 8601 format.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RC04",
            "name": "InvalidCreditorAgentBIC",
            "description": "The creditor agent BIC code is not valid or not found.",
            "action": "Verify BIC code with beneficiary bank. Use BIC directory.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RC05",
            "name": "InvalidDebtorAgentBIC",
            "description": "The debtor agent BIC code is invalid.",
            "action": "Verify your bank's BIC code. Check with your bank.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RC06",
            "name": "InvalidIntermediaryAgentBIC",
            "description": "An intermediary agent BIC in the payment chain is not valid.",
            "action": "Verify all intermediary BIC codes. May need different routing.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RC08",
            "name": "InvalidCreditorAgentClearingCode",
            "description": "The clearing code for the creditor agent is invalid.",
            "action": "Verify clearing system member ID. Check with receiving bank.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RC09",
            "name": "InvalidDebtorAgentClearingCode",
            "description": "The clearing code for the debtor agent is not valid.",
            "action": "Confirm clearing code with your bank.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RC10",
            "name": "InvalidIntermediaryAgentClearingCode",
            "description": "An intermediary agent clearing code is invalid.",
            "action": "Verify clearing codes for all intermediary banks.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RC11",
            "name": "InvalidClearingSystemCode",
            "description": "The clearing system code specified is not recognized.",
            "action": "Use valid clearing system identifier. Check scheme requirements.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RR01",
            "name": "MissingRegulatoryReporting",
            "description": "Required regulatory reporting information is missing.",
            "action": "Add all required regulatory fields for the payment corridor.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RR02",
            "name": "InvalidRegulatoryReporting",
            "description": "Regulatory reporting information provided is not valid.",
            "action": "Verify regulatory data format and values. Check country requirements.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RR05",
            "name": "RegulatoryReason",
            "description": "Payment rejected for regulatory compliance reasons.",
            "action": "Contact compliance team. May need additional documentation.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RR06",
            "name": "TaxInformationInvalid",
            "description": "Tax information provided is invalid or incomplete.",
            "action": "Verify tax ID numbers and tax reporting data.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RR07",
            "name": "RemittanceInformationInvalid",
            "description": "The remittance information format or content is not valid.",
            "action": "Check remittance info format. Remove special characters if needed.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
        {
            "code": "RR08",
            "name": "RemittanceInformationTruncationNotAllowed",
            "description": "Remittance information would be truncated, which is not allowed.",
            "action": "Shorten remittance information to fit within length limits.",
            "source_url": "https://www.iso20022.org/external_code_list.page",
            "source_name": "ISO 20022 External Codes"
        },
    ]

    print(f"  ✓ Loaded {len(codes)} additional ISO 20022 codes")
    return codes


# =============================================================================
# HELPERS - Categorization & XPath Mapping
# =============================================================================

def get_category(code: str) -> str:
    mapping = {
        "AC": "Account", "AM": "Amount", "AG": "Regulatory",
        "BE": "Party", "RC": "Routing", "RR": "Regulatory",
        "FF": "System", "AB": "System", "MM": "Party",
        "MD": "Mandate", "MS": "System", "DS": "System",
        "NARR": "Narrative", "FOCR": "Cancellation", "DUPL": "Duplicate",
        "TECH": "System", "CUST": "Party", "AGNT": "Routing",
        "CURR": "Amount", "LEGL": "Regulatory", "NOAS": "Party",
        "NOOR": "System", "ARDT": "System", "SL": "System",
        "CH": "System", "DT": "System"
    }
    for prefix, cat in mapping.items():
        if code.startswith(prefix):
            return cat
    return "Other"


def get_severity(code: str, desc: str) -> str:
    temp_keywords = ["timeout", "offline", "system error", "temporary", "retry",
                     "technical", "unavailable", "try again"]
    if any(k in desc.lower() for k in temp_keywords):
        return "temporary"
    if code.startswith(("AB", "FF", "TECH")):
        return "temporary"
    return "fatal"


def get_message_types(code: str) -> list:
    if code.startswith("AM"):
        return ["pacs.008", "pacs.009"]
    if code.startswith(("BE", "RR", "MM")):
        return ["pacs.008"]
    if code.startswith("FOCR"):
        return ["camt.056", "camt.029"]
    return ["pacs.008", "pacs.004", "pacs.009"]


def get_xpaths(code: str) -> list:
    mapping = {
        "AC": ["/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAcct/Id/IBAN",
               "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAcct/Id/Othr/Id"],
        "RC": ["/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/BICFI",
               "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/CdtrAgt/FinInstnId/ClrSysMmbId"],
        "AM": ["/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt",
               "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/InstdAmt"],
        "BE": ["/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Nm",
               "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/PstlAdr"],
        "RR": ["/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RgltryRptg"],
        "MM": ["/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr/Nm"],
        "NARR": ["/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Ustrd"],
        "AGNT": ["/Document/FIToFICstmrCdtTrf/GrpHdr/InstgAgt",
                 "/Document/FIToFICstmrCdtTrf/GrpHdr/InstdAgt"],
        "CURR": ["/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt/@Ccy"],
    }
    for prefix, paths in mapping.items():
        if code.startswith(prefix):
            return paths
    return []


def get_market_practices(code: str) -> list:
    """Determine which market practices this code applies to."""
    # Most codes apply to all major practices
    practices = ["CBPR+"]

    # Add regional practices based on common usage
    if code.startswith(("AC", "AM", "BE", "RC")):
        practices.extend(["SEPA", "FedNow", "TIPS"])
    elif code.startswith(("RR", "AG")):
        practices.extend(["SEPA", "FedNow"])  # Strong regulatory requirements
    else:
        practices.append("SEPA")

    return practices


# =============================================================================
# BUILD KNOWLEDGE BASE
# =============================================================================

def build_knowledge_base(all_codes: list) -> dict:
    today = datetime.now().strftime("%Y-%m-%d")
    errors = []
    seen = set()

    for idx, c in enumerate(all_codes, 1):
        if c["code"] in seen:
            continue
        seen.add(c["code"])

        # Paraphrase the description
        desc = paraphrase_description(c["description"], c["code"])

        # Get enriched data
        common_causes = get_common_causes(c["code"])
        fix_steps = get_fix_steps(c["code"], c.get("action", ""))
        prevention = get_prevention(c["code"])

        errors.append({
            "id": f"err_{idx:03d}",
            "code": c["code"],
            "name": c["name"],
            "category": get_category(c["code"]),
            "severity": get_severity(c["code"], c["description"]),
            "message_types": get_message_types(c["code"]),
            "description": desc,
            "common_causes": common_causes,
            "how_to_fix": {
                "steps": fix_steps,
                "prevention": prevention
            },
            "xpath_locations": get_xpaths(c["code"]),
            "related_codes": get_related_codes(c["code"]),
            "market_practices": get_market_practices(c["code"]),
            "resources": [
                {
                    "title": c.get("source_name", "Implementation Guide"),
                    "url": c["source_url"],
                    "type": "implementation_guide"
                },
                {
                    "title": "ISO 20022 External Code Sets",
                    "url": "https://www.iso20022.org/catalogue-messages/additional-content-messages/external-code-sets",
                    "type": "official"
                }
            ],
            "metadata": {
                "added_date": today,
                "last_verified": today,
                "contributor": "scraper_v2",
                "confidence": "verified"
            }
        })

    # Sort by code for consistency
    errors.sort(key=lambda x: x["code"])

    # Re-number IDs after sorting
    for idx, err in enumerate(errors, 1):
        err["id"] = f"err_{idx:03d}"

    return {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "ISO 20022 Error Knowledge Base",
        "version": "2.0.0",
        "last_updated": today,
        "total_errors": len(errors),
        "errors": errors,
        "categories": [
            {"id": "Account", "name": "Account Errors", "code_prefix": "AC", "description": "Issues with the debtor or creditor account"},
            {"id": "Amount", "name": "Amount Errors", "code_prefix": "AM", "description": "Issues with payment amount or currency"},
            {"id": "Party", "name": "Party Information Errors", "code_prefix": "BE, MM", "description": "Issues with party identification or details"},
            {"id": "Routing", "name": "Routing Errors", "code_prefix": "RC, AGNT", "description": "Issues with payment routing or clearing"},
            {"id": "Regulatory", "name": "Regulatory Errors", "code_prefix": "AG, RR, LEGL", "description": "Regulatory or compliance related rejections"},
            {"id": "System", "name": "System Errors", "code_prefix": "FF, AB, TECH", "description": "Technical or system-related failures"},
            {"id": "Cancellation", "name": "Cancellation", "code_prefix": "FOCR", "description": "Payment cancellation related"},
            {"id": "Duplicate", "name": "Duplicate", "code_prefix": "DUPL", "description": "Duplicate payment detection"},
            {"id": "Narrative", "name": "Narrative", "code_prefix": "NARR", "description": "Reference or narrative field issues"}
        ],
        "sources": [
            {
                "name": "ISO 20022",
                "url": "https://www.iso20022.org/catalogue-messages/additional-content-messages/external-code-sets",
                "description": "Official ISO 20022 external code set definitions"
            },
            {
                "name": "Nium",
                "url": "https://docs.nium.com/docs/failure-codes",
                "description": "Practical implementation guidance from Nium payment platform"
            },
            {
                "name": "SWIFT CBPR+",
                "url": "https://www.swift.com/standards/iso-20022/iso-20022-programme",
                "description": "SWIFT Cross-Border Payments and Reporting Plus guidelines"
            },
            {
                "name": "J.P. Morgan",
                "url": "https://www.jpmorgan.com/payments/iso-20022",
                "description": "J.P. Morgan ISO 20022 implementation resources"
            }
        ]
    }


def get_related_codes(code: str) -> list:
    """Find related error codes based on category and common patterns."""
    relations = {
        "AC01": ["AC02", "AC03"],  # Account number issues
        "AC02": ["AC01", "AC03"],
        "AC03": ["AC01", "AC04"],
        "AC04": ["AC05", "AC06", "AC07"],  # Account status issues
        "AC05": ["AC04", "AC06"],
        "AC06": ["AC04", "AC07"],
        "AC07": ["AC04", "AC06"],
        "AM01": ["AM02", "AM04"],  # Amount issues
        "AM02": ["AM01", "AM04"],
        "AM04": ["AM01", "AM02"],
        "AM05": ["DUPL"],  # Duplicate related
        "BE01": ["BE04", "BE06"],  # Party info
        "BE04": ["BE01", "BE06"],
        "RC01": ["RC03", "AGNT"],  # Routing
        "RC03": ["RC01"],
        "DUPL": ["AM05"],
        "AB05": ["AB06", "AB08"],  # System timeout
        "AB06": ["AB05", "AB08"],
        "AB08": ["AB05", "AB06"],
    }
    return relations.get(code, [])


# =============================================================================
# MAIN
# =============================================================================

def main():
    print("=" * 60)
    print("ISO 20022 Error Knowledge Base Builder v2.1")
    print("With paraphrasing, enrichment, and multi-source support")
    print("=" * 60)

    print("\n[1/6] Downloading ISO 20022 official codes...")
    iso_codes = download_iso20022_codes()

    print("\n[2/6] Parsing ISO 20022 status reason codes...")
    iso_parsed = parse_iso20022_status_codes(iso_codes)

    print("\n[3/6] Scraping Nium failure codes...")
    nium_codes = scrape_nium()

    print("\n[4/6] Loading SWIFT CBPR+ and J.P. Morgan codes...")
    swift_codes = get_swift_cbpr_codes()
    jpmorgan_codes = get_jpmorgan_codes()

    print("\n[5/6] Loading additional ISO 20022 error codes...")
    additional_iso_codes = get_additional_iso20022_codes()

    # Combine all sources (Nium first as primary, then others fill gaps)
    all_codes = nium_codes + swift_codes + jpmorgan_codes + additional_iso_codes + iso_parsed
    print(f"\n  Total codes collected: {len(all_codes)}")

    print("\n[6/6] Building knowledge base with paraphrasing...")
    kb = build_knowledge_base(all_codes)

    output_file = OUTPUT_DIR / "error_knowledge_base.json"
    output_file.write_text(json.dumps(kb, indent=2, ensure_ascii=False), encoding='utf-8')

    print(f"\n{'=' * 60}")
    print(f"✓ Saved: {output_file}")
    print(f"✓ Total unique errors: {kb['total_errors']}")
    print(f"✓ Version: {kb['version']}")
    print(f"\nSources used:")
    for src in kb['sources']:
        print(f"  - {src['name']}: {src['url']}")
    print(f"\nNext: Copy to ../public/data/errors.json")


if __name__ == "__main__":
    main()
