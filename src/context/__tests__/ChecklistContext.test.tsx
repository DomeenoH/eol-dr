/**
 * ChecklistContext Unit Tests
 * 
 * Tests for the ChecklistContext provider and hooks
 * Requirements: 1.1-1.5, 3.1, 3.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import {
  ChecklistProvider,
  useChecklist,
  useChecklistData,
  useProgress,
  useSaveStatus,
} from '../index';
import type { ChecklistData } from '../../types/checklist-data';
import type { ProgressState } from '../../types/progress';
import type { IStorageService } from '../../services/StorageService';

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Create a mock storage service for testing
 */
function createMockStorageService(options: {
  isAvailable?: boolean;
  savedData?: ChecklistData | null;
  savedProgress?: ProgressState | null;
} = {}): IStorageService {
  const { isAvailable = true, savedData = null, savedProgress = null } = options;
  
  return {
    isAvailable: vi.fn().mockReturnValue(isAvailable),
    save: vi.fn(),
    load: vi.fn().mockReturnValue(savedData),
    saveProgress: vi.fn(),
    loadProgress: vi.fn().mockReturnValue(savedProgress),
    clear: vi.fn(),
    getUsedSpace: vi.fn().mockReturnValue(0),
  };
}

/**
 * Create test checklist data
 */
function createTestChecklistData(overrides: Partial<ChecklistData> = {}): ChecklistData {
  return {
    version: '1.0.0',
    lastModified: new Date().toISOString(),
    sections: {},
    ...overrides,
  };
}

/**
 * Create test progress state
 */
