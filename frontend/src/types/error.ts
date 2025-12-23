export interface ErrorDescription {
  short: string;
  detailed: string;
}

export interface HowToFix {
  steps: string[];
  prevention: string;
}

export interface Resource {
  title: string;
  url: string;
  type: string;
}

export interface PaymentError {
  code: string;
  name: string;
  description: ErrorDescription;
  category: ErrorCategory;
  severity: ErrorSeverity;
  common_causes: string[];
  how_to_fix: HowToFix;
  xpath_locations: string[];
  message_types: string[];
  market_practices: string[];
  resources: Resource[];
}

export type ErrorCategory =
  | 'Account'
  | 'Amount'
  | 'Party'
  | 'Routing'
  | 'Regulatory'
  | 'System'
  | 'Mandate'
  | 'Duplicate'
  | 'Cancellation'
  | 'Narrative'
  | 'Other';

export type ErrorSeverity = 'fatal' | 'temporary';

export interface ErrorsData {
  version: string;
  generated: string;
  total_errors: number;
  errors: PaymentError[];
}

export interface FilterState {
  category: ErrorCategory | '';
  severity: ErrorSeverity | '';
}
