/**
 * Property-Based Tests for ChecklistContext Manual Save
 * 
 * **Validates: Requirements 3.1**
 * 
 * Property 3: Manual Save with Dirty State Tracking
 * ∀ data changes d, dirty state is tracked until manual save
 * 
 * - For any form field modification, the item is marked as dirty.
 * - No automatic save occurs (manual save only).
 * - When saveAll is called, all dirty items are cleared.
 * - The saved data reflects all modifications.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import React from 'react';
import { ChecklistProvider, useChecklist } from '../ChecklistContext';
import type { ChecklistData } from '../../types/checklist-data';
import type { ProgressState } from '../../types/progress';
import type { IStorageService } from '../../services/StorageService';

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Interface for mock storage with tracking capabilities
 */
interface MockStorageService extends IStorageService {
  saveCalls: Array<{ data: ChecklistData; timestamp: number }>;
  progressSaveCalls: Array<{ progress: ProgressState; timestamp: number }>;
  saveCallCount: () => number;
  progressSaveCallCount: () => number;
}

/**
 * Create a mock storage service that tracks save calls with timestamps
 * Each call creates a fresh instance to avoid state leakage between test iterations
 */
function createMockStorageService(): MockStorageService {
  const saveCalls: Array<{ data: ChecklistData; timestamp: number }> = [];
  const progressSaveCalls: Array<{ progress: ProgressState; timestamp: number }> = [];
  
  return {
    saveCalls,
    progressSaveCalls,
    saveCallCount: () => saveCalls.length,
    progressSaveCallCount: () => progressSaveCalls.length,
    isAvailable: () => true,
    save: (data: ChecklistData) => {
      saveCalls.push({ data: JSON.parse(JSON.stringify(data)), timestamp: Date.now() });
    },
    load: () => null,
    saveProgress: (progress: ProgressState) => {
      progressSaveCalls.push({ progress: JSON.parse(JSON.stringify(progress)), timestamp: Date.now() });
    },
    loadProgress: () => null,
    clear: () => {},
    getUsedSpace: () => 0,
  };
}

/**
 * Create initial empty checklist data
 */
function createEmptyChecklistData(): ChecklistData {
  return {
    version: '1.0.0',
    lastModified: new Date().toISOString(),
    sections: {},
  };
}

/**
 * Wrapper component for testing hooks
 */
function createWrapper(storageService: IStorageService, initialData: ChecklistData) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ChecklistProvider
        initialData={initialData}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        storageServiceOverride={storageService as any}
      >
        {children}
      </ChecklistProvider>
    );
  };
}

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generate a valid section ID (alphanumeric with hyphens)
 */
const sectionIdArbitrary = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[a-zA-Z][a-zA-Z0-9-]*$/.test(s));

/**
 * Generate a valid category ID (alphanumeric with hyphens)
 */
const categoryIdArbitrary = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[a-zA-Z][a-zA-Z0-9-]*$/.test(s));

/**
 * Generate a valid item ID (alphanumeric with hyphens)
 */
const itemIdArbitrary = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[a-zA-Z][a-zA-Z0-9-]*$/.test(s));

/**
 * Generate a valid item value (string, number, or boolean)
 */
const itemValueArbitrary = fc.oneof(
  fc.string({ minLength: 0, maxLength: 100 }),
  fc.integer({ min: -1000000, max: 1000000 }),
  fc.boolean()
);

/**
 * Generate a data change operation
 */
interface DataChangeOperation {
  sectionId: string;
  categoryId: string;
  itemId: string;
  value: string | number | boolean;
}

const dataChangeOperationArbitrary: fc.Arbitrary<DataChangeOperation> = fc.record({
  sectionId: sectionIdArbitrary,
  categoryId: categoryIdArbitrary,
  itemId: itemIdArbitrary,
  value: itemValueArbitrary,
});

/**
 * Generate a sequence of data changes (for multiple dirty items testing)
 */
const multipleChangesArbitrary = fc.array(dataChangeOperationArbitrary, { minLength: 2, maxLength: 10 });

// ============================================================================
// Property Tests
// ============================================================================

