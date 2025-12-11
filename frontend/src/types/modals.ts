/**
 * Modal Types and Interfaces
 * 
 * Comprehensive type definitions for all modal components used in the
 * Mindcraft LangGraph frontend dashboard.
 */

// Base modal props interface
export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  loading?: boolean;
  persistent?: boolean;
}

// Modal content variants
export type ModalContentVariant = 
  | 'agent-details'
  | 'goal-details'
  | 'memory-details'
  | 'social-details'
  | 'skill-details'
  | 'performance-details'
  | 'confirmation'
  | 'settings'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

// Modal action types
export interface ModalAction {
  id: string;
  label: string;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void | Promise<void>;
  icon?: React.ReactNode;
}

// Confirmation modal props
export interface ConfirmationModalProps extends BaseModalProps {
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'error' | 'warning';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  severity?: 'info' | 'warning' | 'error' | 'success';
  showIcon?: boolean;
}

// Agent details modal props
export interface AgentDetailsModalProps extends BaseModalProps {
  agentId: string;
  agent?: any; // Agent state from Redux
  onEdit?: (agent: any) => void;
  onDelete?: (agentId: string) => void;
  onExport?: (agent: any) => void;
  showActions?: boolean;
  activeTab?: 'overview' | 'personality' | 'goals' | 'memory' | 'social' | 'skills' | 'performance';
}

// Goal details modal props
export interface GoalDetailsModalProps extends BaseModalProps {
  goalId: string;
  goal?: any; // Goal state from Redux
  onEdit?: (goal: any) => void;
  onDelete?: (goalId: string) => void;
  onComplete?: (goalId: string) => void;
  onPause?: (goalId: string) => void;
  onResume?: (goalId: string) => void;
  showActions?: boolean;
  showProgress?: boolean;
  showDependencies?: boolean;
}

// Memory details modal props
export interface MemoryDetailsModalProps extends BaseModalProps {
  memoryId: string;
  memory?: any; // Memory state from Redux
  memoryType?: 'semantic' | 'episodic' | 'procedural' | 'working';
  onEdit?: (memory: any) => void;
  onDelete?: (memoryId: string) => void;
  onExport?: (memory: any) => void;
  showVisualization?: boolean;
  showConnections?: boolean;
}

// Social details modal props
export interface SocialDetailsModalProps extends BaseModalProps {
  entityId: string;
  entityType?: 'agent' | 'relationship' | 'interaction';
  entity?: any; // Social entity from Redux
  onEdit?: (entity: any) => void;
  onDelete?: (entityId: string) => void;
  onSendMessage?: (entityId: string, message: string) => void;
  showRelationshipGraph?: boolean;
  showInteractionHistory?: boolean;
}

// Skill details modal props
export interface SkillDetailsModalProps extends BaseModalProps {
  skillId: string;
  skill?: any; // Skill state from Redux
  onEdit?: (skill: any) => void;
  onPractice?: (skillId: string) => void;
  onSpecialize?: (skillId: string, specialization: string) => void;
  showProgress?: boolean;
  showSynergies?: boolean;
  showMilestones?: boolean;
}

// Performance details modal props
export interface PerformanceDetailsModalProps extends BaseModalProps {
  agentId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  metrics?: any; // Performance metrics from Redux
  onExport?: (metrics: any) => void;
  onRefresh?: () => void;
  showCharts?: boolean;
  showAnomalies?: boolean;
  showRecommendations?: boolean;
}

// Settings modal props
export interface SettingsModalProps extends BaseModalProps {
  settings?: any; // Settings from Redux
  onSave?: (settings: any) => void;
  onReset?: () => void;
  onExport?: (settings: any) => void;
  onImport?: (settings: any) => void;
  activeSection?: 'general' | 'dashboard' | 'notifications' | 'appearance' | 'advanced';
}

