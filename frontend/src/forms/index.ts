/**
 * Forms Components Index
 * 
 * Exports all form components for easy importing and usage.
 * This file provides a centralized export point for all form-related
 * components including goal creation, agent configuration, settings, and data input forms.
 */

// Main form components
export { default as GoalCreationForm } from './GoalCreationForm';
export { default as AgentConfigurationForm } from './AgentConfigurationForm';
export { default as SettingsForm } from './SettingsForm';
export { default as DataInputForm } from './DataInputForm';
export { default as FilterForm } from './FilterForm';
export { default as SearchForm } from './SearchForm';

// Re-export types for convenience
export type {
  GoalFormData,
  AgentConfigurationData,
  SettingsFormData,
  DataInputFormData,
  FilterFormData,
  SearchFormData,
  FormValidationErrors,
  FormSubmitResult,
  FormFieldConfig,
} from '../types/forms';

// Component constants and utilities
export const FORM_COMPONENTS = {
  GOAL_CREATION: 'GoalCreationForm',
  AGENT_CONFIGURATION: 'AgentConfigurationForm',
  SETTINGS: 'SettingsForm',
  DATA_INPUT: 'DataInputForm',
  FILTER: 'FilterForm',
  SEARCH: 'SearchForm',
} as const;

// Default form configurations
export const DEFAULT_FORM_SETTINGS = {
  validation: {
    enabled: true,
    realtime: true,
    showErrorSummary: true,
    focusFirstError: true,
  },
  submission: {
    autoSave: false,
    confirmOnSubmit: true,
    resetOnSubmit: false,
    showProgress: true,
  },
  ui: {
    variant: 'outlined' as const,
    size: 'medium' as const,
    fullWidth: true,
    spacing: 2,
  },
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  required: (value: any) => !!value || 'This field is required',
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address',
  minLength: (min: number) => (value: string) => 
    value.length >= min || `Must be at least ${min} characters`,
  maxLength: (max: number) => (value: string) => 
    value.length <= max || `Must be no more than ${max} characters`,
  number: (value: any) => !isNaN(Number(value)) || 'Must be a valid number',
  positive: (value: number) => value > 0 || 'Must be greater than 0',
  range: (min: number, max: number) => (value: number) => 
    (value >= min && value <= max) || `Must be between ${min} and ${max}`,
} as const;

// Form field types
export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  EMAIL: 'email',
  PASSWORD: 'password',
  SELECT: 'select',
  MULTI_SELECT: 'multi-select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SWITCH: 'switch',
  SLIDER: 'slider',
  DATE: 'date',
  TIME: 'time',
  DATETIME: 'datetime',
  FILE: 'file',
  TEXTAREA: 'textarea',
} as const;

// Accessibility defaults
export const DEFAULT_ACCESSIBILITY_PROPS = {
  ariaLabel: 'Form',
  role: 'form',
  keyboardNavigation: true,
  screenReaderEnabled: true,
  focusIndicator: true,
  highContrast: false,
  reducedMotion: false,
} as const;