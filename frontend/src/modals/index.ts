/**
 * Modal Components Index
 * 
 * Exports all modal components with their configurations and metadata.
 * This file provides a centralized export point for all modal-related
 * components including confirmation dialogs, detail views, and settings modals.
 */

// Main modal components
export { default as ConfirmationModal } from './ConfirmationModal';
export { default as AgentDetailsModal } from './AgentDetailsModal';
export { default as GoalDetailsModal } from './GoalDetailsModal';
export { default as MemoryDetailsModal } from './MemoryDetailsModal';
export { default as SocialDetailsModal } from './SocialDetailsModal';
export { default as SkillDetailsModal } from './SkillDetailsModal';
export { default as PerformanceDetailsModal } from './PerformanceDetailsModal';
export { default as SettingsModal } from './SettingsModal';
export { default as ErrorModal } from './ErrorModal';
export { default as SuccessModal } from './SuccessModal';
export { default as WarningModal } from './WarningModal';
export { default as InfoModal } from './InfoModal';

// Re-export types for convenience
export type {
  BaseModalProps,
  ModalContentVariant,
  ModalAction,
  ConfirmationModalProps,
  AgentDetailsModalProps,
  GoalDetailsModalProps,
  MemoryDetailsModalProps,
  SocialDetailsModalProps,
  SkillDetailsModalProps,
  PerformanceDetailsModalProps,
  SettingsModalProps,
  ErrorModalProps,
  SuccessModalProps,
  WarningModalProps,
  InfoModalProps,
  ModalState,
  ModalOpenAction,
  ModalCloseAction,
  ModalCloseAllAction,
  ModalSetGlobalAction,
  ModalClearGlobalAction,
  ModalConfig,
  ModalEventHandlers,
  ModalUtils,
  ModalAnimation,
  ModalPosition,
  ModalSizePresets,
  ModalTheme
} from '../types/modals';

// Component constants and utilities
export const MODAL_COMPONENTS = {
  CONFIRMATION: 'ConfirmationModal',
  AGENT_DETAILS: 'AgentDetailsModal',
  GOAL_DETAILS: 'GoalDetailsModal',
  MEMORY_DETAILS: 'MemoryDetailsModal',
  SOCIAL_DETAILS: 'SocialDetailsModal',
  SKILL_DETAILS: 'SkillDetailsModal',
  PERFORMANCE_DETAILS: 'PerformanceDetailsModal',
  SETTINGS: 'SettingsModal',
  ERROR: 'ErrorModal',
  SUCCESS: 'SuccessModal',
  WARNING: 'WarningModal',
  INFO: 'InfoModal',
} as const;

// Default modal configurations
export const DEFAULT_MODAL_SETTINGS = {
  animation: {
    type: 'fade' as const,
    duration: 300,
    easing: 'ease-in-out',
  },
  positioning: {
    vertical: 'center' as const,
    horizontal: 'center' as const,
  },
  backdrop: {
    invisible: false,
    onClick: 'close' as const, // 'close' | 'noop'
  },
  escapeKey: {
    enabled: true,
    action: 'close' as const, // 'close' | 'noop'
  },
  focus: {
    autoFocus: true,
    restoreFocus: true,
    trapFocus: true,
  },
  close: {
    onBackdropClick: true,
    onEscapeKey: true,
    showCloseButton: true,
  },
} as const;

// Modal size presets
export const MODAL_SIZES = {
  SMALL: { maxWidth: 'sm' as const, fullWidth: false },
  MEDIUM: { maxWidth: 'md' as const, fullWidth: false },
  LARGE: { maxWidth: 'lg' as const, fullWidth: true },
  FULLSCREEN: { maxWidth: 'xl' as const, fullWidth: true },
} as const;

// Modal animation presets
export const MODAL_ANIMATIONS = {
  FADE: { type: 'fade' as const, duration: 300, easing: 'ease-in-out' },
  SLIDE: { type: 'slide' as const, duration: 400, easing: 'ease-out' },
  ZOOM: { type: 'zoom' as const, duration: 250, easing: 'ease-in-out' },
  FLIP: { type: 'flip' as const, duration: 500, easing: 'ease-in-out' },
} as const;

// Modal positioning presets
export const MODAL_POSITIONS = {
  TOP_LEFT: { vertical: 'top' as const, horizontal: 'left' as const },
  TOP_CENTER: { vertical: 'top' as const, horizontal: 'center' as const },
  TOP_RIGHT: { vertical: 'top' as const, horizontal: 'right' as const },
  CENTER_LEFT: { vertical: 'center' as const, horizontal: 'left' as const },
  CENTER: { vertical: 'center' as const, horizontal: 'center' as const },
  CENTER_RIGHT: { vertical: 'center' as const, horizontal: 'right' as const },
  BOTTOM_LEFT: { vertical: 'bottom' as const, horizontal: 'left' as const },
  BOTTOM_CENTER: { vertical: 'bottom' as const, horizontal: 'center' as const },
  BOTTOM_RIGHT: { vertical: 'bottom' as const, horizontal: 'right' as const },
} as const;

