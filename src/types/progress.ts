/**
 * Progress State Types
 * Track user progress through the checklist
 */

/**
 * Status of a section or category
 */
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Application mode
 */
export type AppMode = 'guided' | 'free';

/**
 * Progress for a single category
 */
export interface CategoryProgress {
  /** Completion percentage (0-100) */
  progress: number;
  /** Current status */
  status: ProgressStatus;
  /** Number of filled items */
  filledItems: number;
  /** Total number of items */
  totalItems: number;
}

/**
 * Progress for a single section
 */
export interface SectionProgress {
  /** Completion percentage (0-100) */
  progress: number;
  /** Current status */
  status: ProgressStatus;
  /** Category progress keyed by category ID */
  categories: Record<string, CategoryProgress>;
}

/**
 * Current position in the checklist
 */
export interface CurrentPosition {
  /** Current section ID */
  sectionId: string;
  /** Current category ID */
  categoryId: string;
}

/**
 * Complete progress state
 */
export interface ProgressState {
  /** Overall completion percentage (0-100) */
  overall: number;
  /** Section progress keyed by section ID */
  sections: Record<string, SectionProgress>;
  /** Current position in the checklist */
  currentPosition: CurrentPosition;
  /** Current application mode */
  mode: AppMode;
  /** Last visited timestamp (ISO format) */
  lastVisited: string;
}