function createTestProgressState(overrides: Partial<ProgressState> = {}): ProgressState {
  return {
    overall: 0,
    sections: {},
    currentPosition: { sectionId: 'emergency-contacts', categoryId: 'contacts' },
    mode: 'guided',
    lastVisited: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Wrapper component for testing hooks
 */
function createWrapper(props: {
  initialData?: ChecklistData;
  initialProgress?: ProgressState;
  storageServiceOverride?: IStorageService;
} = {}) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ChecklistProvider
        initialData={props.initialData}
        initialProgress={props.initialProgress}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        storageServiceOverride={props.storageServiceOverride as any}
      >
        {children}
      </ChecklistProvider>
    );
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('ChecklistContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });
  
  describe('useChecklist hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useChecklist());
      }).toThrow('useChecklist must be used within a ChecklistProvider');
      
      consoleSpy.mockRestore();
    });
    
    it('should provide initial state', () => {
      const mockStorage = createMockStorageService();
      const initialData = createTestChecklistData();
      
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ 
          storageServiceOverride: mockStorage,
          initialData, // Provide initial data to avoid auto-save triggering
        }),
      });
      
      expect(result.current.state).toBeDefined();
      expect(result.current.state.checklistData).toBeDefined();
      expect(result.current.state.progressState).toBeDefined();
      expect(result.current.state.saveStatus).toBe('saved');
    });
    
    it('should provide action functions', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      expect(typeof result.current.setData).toBe('function');
      expect(typeof result.current.updateItem).toBe('function');
      expect(typeof result.current.setMode).toBe('function');
      expect(typeof result.current.setCurrentCategory).toBe('function');
      expect(typeof result.current.goToNextCategory).toBe('function');
      expect(typeof result.current.goToPrevCategory).toBe('function');
      expect(typeof result.current.clearData).toBe('function');
      expect(typeof result.current.importData).toBe('function');
      expect(typeof result.current.saveAll).toBe('function');
      expect(typeof result.current.isItemDirty).toBe('function');
      expect(typeof result.current.isCategoryDirty).toBe('function');
      expect(typeof result.current.getDirtyItemsCount).toBe('function');
    });
  });
  
  describe('SET_DATA action', () => {
    it('should update checklist data', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      const newData = createTestChecklistData({
        sections: {
          'tech': {
            categories: {
              'emails': {
                items: { 'email-1': 'test@example.com' },
              },
            },
          },
        },
      });
      
      act(() => {
        result.current.setData(newData);
      });
      
      expect(result.current.state.checklistData.sections).toEqual(newData.sections);
    });
    
    it('should recalculate progress when data changes', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      const newData = createTestChecklistData({
        sections: {
          'tech': {
            categories: {
              'emails': {
                items: { 'email-1': 'test@example.com' },
              },
            },
          },
        },
      });
      
      act(() => {
        result.current.setData(newData);
      });
      
      // Progress should be recalculated
      expect(result.current.state.progressState).toBeDefined();
    });
  });
  
  describe('UPDATE_ITEM action', () => {
    it('should update a single item value', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      act(() => {
        result.current.updateItem('tech', 'emails', 'email-1', 'test@example.com');
      });
      
      expect(
        result.current.state.checklistData.sections?.['tech']?.categories?.['emails']?.items?.['email-1']
      ).toBe('test@example.com');
    });
    
    it('should create nested structure if not exists', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      act(() => {
        result.current.updateItem('new-section', 'new-category', 'new-item', 'value');
      });
      
      expect(
        result.current.state.checklistData.sections?.['new-section']?.categories?.['new-category']?.items?.['new-item']
      ).toBe('value');
    });
    
    it('should update lastModified timestamp', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      const beforeUpdate = result.current.state.checklistData.lastModified;
      
      act(() => {
        result.current.updateItem('tech', 'emails', 'email-1', 'test@example.com');
      });
      
      const afterUpdate = result.current.state.checklistData.lastModified;
      expect(new Date(afterUpdate).getTime()).toBeGreaterThanOrEqual(new Date(beforeUpdate).getTime());
    });
    
    it('should handle array values for repeatable items', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      const arrayValue = ['value1', 'value2', 'value3'];
      
      act(() => {
        result.current.updateItem('tech', 'emails', 'email-list', arrayValue);
      });
      
      expect(
        result.current.state.checklistData.sections?.['tech']?.categories?.['emails']?.items?.['email-list']
      ).toEqual(arrayValue);
    });
  });
  
  describe('SET_MODE action', () => {
    it('should switch to free mode', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      act(() => {
        result.current.setMode('free');
      });
      
      expect(result.current.state.progressState.mode).toBe('free');
    });
    
    it('should switch to guided mode', () => {
      const mockStorage = createMockStorageService();
      const initialProgress = createTestProgressState({ mode: 'free' });
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({
          storageServiceOverride: mockStorage,
          initialData: createTestChecklistData(),
          initialProgress,
        }),
      });
      
      act(() => {
        result.current.setMode('guided');
      });
      
      expect(result.current.state.progressState.mode).toBe('guided');
    });
  });
  
  describe('SET_CURRENT_CATEGORY action', () => {
    it('should update current position', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      act(() => {
        result.current.setCurrentCategory({ sectionId: 'tech', categoryId: 'emails' });
      });
      
      expect(result.current.state.progressState.currentPosition).toEqual({
        sectionId: 'tech',
        categoryId: 'emails',
      });
    });
  });
  
  describe('Manual save and dirty tracking', () => {
    it('should track dirty items when updating', () => {
      const mockStorage = createMockStorageService();
      const initialData = createTestChecklistData();
      
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({
          storageServiceOverride: mockStorage,
          initialData,
        }),
      });
      
      // Update item
      act(() => {
        result.current.updateItem('tech', 'emails', 'email-1', 'test@example.com');
      });
      
      // Item should be marked as dirty
      expect(result.current.isItemDirty('tech', 'emails', 'email-1')).toBe(true);
      expect(result.current.getDirtyItemsCount()).toBe(1);
    });
    
    it('should not save automatically when updating items', async () => {
      const mockStorage = createMockStorageService();
      const initialData = createTestChecklistData();
      
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({
          storageServiceOverride: mockStorage,
          initialData,
        }),
      });
      
      // Update item
      act(() => {
        result.current.updateItem('tech', 'emails', 'email-1', 'test@example.com');
      });
      
      // Advance timers
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      
      // Save should NOT be called (no auto-save)
      expect(mockStorage.save).not.toHaveBeenCalled();
    });
    
    it('should save when saveAll is called', () => {
      const mockStorage = createMockStorageService();
      const initialData = createTestChecklistData();
      
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({
          storageServiceOverride: mockStorage,
          initialData,
        }),
      });
      
      // Update item
      act(() => {
        result.current.updateItem('tech', 'emails', 'email-1', 'test@example.com');
      });
      
      // Call saveAll
      act(() => {
        result.current.saveAll();
      });
      
      // Save should be called
      expect(mockStorage.save).toHaveBeenCalled();
      expect(mockStorage.saveProgress).toHaveBeenCalled();
    });
    
    it('should clear dirty items after saving', () => {
      const mockStorage = createMockStorageService();
      const initialData = createTestChecklistData();
      
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({
          storageServiceOverride: mockStorage,
          initialData,
        }),
      });
      
      // Update item
      act(() => {
        result.current.updateItem('tech', 'emails', 'email-1', 'test@example.com');
      });
      
      expect(result.current.getDirtyItemsCount()).toBe(1);
      
      // Save all
      act(() => {
        result.current.saveAll();
      });
      
      // Dirty items should be cleared
      expect(result.current.getDirtyItemsCount()).toBe(0);
      expect(result.current.isItemDirty('tech', 'emails', 'email-1')).toBe(false);
    });
    
    it('should track category dirty state', () => {
      const mockStorage = createMockStorageService();
      const initialData = createTestChecklistData();
      
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({
          storageServiceOverride: mockStorage,
          initialData,
        }),
      });
      
      // Update item
      act(() => {
        result.current.updateItem('tech', 'emails', 'email-1', 'test@example.com');
      });
      
      // Category should be marked as dirty
      expect(result.current.isCategoryDirty('tech', 'emails')).toBe(true);
      expect(result.current.isCategoryDirty('tech', 'passwords')).toBe(false);
    });
  });
  
  describe('CLEAR_DATA action', () => {
    it('should clear all data', () => {
      const mockStorage = createMockStorageService();
      const initialData = createTestChecklistData({
        sections: {
          'tech': {
            categories: {
              'emails': {
                items: { 'email-1': 'test@example.com' },
              },
            },
          },
        },
      });
      
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({
          storageServiceOverride: mockStorage,
          initialData,
        }),
      });
      
      act(() => {
        result.current.clearData();
      });
      
      expect(result.current.state.checklistData.sections).toEqual({});
      expect(mockStorage.clear).toHaveBeenCalled();
    });
  });
  
  describe('IMPORT_DATA action', () => {
    it('should import data and recalculate progress', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      const importedData = createTestChecklistData({
        sections: {
          'tech': {
            categories: {
              'emails': {
                items: { 'email-1': 'imported@example.com' },
              },
            },
          },
        },
      });
      
      act(() => {
        result.current.importData(importedData);
      });
      
      expect(result.current.state.checklistData.sections).toEqual(importedData.sections);
    });
    
    it('should import data with progress state', () => {
      const mockStorage = createMockStorageService();
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      const importedData = createTestChecklistData();
      const importedProgress = createTestProgressState({
        mode: 'free',
        currentPosition: { sectionId: 'input', categoryId: 'bank-accounts' },
      });
      
      act(() => {
        result.current.importData(importedData, importedProgress);
      });
      
      expect(result.current.state.progressState.mode).toBe('free');
      expect(result.current.state.progressState.currentPosition).toEqual({
        sectionId: 'input',
        categoryId: 'bank-accounts',
      });
    });
  });
  
  describe('saveAll', () => {
    it('should save immediately when called', async () => {
      const mockStorage = createMockStorageService();
      const initialData = createTestChecklistData();
      
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({
          storageServiceOverride: mockStorage,
          initialData,
        }),
      });
      
      act(() => {
        result.current.updateItem('tech', 'emails', 'email-1', 'test@example.com');
      });
      
      // saveAll immediately
      act(() => {
        result.current.saveAll();
      });
      
      // Save should be called immediately
      expect(mockStorage.save).toHaveBeenCalled();
    });
  });
  
  describe('Storage availability', () => {
    it('should handle unavailable storage gracefully', () => {
      const mockStorage = createMockStorageService({ isAvailable: false });
      
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      expect(result.current.state.storageAvailable).toBe(false);
    });
  });
  
  describe('Load saved data on mount', () => {
    it('should load saved data from storage', () => {
      const savedData = createTestChecklistData({
        sections: {
          'tech': {
            categories: {
              'emails': {
                items: { 'email-1': 'saved@example.com' },
              },
            },
          },
        },
      });
      
      const savedProgress = createTestProgressState({
        mode: 'free',
        currentPosition: { sectionId: 'tech', categoryId: 'emails' },
      });
      
      const mockStorage = createMockStorageService({
        savedData,
        savedProgress,
      });
      
      const { result } = renderHook(() => useChecklist(), {
        wrapper: createWrapper({ storageServiceOverride: mockStorage }),
      });
      
      expect(result.current.state.checklistData.sections).toEqual(savedData.sections);
      expect(result.current.state.progressState.mode).toBe('free');
    });
  });
});

