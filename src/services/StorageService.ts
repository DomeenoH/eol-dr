/**
 * StorageService
 * Service for managing local storage persistence of checklist data
 * 
 * Requirements: 3.1-3.5, 6.4-6.5
 * 
 * Error Handling:
 * - localStorage 不可用: isAvailable() 返回 false, 显示警告
 * - 存储空间不足: 捕获 QuotaExceededError, 显示警告
 * - 数据损坏: JSON.parse 失败, 提供重置选项
 */

import type { ChecklistData } from '../types/checklist-data';
import type { ProgressState } from '../types/progress';

/**
 * Storage keys used in localStorage
 */
const STORAGE_KEYS = {
  CHECKLIST_DATA: 'eol-checklist-data',
  PROGRESS_STATE: 'eol-checklist-progress',
} as const;

/**
 * Current data version for migration support
 */
const CURRENT_VERSION = '1.0.0';

/**
 * Custom error class for storage-related errors
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: 'QUOTA_EXCEEDED' | 'NOT_AVAILABLE' | 'PARSE_ERROR' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Interface for StorageService
 */
export interface IStorageService {
  save(data: ChecklistData): void;
  load(): ChecklistData | null;
  saveProgress(progress: ProgressState): void;
  loadProgress(): ProgressState | null;
  clear(): void;
  isAvailable(): boolean;
  getUsedSpace(): number;
}

/**
 * Check if an error is a QuotaExceededError
 */
function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException) {
    // Most browsers
    return error.name === 'QuotaExceededError' || 
           error.code === 22 || // Legacy code for QuotaExceededError
           // Firefox
           error.name === 'NS_ERROR_DOM_QUOTA_REACHED';
  }
  return false;
}

/**
 * StorageService implementation
 * Handles all localStorage operations with proper error handling
 */
class StorageService implements IStorageService {
  /**
   * Check if localStorage is available
   * Tests both existence and functionality
   * @returns true if localStorage is available and functional
   */
  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      
      // Test actual functionality with a test key
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Save checklist data to localStorage
   * @param data - ChecklistData to save
   * @throws StorageError if storage is not available or quota is exceeded
   */
  save(data: ChecklistData): void {
    if (!this.isAvailable()) {
      throw new StorageError(
        'localStorage is not available. Your data cannot be saved.',
        'NOT_AVAILABLE'
      );
    }

    try {
      // Update lastModified timestamp
      const dataToSave: ChecklistData = {
        ...data,
        version: CURRENT_VERSION,
        lastModified: new Date().toISOString(),
      };
      
      const serialized = JSON.stringify(dataToSave);
      window.localStorage.setItem(STORAGE_KEYS.CHECKLIST_DATA, serialized);
    } catch (error) {
      if (isQuotaExceededError(error)) {
        throw new StorageError(
          'Storage quota exceeded. Please export your data and clear some space.',
          'QUOTA_EXCEEDED'
        );
      }
      throw new StorageError(
        'Failed to save data to localStorage.',
        'UNKNOWN'
      );
    }
  }

  /**
   * Load checklist data from localStorage
   * @returns ChecklistData or null if no data exists
   * @throws StorageError if storage is not available or data is corrupted
   */
  load(): ChecklistData | null {
    if (!this.isAvailable()) {
      throw new StorageError(
        'localStorage is not available.',
        'NOT_AVAILABLE'
      );
    }

    try {
      const serialized = window.localStorage.getItem(STORAGE_KEYS.CHECKLIST_DATA);
      
      if (serialized === null) {
        return null;
      }
      
      const data = JSON.parse(serialized) as ChecklistData;
      
      // Basic validation
      if (!data || typeof data !== 'object') {
        throw new StorageError(
          'Stored data is corrupted. Please reset or import a backup.',
          'PARSE_ERROR'
        );
      }
      
      return data;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new StorageError(
          'Stored data is corrupted (invalid JSON). Please reset or import a backup.',
          'PARSE_ERROR'
        );
      }
      throw new StorageError(
        'Failed to load data from localStorage.',
        'UNKNOWN'
      );
    }
  }

  /**
   * Save progress state to localStorage
   * @param progress - ProgressState to save
   * @throws StorageError if storage is not available or quota is exceeded
   */
  saveProgress(progress: ProgressState): void {
    if (!this.isAvailable()) {
      throw new StorageError(
        'localStorage is not available. Your progress cannot be saved.',
        'NOT_AVAILABLE'
      );
    }

    try {
      // Update lastVisited timestamp
      const progressToSave: ProgressState = {
        ...progress,
        lastVisited: new Date().toISOString(),
      };
      
      const serialized = JSON.stringify(progressToSave);
      window.localStorage.setItem(STORAGE_KEYS.PROGRESS_STATE, serialized);
    } catch (error) {
      if (isQuotaExceededError(error)) {
        throw new StorageError(
          'Storage quota exceeded. Please export your data and clear some space.',
          'QUOTA_EXCEEDED'
        );
      }
      throw new StorageError(
        'Failed to save progress to localStorage.',
        'UNKNOWN'
      );
    }
  }

  /**
   * Load progress state from localStorage
   * @returns ProgressState or null if no progress exists
   * @throws StorageError if storage is not available or data is corrupted
   */
  loadProgress(): ProgressState | null {
    if (!this.isAvailable()) {
      throw new StorageError(
        'localStorage is not available.',
        'NOT_AVAILABLE'
      );
    }

    try {
      const serialized = window.localStorage.getItem(STORAGE_KEYS.PROGRESS_STATE);
      
      if (serialized === null) {
        return null;
      }
      
      const progress = JSON.parse(serialized) as ProgressState;
      
      // Basic validation
      if (!progress || typeof progress !== 'object') {
        throw new StorageError(
          'Stored progress is corrupted. Please reset or import a backup.',
          'PARSE_ERROR'
        );
      }
      
      return progress;
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new StorageError(
          'Stored progress is corrupted (invalid JSON). Please reset or import a backup.',
          'PARSE_ERROR'
        );
      }
      throw new StorageError(
        'Failed to load progress from localStorage.',
        'UNKNOWN'
      );
    }
  }

  /**
   * Clear all checklist data from localStorage
   * Implements Requirement 6.4: 提供"清除所有数据"功能
   */
  clear(): void {
    if (!this.isAvailable()) {
      // Silently return if storage is not available
      // Nothing to clear anyway
      return;
    }

    try {
      window.localStorage.removeItem(STORAGE_KEYS.CHECKLIST_DATA);
      window.localStorage.removeItem(STORAGE_KEYS.PROGRESS_STATE);
    } catch {
      // Silently fail - clearing is best effort
      // If we can't clear, the data will remain but that's acceptable
    }
  }

  /**
   * Get the approximate used space in bytes for checklist data
   * @returns Number of bytes used, or 0 if unable to calculate
   */
  getUsedSpace(): number {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      let totalSize = 0;
      
      const dataStr = window.localStorage.getItem(STORAGE_KEYS.CHECKLIST_DATA);
      if (dataStr) {
        // Each character in JavaScript is 2 bytes (UTF-16)
        totalSize += dataStr.length * 2;
      }
      
      const progressStr = window.localStorage.getItem(STORAGE_KEYS.PROGRESS_STATE);
      if (progressStr) {
        totalSize += progressStr.length * 2;
      }
      
      return totalSize;
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export class for testing
export { StorageService };

// Export storage keys for testing
export { STORAGE_KEYS };