// Error modal props
export interface ErrorModalProps extends BaseModalProps {
  error: Error | string;
  onRetry?: () => void;
  onReport?: (error: Error | string) => void;
  showDetails?: boolean;
  technicalDetails?: string;
}

// Success modal props
export interface SuccessModalProps extends BaseModalProps {
  message: string;
  description?: string;
  onContinue?: () => void;
  onUndo?: () => void;
  showDetails?: boolean;
  details?: any;
}

// Warning modal props
export interface WarningModalProps extends BaseModalProps {
  message: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showIcon?: boolean;
}

// Info modal props
export interface InfoModalProps extends BaseModalProps {
  message: string;
  description?: string;
  onAcknowledge?: () => void;
  showDetails?: boolean;
  details?: any;
  learnMore?: string;
}

// Modal state management
export interface ModalState {
  openModals: {
    [key: string]: {
      open: boolean;
      props?: any;
      variant: ModalContentVariant;
    };
  };
  modalHistory: Array<{
    id: string;
    variant: ModalContentVariant;
    openedAt: number;
    closedAt?: number;
    duration?: number;
  }>;
  globalModal: {
    open: boolean;
    variant: ModalContentVariant;
    props?: any;
  };
}

// Modal action types for Redux
export interface ModalOpenAction {
  type: 'modal/open';
  payload: {
    id: string;
    variant: ModalContentVariant;
    props?: any;
  };
}

export interface ModalCloseAction {
  type: 'modal/close';
  payload: {
    id: string;
  reason?: 'user' | 'system' | 'timeout';
  };
}

export interface ModalCloseAllAction {
  type: 'modal/closeAll';
}

export interface ModalSetGlobalAction {
  type: 'modal/setGlobal';
  payload: {
    variant: ModalContentVariant;
    props?: any;
  };
}

export interface ModalClearGlobalAction {
  type: 'modal/clearGlobal';
}

// Modal configuration
export interface ModalConfig {
  id: string;
  variant: ModalContentVariant;
  title: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  persistent?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  backdropProps?: any;
  paperProps?: any;
  transitionDuration?: number;
  autoFocus?: boolean;
  restoreFocus?: boolean;
}

// Modal event handlers
export interface ModalEventHandlers {
  onOpen?: (modalId: string, props?: any) => void;
  onClose?: (modalId: string, reason?: string) => void;
  onBeforeClose?: (modalId: string) => boolean | Promise<boolean>;
  onAfterClose?: (modalId: string) => void;
  onError?: (modalId: string, error: Error) => void;
}

// Modal utilities
export interface ModalUtils {
  generateId: () => string;
  validateProps: (props: BaseModalProps) => boolean;
  getDefaultConfig: (variant: ModalContentVariant) => ModalConfig;
  calculateZIndex: (modalId: string) => number;
  shouldCloseOnBackdrop: (event: React.MouseEvent, props: BaseModalProps) => boolean;
}

// Modal animation types
export interface ModalAnimation {
  type: 'fade' | 'slide' | 'zoom' | 'flip';
  duration: number;
  easing: string;
  delay?: number;
}

// Modal positioning
export interface ModalPosition {
  vertical: 'top' | 'center' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

// Modal size presets
export interface ModalSizePresets {
  small: { maxWidth: 'sm'; fullWidth: false };
  medium: { maxWidth: 'md'; fullWidth: false };
  large: { maxWidth: 'lg'; fullWidth: true };
  fullscreen: { maxWidth: 'xl'; fullWidth: true };
}

// Modal theme integration
export interface ModalTheme {
  backdrop: {
    color: string;
    opacity: number;
    blur: number;
  };
  content: {
    backgroundColor: string;
    borderRadius: number;
    boxShadow: string;
    padding: number;
  };
  header: {
    backgroundColor: string;
    color: string;
    fontSize: string;
    fontWeight: number;
    padding: number;
  };
  actions: {
    justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between';
    spacing: number;
    padding: number;
  };
}