describe('Convenience hooks', () => {
  it('useChecklistData should return checklist data', () => {
    const mockStorage = createMockStorageService();
    const initialData = createTestChecklistData({
      sections: { 'test': { categories: {} } },
    });
    
    const { result } = renderHook(() => useChecklistData(), {
      wrapper: createWrapper({
        storageServiceOverride: mockStorage,
        initialData,
      }),
    });
    
    expect(result.current.sections).toEqual({ 'test': { categories: {} } });
  });
  
  it('useProgress should return progress state', () => {
    const mockStorage = createMockStorageService();
    const initialProgress = createTestProgressState({ mode: 'free' });
    
    const { result } = renderHook(() => useProgress(), {
      wrapper: createWrapper({
        storageServiceOverride: mockStorage,
        initialData: createTestChecklistData(),
        initialProgress,
      }),
    });
    
    expect(result.current.mode).toBe('free');
  });
  
  it('useSaveStatus should return save status', () => {
    const mockStorage = createMockStorageService();
    const initialData = createTestChecklistData();
    
    const { result } = renderHook(() => useSaveStatus(), {
      wrapper: createWrapper({ 
        storageServiceOverride: mockStorage,
        initialData, // Provide initial data to avoid auto-save triggering
      }),
    });
    
    expect(result.current.status).toBe('saved');
    expect(result.current.error).toBeNull();
  });
});
