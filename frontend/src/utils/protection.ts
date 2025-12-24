/**
 * Runtime Protection Module
 *
 * Adds anti-tampering and anti-debugging protection to the application.
 * This module should be imported early in the application lifecycle.
 */

// Protection state
let protectionInitialized = false;

/**
 * Detect if browser developer tools are open
 */
function detectDevTools(): boolean {
  // Method 1: Window size difference check
  const widthThreshold = 160;
  const heightThreshold = 160;

  if (typeof window !== 'undefined') {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > widthThreshold || heightDiff > heightThreshold) {
      return true;
    }
  }

  // Method 2: Performance timing
  const start = performance.now();
  // eslint-disable-next-line no-debugger
  debugger;
  if (performance.now() - start > 100) {
    return true;
  }

  return false;
}

/**
 * Detect browser automation/scraping tools
 */
function detectAutomation(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const win = window as unknown as Record<string, unknown>;
  const doc = document as unknown as Record<string, unknown>;
  const nav = navigator as unknown as Record<string, unknown>;

  const checks = [
    // Selenium
    !!win.webdriver,
    !!doc.__selenium_unwrapped,
    !!doc.__webdriver_evaluate,

    // Puppeteer/Playwright
    !!nav.webdriver,

    // PhantomJS
    !!win.callPhantom,
    !!win._phantom,

    // Headless browser detection
    /HeadlessChrome/.test(navigator.userAgent),

    // Generic automation
    !!win.domAutomation,
  ];

  return checks.some(Boolean);
}

/**
 * Disable right-click context menu (optional protection)
 */
export function disableContextMenu(): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('contextmenu', (e) => {
    // Allow in development mode
    if (import.meta.env.DEV) return;
    e.preventDefault();
  });
}

/**
 * Disable keyboard shortcuts for DevTools
 */
function disableDevToolsShortcuts(): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('keydown', (e) => {
    // Allow in development mode
    if (import.meta.env.DEV) return;

    // F12
    if (e.key === 'F12') {
      e.preventDefault();
    }

    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
    }

    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
    }

    // Cmd+Option+I (Mac DevTools)
    if (e.metaKey && e.altKey && e.key === 'i') {
      e.preventDefault();
    }
  });
}

/**
 * Monitor for DevTools opening
 */
function startDevToolsMonitor(): void {
  if (typeof window === 'undefined') return;
  if (import.meta.env.DEV) return;

  const checkInterval = 2000 + Math.random() * 3000;

  const monitor = () => {
    if (detectDevTools()) {
      // DevTools detected - could log or take action
      // For now, just a silent detection
    }
    setTimeout(monitor, checkInterval);
  };

  setTimeout(monitor, checkInterval);
}

/**
 * Anti-copy protection for text content
 */
function setupCopyProtection(): void {
  if (typeof document === 'undefined') return;
  if (import.meta.env.DEV) return;

  // Disable text selection on protected elements
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    if (target?.dataset?.protected === 'true') {
      e.preventDefault();
    }
  });

  // Intercept copy events
  document.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString();

    // Add watermark to copied text
    const watermark = '\n\n[Copied from MX Error Guide - https://mx-error-guide.pages.dev]';

    e.clipboardData?.setData('text/plain', selectedText + watermark);
    e.preventDefault();
  });
}

/**
 * Protect against iframe embedding (clickjacking)
 */
function preventFraming(): void {
  if (typeof window === 'undefined') return;

  // Check if we're in an iframe
  if (window.self !== window.top) {
    // Try to break out of frame
    try {
      if (window.top) {
        window.top.location.href = window.self.location.href;
      }
    } catch {
      // Cross-origin frame - hide content
      document.body.innerHTML =
        '<h1>This content cannot be displayed in a frame.</h1>';
    }
  }
}

/**
 * Generate browser fingerprint for tracking
 */
export function generateFingerprint(): string {
  const components: string[] = [];

  if (typeof navigator !== 'undefined') {
    components.push(navigator.userAgent);
    components.push(navigator.language);
    components.push(String(navigator.hardwareConcurrency || 0));
    components.push(navigator.platform);
  }

  if (typeof screen !== 'undefined') {
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  }

  // Simple hash
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}

/**
 * Initialize all protection measures
 */
export function initializeProtection(): void {
  if (protectionInitialized) return;

  // Only enable protection in production
  if (import.meta.env.DEV) {
    protectionInitialized = true;
    return;
  }

  try {
    // Framing protection
    preventFraming();

    // DevTools protection
    disableDevToolsShortcuts();
    startDevToolsMonitor();

    // Copy protection
    setupCopyProtection();

    // Context menu (optional - can be annoying for users)
    // disableContextMenu();

    // Automation detection
    if (detectAutomation()) {
      // Log or report automation detection
      // Silent for now
    }

    protectionInitialized = true;
  } catch {
    // Silent fail - don't break the app
    protectionInitialized = true;
  }
}

/**
 * Report suspicious activity (optional)
 */
export function reportSuspiciousActivity(_type: string, _details: string): void {
  if (import.meta.env.DEV) return;

  // Could send to analytics or logging service
  // For now, just console (which is stripped in production anyway)
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Delay initialization to not block rendering
  setTimeout(initializeProtection, 1000);
}

export default {
  initializeProtection,
  generateFingerprint,
  detectDevTools,
  detectAutomation,
};
