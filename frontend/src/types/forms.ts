/**
 * Form Types for Mindcraft Frontend
 * 
 * Comprehensive type definitions for all form components including
 * goal creation, agent configuration, settings, and data input forms.
 */

// Basic form field types
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'multi-select' | 
        'checkbox' | 'radio' | 'switch' | 'slider' | 'date' | 'time' | 
        'datetime' | 'file' | 'textarea';
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ value: any; label: string }>;
  validation?: ValidationRule[];
  disabled?: boolean;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'number' | 
        'positive' | 'range' | 'pattern' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => string | null;
}

export interface FormValidationErrors {
  [fieldName: string]: string | null;
}

// Goal creation form types
export interface GoalFormData {
  description: string;
  type: 'strategic' | 'tactical' | 'operational';
  priority: 0 | 1 | 2 | 3; // CRITICAL | HIGH | MEDIUM | LOW
  status: 'pending' | 'active' | 'in_progress' | 'completed' | 
         'failed' | 'paused' | 'cancelled';
  parentGoalId?: string;
  dependencies: string[];
  resourceRequirements: Array<{
    type: string;
    amount: number;
    available: number;
    unit: string;
    status: 'available' | 'allocated' | 'in_use' | 'depleted';
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  milestones: Array<{
    id: string;
    name: string;
    targetValue: number;
    currentValue: number;
    completed: boolean;
    completedAt?: number;
    dependencies: string[];
    dueDate?: number;
    tags: string[];
    createdAt: number;
  }>;
  targetValue: number;
  estimatedDuration: number; // hours
  tags: string[];
  notes: string;
}

// Agent configuration form types
export interface AgentConfigurationData {
  id: string;
  name: string;
  profileType: 'default' | 'custom' | 'template';
  personality: {
    openness: number; // 0-1
    conscientiousness: number; // 0-1
    extraversion: number; // 0-1
    agreeableness: number; // 0-1
    neuroticism: number; // 0-1
    riskTolerance: number; // 0-1
    creativity: number; // 0-1
    patience: number; // 0-1
    competitiveness: number; // 0-1
    curiosity: number; // 0-1
  };
  motivations: {
    primary: string;
    secondary: string[];
    drives: Array<{
      type: string;
      strength: number; // 0-1
      satisfaction: number; // 0-1
    }>;
  };
  values: Array<{
    name: string;
    priority: number; // 0-1
    weight: number; // 0-1
  }>;
  ethics: {
    harmAvoidance: number; // 0-1
    fairness: number; // 0-1
    loyalty: number; // 0-1
    authority: number; // 0-1
    purity: number; // 0-1
  };
  behavior: {
    adaptationRate: number; // 0-1
    decisionTimeLimit: number; // milliseconds
    errorTolerance: number; // 0-1
    explorationTendency: number; // 0-1
    socialEngagement: number; // 0-1
  };
  skills: {
    enabled: string[];
    disabled: string[];
    preferences: Array<{
      skill: string;
      priority: number; // 0-1
    }>;
  };
  memory: {
    retentionPeriod: number; // days
    consolidationInterval: number; // hours
    maxEpisodicEvents: number;
    maxSemanticConcepts: number;
  };
}

// Settings form types
export interface SettingsFormData {
  general: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  dashboard: {
    refreshRate: number; // milliseconds
    autoRefresh: boolean;
    showAnimations: boolean;
    compactMode: boolean;
    defaultTab: string;
  };
  notifications: {
    enabled: boolean;
    email: boolean;
    push: boolean;
    thresholds: {
      cognitiveLoad: number; // 0-1
      responseTime: number; // milliseconds
      successRate: number; // 0-1
      memoryUsage: number; // 0-1
    };
  };
  performance: {
    enableCaching: boolean;
    maxCacheSize: number;
    enableCompression: boolean;
    enableVirtualization: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
  advanced: {
    debugMode: boolean;
    verboseLogging: boolean;
    experimentalFeatures: boolean;
    dataCollection: boolean;
  };
}

// Data input form types
export interface DataInputFormData {
  source: 'manual' | 'file' | 'api' | 'database';
  dataType: 'goals' | 'agents' | 'performance' | 'memory' | 'social' | 'skills';
  format: 'json' | 'csv' | 'xml' | 'yaml';
  data: any;
  mapping: Record<string, string>; // field mapping for imports
  validation: {
    strictMode: boolean;
    skipInvalid: boolean;
    reportErrors: boolean;
  };
  processing: {
    batchSize: number;
    parallelProcessing: boolean;
    progressReporting: boolean;
  };
}

// Filter form types
export interface FilterFormData {
  search: string;
  categories: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: string[];
  priority: string[];
  tags: string[];
  agents: string[];
  customFilters: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
    value: any;
  }>;
}

// Search form types
export interface SearchFormData {
  query: string;
  scope: 'all' | 'goals' | 'agents' | 'memory' | 'social' | 'skills' | 'performance';
  filters: FilterFormData;
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Form submission and validation
export interface FormSubmitResult<T = any> {
  success: boolean;
  data?: T;
  errors?: FormValidationErrors;
  warnings?: string[];
  message?: string;
}

export interface FormState<T = any> {
  data: T;
  errors: FormValidationErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// Form component props
export interface BaseFormProps<T = any> {
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<FormSubmitResult<T>>;
  onCancel?: () => void;
  onValidate?: (data: T, errors: FormValidationErrors) => void;
  onChange?: (data: T, fieldName: string, value: any) => void;
  disabled?: boolean;
  loading?: boolean;
  validation?: {
    realtime?: boolean;
    showErrorSummary?: boolean;
    focusFirstError?: boolean;
  };
  ui?: {
    variant?: 'outlined' | 'filled' | 'standard';
    size?: 'small' | 'medium' | 'large';
    spacing?: number;
    fullWidth?: boolean;
  };
}

// Form field component props
export interface FormFieldProps extends FormFieldConfig {
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  sx?: any;
}

// Form builder types
export interface FormBuilderConfig {
  fields: FormFieldConfig[];
  layout: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  spacing?: number;
  sections?: Array<{
    title: string;
    fields: string[]; // field names
    collapsible?: boolean;
    defaultExpanded?: boolean;
  }>;
}

export interface FormBuilderProps extends BaseFormProps {
  config: FormBuilderConfig;
  autoSave?: boolean;
  autoSaveDelay?: number; // milliseconds
}

// Form validation utilities
export interface ValidationPattern {
  name: string;
  pattern: RegExp;
  message: string;
}

export interface FormValidationConfig {
  patterns: ValidationPattern[];
  customValidators: Record<string, (value: any) => string | null>;
  asyncValidators: Record<string, (value: any) => Promise<string | null>>;
}

// Form accessibility
export interface FormAccessibilityProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  keyboardNavigation?: boolean;
  screenReaderEnabled?: boolean;
  focusIndicator?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
}

// Form theme and styling
export interface FormTheme {
  palette: {
    primary: string;
    secondary: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    divider: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
  };
  spacing: {
    unit: string;
    scale: number[];
  };
  shape: {
    borderRadius: string;
    borderWidth: string;
  };
}

// Form events
export interface FormEventHandlers {
  onSubmit: (data: any, event: React.FormEvent) => void | Promise<void>;
  onChange: (fieldName: string, value: any, event: React.ChangeEvent) => void;
  onBlur: (fieldName: string, event: React.FocusEvent) => void;
  onFocus: (fieldName: string, event: React.FocusEvent) => void;
  onReset: (event: React.FormEvent) => void;
  onKeyPress: (fieldName: string, event: React.KeyboardEvent) => void;
}

// Form utilities
export interface FormUtils {
  validateField: (field: FormFieldConfig, value: any) => string | null;
  validateForm: (fields: FormFieldConfig[], data: any) => FormValidationErrors;
  sanitizeData: (data: any) => any;
  serializeData: (data: any) => string;
  deserializeData: (data: string) => any;
  compareData: (data1: any, data2: any) => boolean;
  mergeData: (target: any, source: any) => any;
  cloneData: (data: any) => any;
}