describe('Property 3: Manual Save with Dirty State Tracking', () => {
  /**
   * **Validates: Requirements 3.1**
   */
  
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Dirty State Tracking', () => {
    it('any data change marks the item as dirty', () => {
      /**
       * **Validates: Requirements 3.1**
       * 
       * Property: For any form field modification, the item should be marked as dirty.
       */
      fc.assert(
        fc.property(dataChangeOperationArbitrary, (change) => {
          // Create fresh mock storage for this iteration
          const mockStorage = createMockStorageService();
          const initialData = createEmptyChecklistData();
          
          const { result, unmount } = renderHook(() => useChecklist(), {
            wrapper: createWrapper(mockStorage, initialData),
          });
          
          try {
            // Initially no dirty items
            expect(result.current.getDirtyItemsCount()).toBe(0);
            
            // Apply the data change
            act(() => {
              result.current.updateItem(
                change.sectionId,
                change.categoryId,
                change.itemId,
                change.value
              );
            });
            
            // Item should now be marked as dirty
            expect(result.current.isItemDirty(
              change.sectionId,
              change.categoryId,
              change.itemId
            )).toBe(true);
            expect(result.current.getDirtyItemsCount()).toBeGreaterThan(0);
            
            return true;
          } finally {
            unmount();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('category is marked as dirty when any of its items is dirty', () => {
      /**
       * **Validates: Requirements 3.1**
       * 
       * Property: A category should be marked as dirty if any of its items are dirty.
       */
      fc.assert(
        fc.property(dataChangeOperationArbitrary, (change) => {
          // Create fresh mock storage for this iteration
          const mockStorage = createMockStorageService();
          const initialData = createEmptyChecklistData();
          
          const { result, unmount } = renderHook(() => useChecklist(), {
            wrapper: createWrapper(mockStorage, initialData),
          });
          
          try {
            // Initially category is not dirty
            expect(result.current.isCategoryDirty(
              change.sectionId,
              change.categoryId
            )).toBe(false);
            
            // Apply the data change
            act(() => {
              result.current.updateItem(
                change.sectionId,
                change.categoryId,
                change.itemId,
                change.value
              );
            });
            
            // Category should now be marked as dirty
            expect(result.current.isCategoryDirty(
              change.sectionId,
              change.categoryId
            )).toBe(true);
            
            return true;
          } finally {
            unmount();
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('No Automatic Save', () => {
    it('data change does not trigger automatic save', () => {
      /**
       * **Validates: Requirements 3.1**
       * 
       * Property: Modifying data should not automatically trigger a save.
       * This is a key change from the previous auto-save behavior.
       */
      fc.assert(
        fc.property(dataChangeOperationArbitrary, (change) => {
          // Create fresh mock storage for this iteration
          const mockStorage = createMockStorageService();
          const initialData = createEmptyChecklistData();
          
          const { result, unmount } = renderHook(() => useChecklist(), {
            wrapper: createWrapper(mockStorage, initialData),
          });
          
          try {
            // Apply the data change
            act(() => {
              result.current.updateItem(
                change.sectionId,
                change.categoryId,
                change.itemId,
                change.value
              );
            });
            
            // Advance time significantly (more than any debounce would be)
            act(() => {
              vi.advanceTimersByTime(5000);
            });
            
            // Save should NOT have been called (no auto-save)
            expect(mockStorage.saveCallCount()).toBe(0);
            expect(mockStorage.progressSaveCallCount()).toBe(0);
            
            return true;
          } finally {
            unmount();
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Manual Save Clears Dirty State', () => {
    it('saveAll clears all dirty items', () => {
      /**
       * **Validates: Requirements 3.1**
       * 
       * Property: When saveAll is called, all dirty items should be cleared.
       */
      fc.assert(
        fc.property(multipleChangesArbitrary, (changes) => {
          // Create fresh mock storage for this iteration
          const mockStorage = createMockStorageService();
          const initialData = createEmptyChecklistData();
          
          const { result, unmount } = renderHook(() => useChecklist(), {
            wrapper: createWrapper(mockStorage, initialData),
          });
          
          try {
            // Apply multiple changes
            for (const change of changes) {
              act(() => {
                result.current.updateItem(
                  change.sectionId,
                  change.categoryId,
                  change.itemId,
                  change.value
                );
              });
            }
            
            // Verify items are dirty
            expect(result.current.getDirtyItemsCount()).toBeGreaterThan(0);
            
            // Call saveAll
            act(() => {
              result.current.saveAll();
            });
            
            // All dirty items should be cleared
            expect(result.current.getDirtyItemsCount()).toBe(0);
            
            // Verify save was called
            expect(mockStorage.saveCallCount()).toBe(1);
            expect(mockStorage.progressSaveCallCount()).toBe(1);
            
            return true;
          } finally {
            unmount();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('saved data contains all modifications', () => {
      /**
       * **Validates: Requirements 3.1**
       * 
       * Property: The saved data should contain all modifications made before saveAll.
       */
      // Generate changes to different items to ensure all are preserved
      const uniqueChangesArbitrary = fc.array(
        fc.record({
          sectionId: fc.constant('test-section'),
          categoryId: fc.constant('test-category'),
          itemId: fc.integer({ min: 1, max: 10 }).map(n => `item-${n}`),
          value: fc.string({ minLength: 1, maxLength: 20 }),
        }),
        { minLength: 2, maxLength: 5 }
      ).map(changes => {
        // Ensure unique item IDs
        const seen = new Set<string>();
        return changes.filter(c => {
          if (seen.has(c.itemId)) return false;
          seen.add(c.itemId);
          return true;
        });
      }).filter(changes => changes.length >= 2);

      fc.assert(
        fc.property(uniqueChangesArbitrary, (changes) => {
          // Create fresh mock storage for this iteration
          const mockStorage = createMockStorageService();
          const initialData = createEmptyChecklistData();
          
          const { result, unmount } = renderHook(() => useChecklist(), {
            wrapper: createWrapper(mockStorage, initialData),
          });
          
          try {
            // Apply all changes
            for (const change of changes) {
              act(() => {
                result.current.updateItem(
                  change.sectionId,
                  change.categoryId,
                  change.itemId,
                  change.value
                );
              });
            }
            
            // Call saveAll
            act(() => {
              result.current.saveAll();
            });
            
            // Verify save was called
            expect(mockStorage.saveCallCount()).toBeGreaterThan(0);
            
            // Verify all changes are in the saved data
            const savedData = mockStorage.saveCalls[0]?.data;
            if (!savedData) {
              throw new Error('No data was saved');
            }
            
            for (const change of changes) {
              const savedValue = savedData.sections?.[change.sectionId]
                ?.categories?.[change.categoryId]
                ?.items?.[change.itemId];
              
              if (savedValue !== change.value) {
                throw new Error(
                  `Change to ${change.itemId} was not preserved.\n` +
                  `Expected: ${JSON.stringify(change.value)}\n` +
                  `Got: ${JSON.stringify(savedValue)}`
                );
              }
            }
            
            return true;
          } finally {
            unmount();
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Save Status Updates', () => {
    it('save status changes to saving during save and saved after completion', () => {
      /**
       * **Validates: Requirements 3.1**
       * 
       * Property: The save status should update appropriately during the
       * manual save process.
       */
      fc.assert(
        fc.property(dataChangeOperationArbitrary, (change) => {
          // Create fresh mock storage for this iteration
          const mockStorage = createMockStorageService();
          const initialData = createEmptyChecklistData();
          
          const { result, unmount } = renderHook(() => useChecklist(), {
            wrapper: createWrapper(mockStorage, initialData),
          });
          
          try {
            // Initial status should be 'saved'
            expect(result.current.state.saveStatus).toBe('saved');
            
            // Apply the data change
            act(() => {
              result.current.updateItem(
                change.sectionId,
                change.categoryId,
                change.itemId,
                change.value
              );
            });
            
            // Status should still be 'saved' (no auto-save)
            // But we have pending changes
            expect(result.current.getDirtyItemsCount()).toBeGreaterThan(0);
            
            // Call saveAll
            act(() => {
              result.current.saveAll();
            });
            
            // Status should be 'saved' after completion
            expect(result.current.state.saveStatus).toBe('saved');
            
            return true;
          } finally {
            unmount();
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('changes to same item are all tracked until save', () => {
      /**
       * **Validates: Requirements 3.1**
       * 
       * Property: When the same item is modified multiple times,
       * only the final value should be saved.
       */
      const sameItemChangesArbitrary = fc.record({
        sectionId: sectionIdArbitrary,
        categoryId: categoryIdArbitrary,
        itemId: itemIdArbitrary,
        values: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
      });

      fc.assert(
        fc.property(sameItemChangesArbitrary, ({ sectionId, categoryId, itemId, values }) => {
          // Create fresh mock storage for this iteration
          const mockStorage = createMockStorageService();
          const initialData = createEmptyChecklistData();
          
          const { result, unmount } = renderHook(() => useChecklist(), {
            wrapper: createWrapper(mockStorage, initialData),
          });
          
          try {
            // Apply multiple changes to the same item
            for (const value of values) {
              act(() => {
                result.current.updateItem(sectionId, categoryId, itemId, value);
              });
            }
            
            // Item should be marked as dirty (only once)
            expect(result.current.getDirtyItemsCount()).toBe(1);
            expect(result.current.isItemDirty(sectionId, categoryId, itemId)).toBe(true);
            
            // Call saveAll
            act(() => {
              result.current.saveAll();
            });
            
            // Verify save was called exactly once
            expect(mockStorage.saveCallCount()).toBe(1);
            
            // Verify the final value was saved
            const savedData = mockStorage.saveCalls[0]?.data;
            const savedValue = savedData?.sections?.[sectionId]
              ?.categories?.[categoryId]
              ?.items?.[itemId];
            
            const finalValue = values[values.length - 1];
            if (savedValue !== finalValue) {
              throw new Error(
                `Final value was not saved.\n` +
                `Expected: ${JSON.stringify(finalValue)}\n` +
                `Got: ${JSON.stringify(savedValue)}`
              );
            }
            
            return true;
          } finally {
            unmount();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('progress state is also saved along with data when saveAll is called', () => {
      /**
       * **Validates: Requirements 3.1**
       * 
       * Property: When saveAll is called, progress state should also be saved.
       */
      fc.assert(
        fc.property(dataChangeOperationArbitrary, (change) => {
          // Create fresh mock storage for this iteration
          const mockStorage = createMockStorageService();
          const initialData = createEmptyChecklistData();
          
          const { result, unmount } = renderHook(() => useChecklist(), {
            wrapper: createWrapper(mockStorage, initialData),
          });
          
          try {
            // Apply the data change
            act(() => {
              result.current.updateItem(
                change.sectionId,
                change.categoryId,
                change.itemId,
                change.value
              );
            });
            
            // Call saveAll
            act(() => {
              result.current.saveAll();
            });
            
            // Both save and saveProgress should have been called
            expect(mockStorage.saveCallCount()).toBeGreaterThan(0);
            expect(mockStorage.progressSaveCallCount()).toBeGreaterThan(0);
            
            return true;
          } finally {
            unmount();
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
