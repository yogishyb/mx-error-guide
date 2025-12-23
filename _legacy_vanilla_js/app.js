/**
 * MX Error Guide
 * Client-side ISO 20022 error lookup
 */

(function() {
    // State
    let errors = [];
    let fuse = null;
    let currentPage = 1;
    const ITEMS_PER_PAGE = 10;
    let showAllMode = false; // false = paginated (default), true = show all

    // ==========================================================================
    // TEMPLATE ENGINE - P1-002a: No-cost explanations
    // Generates "For Ops" and "For Devs" explanations based on category/severity
    // ==========================================================================

    const EXPLANATION_TEMPLATES = {
        // Operations team templates (plain English, action-focused)
        ops: {
            Account: {
                fatal: "This payment was rejected due to an account problem ({code}: {name}). The {detail}. Contact the beneficiary or sender to verify account details and request updated banking information before resubmitting.",
                temporary: "This payment is on hold due to a temporary account issue ({code}). The {detail}. This may resolve automatically, but consider contacting the account holder to verify status."
            },
            Amount: {
                fatal: "Payment rejected due to an amount issue ({code}: {name}). The {detail}. Review the payment amount, check for limits or restrictions, and adjust before resubmitting.",
                temporary: "Payment delayed due to amount validation ({code}). The {detail}. Check daily/transaction limits and retry when limits reset."
            },
            Party: {
                fatal: "Payment rejected due to party identification issue ({code}: {name}). The {detail}. Verify the sender or beneficiary details (name, address, ID) and correct before resubmitting.",
                temporary: "Payment on hold for party verification ({code}). The {detail}. Additional documentation may be required."
            },
            Routing: {
                fatal: "Payment failed due to routing issue ({code}: {name}). The {detail}. Verify BIC/SWIFT codes, correspondent bank details, and clearing system identifiers before retry.",
                temporary: "Payment delayed due to routing issue ({code}). The {detail}. The intermediary bank may be temporarily unavailable."
            },
            Regulatory: {
                fatal: "Payment blocked for regulatory/compliance reasons ({code}: {name}). The {detail}. Review sanctions lists, AML requirements, and ensure all regulatory documentation is complete.",
                temporary: "Payment under regulatory review ({code}). The {detail}. Additional compliance documentation may speed up processing."
            },
            System: {
                fatal: "Payment failed due to a system error ({code}: {name}). The {detail}. This is typically a technical issue - retry later or contact your payment provider's support.",
                temporary: "Payment delayed due to system issues ({code}). The {detail}. The system should recover automatically - retry in a few minutes."
            },
            Mandate: {
                fatal: "Direct debit/mandate issue ({code}: {name}). The {detail}. Verify the mandate is active and valid, check authorization dates, and ensure proper setup before retry.",
                temporary: "Mandate processing delayed ({code}). The {detail}. Allow additional time for mandate verification."
            },
            Duplicate: {
                fatal: "Duplicate payment detected ({code}: {name}). The {detail}. This payment appears to have been submitted before. Verify whether the original was processed.",
                temporary: "Potential duplicate flagged ({code}). The {detail}. Review recent transactions before resubmitting."
            },
            Cancellation: {
                fatal: "Cancellation failed ({code}: {name}). The {detail}. The original payment may have already been processed or the cancellation window has passed.",
                temporary: "Cancellation pending ({code}). The {detail}. Allow time for the cancellation request to be processed."
            },
            Narrative: {
                fatal: "Payment rejected due to narrative/reference issue ({code}: {name}). The {detail}. Review payment description, reference fields, and ensure no prohibited characters or content.",
                temporary: "Payment held for narrative review ({code}). The {detail}. Review may be required for the payment description."
            },
            Other: {
                fatal: "Payment rejected ({code}: {name}). The {detail}. Review the specific error details and contact your payment provider for guidance.",
                temporary: "Payment processing delayed ({code}). The {detail}. Monitor the payment status and contact support if not resolved."
            }
        },

        // Developer templates (technical, implementation-focused)
        dev: {
            Account: {
                fatal: "Error {code} ({name}): Account validation failed. Check the following XML elements: DbtrAcct/Id/IBAN or CdtrAcct/Id/IBAN. Ensure the account exists, is active, and currency matches. Implement pre-submission account validation via API if available.",
                temporary: "Error {code}: Temporary account status issue. The account may be under maintenance or pending activation. Implement retry logic with exponential backoff (recommended: 3 retries, 5/15/60 min intervals)."
            },
            Amount: {
                fatal: "Error {code} ({name}): Amount validation failed. Verify InstdAmt or EqvtAmt elements. Check: (1) Amount > 0, (2) Within transaction limits, (3) Currency code valid (ISO 4217), (4) Decimal places match currency. Implement client-side amount validation before submission.",
                temporary: "Error {code}: Amount limit temporarily exceeded. Check IntrBkSttlmAmt against daily aggregate limits. Implement limit tracking to prevent over-submission."
            },
            Party: {
                fatal: "Error {code} ({name}): Party identification failed. Check Dbtr/Nm, Cdtr/Nm, and related Id elements. Ensure: (1) Name format matches bank requirements, (2) Address is complete, (3) ID type/number valid. Consider implementing name matching algorithm for validation.",
                temporary: "Error {code}: Party verification pending. The bank may require additional KYC data. Prepare to supply SplmtryData with additional party information if requested."
            },
            Routing: {
                fatal: "Error {code} ({name}): Routing lookup failed. Verify: (1) CdtrAgt/FinInstnId/BICFI is valid 8 or 11 char BIC, (2) ClrSysMmbId if using national clearing, (3) Correspondent chain is complete. Use SWIFT BIC directory API for validation.",
                temporary: "Error {code}: Intermediary agent temporarily unavailable. The correspondent bank may be offline. Implement circuit breaker pattern and route via alternate correspondent if available."
            },
            Regulatory: {
                fatal: "Error {code} ({name}): Regulatory check failed. Review: (1) RgltryRptg elements for completeness, (2) Purp/Cd matches allowed values, (3) Party names against sanctions lists. Implement pre-flight regulatory screening.",
                temporary: "Error {code}: Regulatory review in progress. Payment queued for compliance check. No action needed - monitor via pacs.002 status messages."
            },
            System: {
                fatal: "Error {code} ({name}): System-level failure. This indicates infrastructure issues. Log full error context, implement retry with backoff. If persistent, escalate to payment gateway support. Check GrpHdr/CreDtTm is within acceptable window.",
                temporary: "Error {code}: Transient system error. Implement automatic retry: (1) Wait 30 seconds, (2) Retry with same MsgId, (3) Max 3 attempts. If using SWIFT, check for network status updates."
            },
            Mandate: {
                fatal: "Error {code} ({name}): Mandate validation failed. Check MndtRltdInf elements: MndtId, DtOfSgntr, FrqcyPrd. Ensure mandate is registered and active in creditor's mandate management system before submission.",
                temporary: "Error {code}: Mandate activation pending. New mandates may take 1-3 business days. Implement mandate status polling before first collection attempt."
            },
            Duplicate: {
                fatal: "Error {code} ({name}): Duplicate detected. The MsgId or EndToEndId matches a previous submission. Implement idempotency: (1) Track submitted IDs, (2) Check before submission, (3) Query status of original. Consider TxId uniqueness per UTC day.",
                temporary: "Error {code}: Potential duplicate flagged for review. Your deduplication window may overlap with the bank's. Adjust EndToEndId generation to include microsecond precision."
            },
            Cancellation: {
                fatal: "Error {code} ({name}): Cancellation request rejected. Check CtrlSum and NbOfTxs in camt.056 match original. Cancellation may be rejected if payment already settled. Query payment status via camt.052 before cancellation.",
                temporary: "Error {code}: Cancellation request queued. Implement async callback handler for camt.029 response. Settlement finality rules may delay cancellation processing."
            },
            Narrative: {
                fatal: "Error {code} ({name}): Narrative validation failed. Check RmtInf/Ustrd for: (1) Prohibited characters (avoid &, <, >), (2) Max length (140 chars for SEPA), (3) Encoding (UTF-8). Sanitize user input before message construction.",
                temporary: "Error {code}: Narrative under review. Structured remittance (RmtInf/Strd) may process faster than unstructured. Consider using Cdtr/Ref for critical reference data."
            },
            Other: {
                fatal: "Error {code} ({name}): Unclassified rejection. Parse the full AddtlInf element for bank-specific error details. Log complete pacs.002/camt.053 response for debugging. Contact payment gateway support with MsgId for investigation.",
                temporary: "Error {code}: Processing delay. Monitor via status inquiry (pacs.028). Implement webhook or polling for status updates. Most temporary errors resolve within 4 hours."
            }
        }
    };

    // ==========================================================================
    // P1-005: Search Synonyms
    // Maps common payment terms to related words for better search
    // ==========================================================================

    const SEARCH_SYNONYMS = {
        // Account terms
        'account': ['iban', 'acct', 'bank account', 'acc'],
        'iban': ['account', 'account number', 'international bank account'],
        'closed': ['inactive', 'terminated', 'shut', 'cancelled', 'deactivated'],
        'blocked': ['frozen', 'suspended', 'locked', 'restricted', 'held'],

        // Amount terms
        'amount': ['sum', 'value', 'payment', 'funds', 'money'],
        'insufficient': ['not enough', 'low balance', 'short', 'lacking'],
        'limit': ['maximum', 'cap', 'threshold', 'ceiling', 'restriction'],
        'exceeded': ['over', 'surpassed', 'breached', 'above'],

        // Party/beneficiary terms
        'beneficiary': ['recipient', 'payee', 'creditor', 'receiver'],
        'creditor': ['beneficiary', 'recipient', 'payee', 'receiver'],
        'debtor': ['sender', 'payer', 'originator', 'remitter'],
        'sender': ['debtor', 'payer', 'originator', 'remitter'],

        // Routing terms
        'bic': ['swift', 'swift code', 'bank code', 'routing'],
        'swift': ['bic', 'swift code', 'bank identifier'],
        'routing': ['bic', 'swift', 'correspondent', 'intermediary'],
        'correspondent': ['intermediary', 'agent', 'routing bank'],

        // Status terms
        'rejected': ['declined', 'refused', 'failed', 'returned'],
        'failed': ['rejected', 'error', 'unsuccessful', 'declined'],
        'timeout': ['timed out', 'delay', 'slow', 'unresponsive'],
        'duplicate': ['already sent', 'repeat', 'double', 'existing'],

        // Regulatory terms
        'sanctions': ['ofac', 'blocked', 'restricted', 'compliance'],
        'aml': ['anti-money laundering', 'compliance', 'kyc'],
        'kyc': ['know your customer', 'verification', 'identity'],
        'regulatory': ['compliance', 'legal', 'requirement', 'rule'],

        // Technical terms
        'invalid': ['wrong', 'incorrect', 'bad', 'malformed'],
        'missing': ['absent', 'not provided', 'empty', 'blank'],
        'format': ['structure', 'syntax', 'layout', 'schema'],
        'xml': ['message', 'payload', 'document', 'file'],

        // Common abbreviations
        'ac': ['account'],
        'am': ['amount'],
        'ag': ['agent'],
        'be': ['beneficiary'],
        'rc': ['regulatory', 'compliance'],
        'ff': ['format', 'field'],
        'dt': ['date', 'time'],
        'md': ['mandate'],
        'du': ['duplicate'],
        'ts': ['technical', 'system'],
    };

    /**
     * Expand search query with synonyms
     * @param {string} query - Original search query
     * @returns {string} - Expanded query with synonyms
     */
    function expandQueryWithSynonyms(query) {
        if (!query) return query;

        const words = query.toLowerCase().split(/\s+/);
        const expandedWords = new Set(words);

        words.forEach(word => {
            // Add synonyms for this word
            if (SEARCH_SYNONYMS[word]) {
                SEARCH_SYNONYMS[word].forEach(syn => expandedWords.add(syn));
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

    /**
     * Generate contextual explanations for an error
     * @param {Object} error - The error object
     * @returns {Object} - { forOps: string, forDevs: string }
     */
    function generateExplanations(error) {
        const category = error.category || 'Other';
        const severity = error.severity === 'temporary' ? 'temporary' : 'fatal';

        // Get templates
        const opsTemplate = EXPLANATION_TEMPLATES.ops[category]?.[severity]
            || EXPLANATION_TEMPLATES.ops.Other[severity];
        const devTemplate = EXPLANATION_TEMPLATES.dev[category]?.[severity]
            || EXPLANATION_TEMPLATES.dev.Other[severity];

        // Build detail string from description
        const detail = error.description?.short || error.description?.detailed || error.name || 'error occurred';

        // Get first common cause if available
        const cause = error.common_causes?.[0] || 'See details above';

        // Get first fix step if available
        const fix = error.how_to_fix?.steps?.[0] || 'Contact your payment provider';

        // Replace placeholders
        const replacePlaceholders = (template) => {
            return template
                .replace(/{code}/g, error.code)
                .replace(/{name}/g, error.name || 'Unknown')
                .replace(/{detail}/g, detail.toLowerCase())
                .replace(/{cause}/g, cause)
                .replace(/{fix}/g, fix);
        };

        return {
            forOps: replacePlaceholders(opsTemplate),
            forDevs: replacePlaceholders(devTemplate)
        };
    }

    // DOM
    const searchInput = document.getElementById('search');
    const categoryFilter = document.getElementById('filterCategory');
    const severityFilter = document.getElementById('filterSeverity');
    const resultsContainer = document.getElementById('results');
    const resultCount = document.getElementById('resultCount');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const backToTop = document.getElementById('backToTop');

    // Initialize
    async function init() {
        try {
            const res = await fetch('./data/errors.json');
            const data = await res.json();
            errors = data.errors;

            fuse = new Fuse(errors, {
                keys: [
                    { name: 'code', weight: 2 },
                    { name: 'name', weight: 1.5 },
                    { name: 'description.short', weight: 1 },
                    { name: 'description.detailed', weight: 0.8 }
                ],
                threshold: 0.35,
                includeScore: true
            });

            render(errors);
            bindEvents();

            // P1-007: Check for shareable URL on load (e.g., #AC04)
            handleUrlHash();
            window.addEventListener('hashchange', handleUrlHash);
        } catch (e) {
            console.error(e);
            resultsContainer.innerHTML = '<div class="empty"><div class="empty-icon">⚠️</div><p>Failed to load. Refresh page.</p></div>';
        }
    }

    // P1-007: Shareable URLs - Handle URL hash
    function handleUrlHash() {
        const hash = window.location.hash.slice(1); // Remove #
        if (hash) {
            // Find error by code (case-insensitive)
            const error = errors.find(e => e.code.toUpperCase() === hash.toUpperCase());
            if (error) {
                showModal(error);
            } else {
                // If code not found, search for it
                searchInput.value = hash;
                search();
            }
        }
    }

    // Update URL with error code (without page reload)
    function setUrlHash(code) {
        if (code) {
            history.pushState(null, '', `#${code}`);
        }
    }

    // Clear URL hash
    function clearUrlHash() {
        history.pushState(null, '', window.location.pathname);
    }

    // Bind events
    function bindEvents() {
        searchInput.addEventListener('input', search);
        categoryFilter.addEventListener('change', search);
        severityFilter.addEventListener('change', search);
        closeModal.addEventListener('click', hideModal);
        modalOverlay.addEventListener('click', hideModal);
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') hideModal();
        });

        // Back to top button
        if (backToTop) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTop.classList.remove('hidden');
                } else {
                    backToTop.classList.add('hidden');
                }
            });

            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // Search and filter
    function search() {
        const query = searchInput.value.trim();
        const cat = categoryFilter.value;
        const sev = severityFilter.value;

        let results = errors;

        if (query) {
            // P1-005: Search with synonym expansion
            // First try exact query
            let exactResults = fuse.search(query);

            // If few results, expand with synonyms for better coverage
            if (exactResults.length < 5) {
                const expandedQuery = expandQueryWithSynonyms(query);
                if (expandedQuery !== query.toLowerCase()) {
                    const synonymResults = fuse.search(expandedQuery);

                    // Merge results, prioritizing exact matches
                    const seenCodes = new Set(exactResults.map(r => r.item.code));
                    synonymResults.forEach(r => {
                        if (!seenCodes.has(r.item.code)) {
                            exactResults.push(r);
                            seenCodes.add(r.item.code);
                        }
                    });
                }
            }

            results = exactResults.map(r => r.item);
        }

        if (cat) {
            results = results.filter(e => e.category === cat);
        }

        if (sev) {
            results = results.filter(e => e.severity === sev);
        }

        currentPage = 1; // Reset to first page on new search
        showAllMode = false; // Reset to paginated view on new search
        render(results);
    }

    // Store current filtered list for pagination
    let currentList = [];

    // Render results
    function render(list) {
        currentList = list;
        const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIdx = startIdx + ITEMS_PER_PAGE;
        const pageItems = showAllMode ? list : list.slice(startIdx, endIdx);

        resultCount.textContent = `${list.length} error${list.length !== 1 ? 's' : ''}`;

        if (list.length === 0) {
            resultsContainer.innerHTML = '<div class="empty"><div class="empty-icon">🔍</div><p>No errors found</p></div>';
            return;
        }

        const cardsHtml = pageItems.map(e => `
            <div class="error-card" data-code="${e.code}">
                <div class="error-card-header">
                    <span class="error-code">${e.code}</span>
                    <span class="error-name">${e.name}</span>
                </div>
                <p class="error-desc">${e.description.short}</p>
                <div class="error-tags">
                    <span class="tag tag-${e.severity}">${e.severity}</span>
                    <span class="tag">${e.category}</span>
                    ${e.message_types.slice(0, 2).map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
            </div>
        `).join('');

        // Pagination UI
        let paginationHtml = '';
        if (list.length > ITEMS_PER_PAGE) {
            if (showAllMode) {
                // Show "Back to Paginated" button when viewing all
                paginationHtml = `
                    <div class="pagination">
                        <span class="pagination-info">Showing all ${list.length} errors</span>
                        <button class="pagination-btn show-toggle" data-action="paginate">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 6h16M4 12h16M4 18h16"/>
                            </svg>
                            Paginate
                        </button>
                    </div>
                `;
            } else {
                // Show pagination controls with "Show All" button
                paginationHtml = `
                    <div class="pagination">
                        <button class="pagination-btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>
                        <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
                        <button class="pagination-btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                        <button class="pagination-btn show-toggle" data-action="showall">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 3h18v18H3z"/>
                            </svg>
                            Show All
                        </button>
                    </div>
                `;
            }
        }

        resultsContainer.innerHTML = cardsHtml + paginationHtml;

        // Click handlers for cards
        resultsContainer.querySelectorAll('.error-card').forEach(card => {
            card.addEventListener('click', () => {
                const err = errors.find(e => e.code === card.dataset.code);
                if (err) showModal(err);
            });
        });

        // Pagination handlers
        resultsContainer.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.page;
                if (action === 'prev' && currentPage > 1) {
                    currentPage--;
                    render(currentList);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (action === 'next' && currentPage < totalPages) {
                    currentPage++;
                    render(currentList);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });

        // Show All / Paginate toggle handler
        const toggleBtn = resultsContainer.querySelector('.show-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const action = toggleBtn.dataset.action;
                if (action === 'showall') {
                    showAllMode = true;
                } else {
                    showAllMode = false;
                    currentPage = 1;
                }
                render(currentList);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // Show modal
    function showModal(e) {
        // P1-007: Update URL for sharing
        setUrlHash(e.code);

        // Generate contextual explanations using template engine
        const explanations = generateExplanations(e);

        // Generate shareable URL
        const shareUrl = `${window.location.origin}${window.location.pathname}#${e.code}`;

        modalBody.innerHTML = `
            <div class="modal-header">
                <div class="modal-code">${e.code}</div>
                <div class="modal-name">${e.name}</div>
                <button class="share-btn" id="shareBtn" title="Copy link to clipboard">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    <span>Share</span>
                </button>
            </div>

            <div class="modal-section">
                <h3>Description</h3>
                <p>${e.description.detailed}</p>
            </div>

            <!-- Template-generated explanations (P1-002a) -->
            <div class="modal-section explanation-tabs">
                <div class="tabs-header">
                    <button class="tab-btn active" data-tab="ops">👤 For Operations</button>
                    <button class="tab-btn" data-tab="dev">💻 For Developers</button>
                </div>
                <div class="tab-content active" data-content="ops">
                    <p class="explanation-text">${explanations.forOps}</p>
                </div>
                <div class="tab-content" data-content="dev">
                    <p class="explanation-text">${explanations.forDevs}</p>
                </div>
            </div>

            ${e.common_causes.length ? `
                <div class="modal-section">
                    <h3>Common Causes</h3>
                    <ul>${e.common_causes.map(c => `<li>${c}</li>`).join('')}</ul>
                </div>
            ` : ''}

            ${e.how_to_fix.steps.length ? `
                <div class="modal-section">
                    <h3>How to Fix</h3>
                    <ul>${e.how_to_fix.steps.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>
            ` : ''}

            ${e.how_to_fix.prevention ? `
                <div class="modal-section">
                    <h3>Prevention</h3>
                    <p>${e.how_to_fix.prevention}</p>
                </div>
            ` : ''}

            ${e.xpath_locations.length ? `
                <div class="modal-section">
                    <h3>XPath Location</h3>
                    <div class="xpath">${e.xpath_locations[0]}</div>
                </div>
            ` : ''}

            <div class="modal-section">
                <h3>Applies To</h3>
                <div class="error-tags">
                    ${e.message_types.map(t => `<span class="tag">${t}</span>`).join('')}
                    ${e.market_practices.map(m => `<span class="tag">${m}</span>`).join('')}
                </div>
            </div>

            <div class="modal-section">
                <h3>Resources</h3>
                ${e.resources.map(r => `
                    <a href="${r.url}" target="_blank" rel="noopener" class="resource-link">
                        ${r.title}
                        <span class="resource-type">${r.type}</span>
                    </a>
                `).join('')}
            </div>
        `;

        // Tab switching logic
        const tabBtns = modalBody.querySelectorAll('.tab-btn');
        const tabContents = modalBody.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                modalBody.querySelector(`[data-content="${tab}"]`).classList.add('active');
            });
        });

        // P1-007: Share button click handler
        const shareBtn = modalBody.querySelector('#shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    shareBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Copied!</span>
                    `;
                    shareBtn.classList.add('copied');
                    setTimeout(() => {
                        shareBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            <span>Share</span>
                        `;
                        shareBtn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            });
        }

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Hide modal
    function hideModal() {
        // P1-007: Clear URL hash when closing modal
        clearUrlHash();
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Start
    init();
})();
