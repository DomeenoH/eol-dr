/**
 * Checklist Context Definition
 * Contains types, context creation, and hooks.
 * Provider is in ChecklistProvider.tsx to support Fast Refresh.
 */

import { createContext, useContext } from 'react';
import type { ChecklistData, ItemValue } from '../types/checklist-data';
import type { ProgressState, AppMode, CurrentPosition } from '../types/progress';

// ============================================================================
// Types
// ============================================================================

/**
 * Save status for the UI indicator
 */
export type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

/**
 * Dirty item key format: "sectionId/categoryId/itemId"
 */
export type DirtyItemKey = string;

/**
 * State managed by the context
 */
export interface ChecklistState {
  /** User-filled checklist data */
  checklistData: ChecklistData;
  /** Progress tracking state */
  progressState: ProgressState;
  /** Current save status */
  saveStatus: SaveStatus;
  /** Last save timestamp */
  lastSaved: Date | null;
  /** Error message if save failed */
  saveError: string | null;
  /** Whether storage is available */
  storageAvailable: boolean;
  /** Whether data has been loaded from storage */
  isLoaded: boolean;
  /** Set of dirty item keys that have been modified but not saved */
  dirtyItems: Set<DirtyItemKey>;
}

/**
 * Action types for the reducer
 */
export type ChecklistAction =
  | { type: 'SET_DATA'; payload: ChecklistData }
  | { type: 'UPDATE_ITEM'; payload: { sectionId: string; categoryId: string; itemId: string; value: ItemValue | ItemValue[] } }
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_CURRENT_CATEGORY'; payload: CurrentPosition }
  | { type: 'SET_SAVE_STATUS'; payload: { status: SaveStatus; error?: string | null } }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_STORAGE_AVAILABLE'; payload: boolean }
  | { type: 'SET_LOADED'; payload: boolean }
  | { type: 'CLEAR_DATA' }
  | { type: 'IMPORT_DATA'; payload: { data: ChecklistData; progress?: ProgressState } }
  | { type: 'MARK_DIRTY'; payload: { sectionId: string; categoryId: string; itemId: string } }
  | { type: 'CLEAR_DIRTY' };

/**
 * Context value interface
 */
export interface ChecklistContextValue {
  /** Current state */
  state: ChecklistState;
  /** Dispatch function for actions */
  dispatch: React.Dispatch<ChecklistAction>;
  /** Set complete checklist data */
  setData: (data: ChecklistData) => void;
  /** Update a single item value */
  updateItem: (sectionId: string, categoryId: string, itemId: string, value: ItemValue | ItemValue[]) => void;
  /** Switch between guided and free mode */
  setMode: (mode: AppMode) => void;
  /** Set current category position */
  setCurrentCategory: (position: CurrentPosition) => void;
  /** Navigate to next category */
  goToNextCategory: () => boolean;
  /** Navigate to previous category */
  goToPrevCategory: () => boolean;
  /** Clear all data */
  clearData: () => void;
  /** Import data from backup */
  importData: (data: ChecklistData, progress?: ProgressState) => void;
  /** Save all pending changes（手动保存） */
  saveAll: () => void;
  /** Check if item is dirty (has unsaved changes) */
  isItemDirty: (sectionId: string, categoryId: string, itemId: string) => boolean;
  /** Check if category has any dirty items */
  isCategoryDirty: (sectionId: string, categoryId: string) => boolean;
  /** Get all dirty items count */
  getDirtyItemsCount: () => number;
}

export interface ChecklistProviderProps {
  children: React.ReactNode;
  /** Optional initial data for testing */
  initialData?: ChecklistData;
  /** Optional initial progress for testing */
  initialProgress?: ProgressState;
  /** Optional storage service for testing */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storageServiceOverride?: any;
}

// ============================================================================
// Context
// ============================================================================

export const ChecklistContext = createContext<ChecklistContextValue | null>(null);

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access the checklist context
 * @throws Error if used outside of ChecklistProvider
 */
export function useChecklist(): ChecklistContextValue {
  const context = useContext(ChecklistContext);
  
  if (!context) {
    throw new Error('useChecklist must be used within a ChecklistProvider');
  }
  
  return context;
}

/**
 * Hook to access only the checklist data (for components that only need data)
 */
export function useChecklistData(): ChecklistData {
  const { state } = useChecklist();
  return state.checklistData;
}

/**
 * Hook to access only the progress state
 */
export function useProgress(): ProgressState {
  const { state } = useChecklist();
  return state.progressState;
}

/**
 * Hook to access save status with pending changes info
 */
export function useSaveStatus(): { 
  status: SaveStatus; 
  lastSaved: Date | null; 
  error: string | null;
  hasPendingChanges: boolean;
  pendingCount: number;
} {
  const { state, getDirtyItemsCount } = useChecklist();
  return {
    status: state.saveStatus,
    lastSaved: state.lastSaved,
    error: state.saveError,
    hasPendingChanges: state.dirtyItems.size > 0,
    pendingCount: getDirtyItemsCount(),
  };
}