// Modal validation patterns
export const MODAL_VALIDATION = {
  requiredProps: ['open', 'onClose'],
  optionalProps: ['title', 'maxWidth', 'fullWidth', 'disableBackdropClick'],
  validateTitle: (title?: string) => !title || title.length === 0 ? 'Modal title is required' : null,
  validateOnClose: (onClose?: () => void) => !onClose ? 'onClose handler is required' : null,
  validateMaxWidth: (maxWidth?: string) => {
    const validWidths = ['xs', 'sm', 'md', 'lg', 'xl'];
    return maxWidth && !validWidths.includes(maxWidth) ? `Invalid maxWidth: ${maxWidth}` : null;
  },
} as const;

// Modal utility functions
export const MODAL_UTILS = {
  generateId: () => `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  validateProps: (props: any) => {
    const errors: string[] = [];
    
    if (typeof props.open !== 'boolean') {
      errors.push('open prop must be a boolean');
    }
    
    if (typeof props.onClose !== 'function') {
      errors.push('onClose prop must be a function');
    }
    
    if (props.maxWidth && !['xs', 'sm', 'md', 'lg', 'xl'].includes(props.maxWidth)) {
      errors.push('maxWidth must be one of: xs, sm, md, lg, xl');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  getDefaultConfig: (variant: string) => {
    const baseConfig = {
      maxWidth: 'md' as const,
      fullWidth: false,
      persistent: false,
      disableBackdropClick: false,
      disableEscapeKeyDown: false,
      showCloseButton: true,
      closeOnEscape: true,
    };
    
    // Variant-specific configurations
    switch (variant) {
      case 'confirmation':
        return {
          ...baseConfig,
          maxWidth: 'sm' as const,
          persistent: true,
        };
      case 'error':
      case 'warning':
        return {
          ...baseConfig,
          maxWidth: 'sm' as const,
          persistent: true,
        };
      case 'settings':
        return {
          ...baseConfig,
          maxWidth: 'lg' as const,
          fullWidth: true,
        };
      default:
        return baseConfig;
    }
  },
  calculateZIndex: (modalId: string) => {
    // Simple z-index calculation based on modal ID
    const hash = modalId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 1300 + (hash % 100);
  },
  shouldCloseOnBackdrop: (event: React.MouseEvent, props: any) => {
    return !props.disableBackdropClick && event.target === event.currentTarget;
  },
} as const;

// Modal event handlers
export const MODAL_EVENTS = {
  onOpen: (modalId: string, props?: any) => {
    console.log(`Modal opened: ${modalId}`, props);
    // Focus management
    document.body.style.overflow = 'hidden';
  },
  onClose: (modalId: string, reason?: string) => {
    console.log(`Modal closed: ${modalId}`, reason);
    // Restore body overflow
    document.body.style.overflow = '';
  },
  onBeforeClose: (modalId: string) => {
    // Return false to prevent closing
    return true;
  },
  onAfterClose: (modalId: string) => {
    // Cleanup after modal closes
    console.log(`Modal after close: ${modalId}`);
  },
  onError: (modalId: string, error: Error) => {
    console.error(`Modal error: ${modalId}`, error);
  },
} as const;

// Modal theme integration
export const MODAL_THEME = {
  light: {
    backdrop: {
      color: 'rgba(0, 0, 0, 0.5)',
      opacity: 0.5,
      blur: 0,
    },
    content: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      padding: 24,
    },
    header: {
      backgroundColor: '#f5f5f5',
      color: '#333333',
      fontSize: '1.25rem',
      fontWeight: 600,
      padding: 16,
    },
    actions: {
      justifyContent: 'flex-end' as const,
      spacing: 8,
      padding: 16,
    },
  },
  dark: {
    backdrop: {
      color: 'rgba(255, 255, 255, 0.1)',
      opacity: 0.8,
      blur: 2,
    },
    content: {
      backgroundColor: '#1e1e1e',
      borderRadius: 8,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      padding: 24,
    },
    header: {
      backgroundColor: '#2d2d2d',
      color: '#ffffff',
      fontSize: '1.25rem',
      fontWeight: 600,
      padding: 16,
    },
    actions: {
      justifyContent: 'flex-end' as const,
      spacing: 8,
      padding: 16,
    },
  },
} as const;