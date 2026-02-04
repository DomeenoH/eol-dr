/**
 * Property-Based Tests for StorageService Data Persistence
 * 
 * **Validates: Requirements 3.2, 4.2, 4.5**
 * 
 * Property 2: Data Persistence Round-Trip
 * - For any valid ChecklistData object, saving it to localStorage and then loading it back
 *   should produce an equivalent object.
 * - Similarly, exporting to JSON and importing back should produce an equivalent object.
 * - The round-trip should preserve all nested structures.
 */

import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { StorageService } from '../StorageService';
import type { ChecklistData, SectionData, CategoryData, ItemValue, ItemValueObject } from '../../types/checklist-data';
import type { ProgressState, SectionProgress, CategoryProgress, AppMode, ProgressStatus } from '../../types/progress';

/**
 * Create a mock localStorage implementation that actually stores data
 */
function createMockLocalStorage() {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    _getStore: () => store,
    _setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
}

describe('Property 2: Data Persistence Round-Trip', () => {
  /**
   * **Validates: Requirements 3.2, 4.2, 4.5**
   */
  
  let service: StorageService;
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;
  
  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
    service = new StorageService();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Arbitraries (Generators) for ChecklistData
  // ============================================================================

  /**
   * Generate a primitive value (string, number, or boolean)
   */
  const primitiveValueArbitrary = fc.oneof(
    fc.string({ minLength: 0, maxLength: 100 }),
    fc.integer({ min: -1000000, max: 1000000 }),
    fc.boolean()
  );

  /**
   * Generate an ItemValueObject (nested object with primitive values)
   * Limited depth to avoid infinite recursion
   */
  function createItemValueObjectArbitrary(depth: number = 0): fc.Arbitrary<ItemValueObject> {
    if (depth >= 2) {
      // At max depth, only use primitives
      return fc.dictionary(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(s)),
        primitiveValueArbitrary
      ).filter(obj => Object.keys(obj).length > 0);
    }
    
    // For nested objects, we create a fixed-depth structure to avoid recursion issues
    const nestedArbitrary = createItemValueObjectArbitrary(depth + 1);
    
    return fc.dictionary(
      fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(s)),
      fc.oneof(
        primitiveValueArbitrary,
        nestedArbitrary
      )
    ).filter(obj => Object.keys(obj).length > 0);
  }

  /**
   * Generate an ItemValue (primitive or object)
   */
  const itemValueArbitrary: fc.Arbitrary<ItemValue> = fc.oneof(
    primitiveValueArbitrary,
    createItemValueObjectArbitrary(0)
  );

  /**
   * Generate an array of ItemValues (for repeatable items)
   */
  const itemValueArrayArbitrary = fc.array(itemValueArbitrary, { minLength: 1, maxLength: 5 });

  /**
   * Generate CategoryData with items
   */
  const categoryDataArbitrary: fc.Arbitrary<CategoryData> = fc.record({
    items: fc.dictionary(
      fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
      fc.oneof(itemValueArbitrary, itemValueArrayArbitrary)
    )
  });

  /**
   * Generate SectionData with categories
   */
  const sectionDataArbitrary: fc.Arbitrary<SectionData> = fc.record({
    categories: fc.dictionary(
      fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
      categoryDataArbitrary
    )
  });

  /**
   * Generate a valid ISO timestamp string
   */
  const isoTimestampArbitrary = fc.date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31')
  }).map(d => d.toISOString());

  /**
   * Generate a version string
   */
  const versionArbitrary = fc.constantFrom('1.0.0', '1.0.1', '1.1.0', '2.0.0');

  /**
   * Generate complete ChecklistData
   */
  const checklistDataArbitrary: fc.Arbitrary<ChecklistData> = fc.record({
    version: versionArbitrary,
    lastModified: isoTimestampArbitrary,
    sections: fc.dictionary(
      fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
      sectionDataArbitrary
    )
  });

  // ============================================================================
  // Arbitraries (Generators) for ProgressState
  // ============================================================================

  /**
   * Generate a progress percentage (0-100)
   */
  const progressPercentageArbitrary = fc.integer({ min: 0, max: 100 });

  /**
   * Generate a progress status
   */
  const progressStatusArbitrary: fc.Arbitrary<ProgressStatus> = fc.constantFrom(
    'not_started',
    'in_progress',
    'completed'
  );

  /**
   * Generate an app mode
   */
  const appModeArbitrary: fc.Arbitrary<AppMode> = fc.constantFrom('guided', 'free');

  /**
   * Generate CategoryProgress
   */
  const categoryProgressArbitrary: fc.Arbitrary<CategoryProgress> = fc.record({
    progress: progressPercentageArbitrary,
    status: progressStatusArbitrary,
    filledItems: fc.integer({ min: 0, max: 100 }),
    totalItems: fc.integer({ min: 0, max: 100 })
  });

  /**
   * Generate SectionProgress
   */
  const sectionProgressArbitrary: fc.Arbitrary<SectionProgress> = fc.record({
    progress: progressPercentageArbitrary,
    status: progressStatusArbitrary,
    categories: fc.dictionary(
      fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
      categoryProgressArbitrary
    )
  });

  /**
   * Generate complete ProgressState
   */
  const progressStateArbitrary: fc.Arbitrary<ProgressState> = fc.record({
    overall: progressPercentageArbitrary,
    sections: fc.dictionary(
      fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
      sectionProgressArbitrary
    ),
    currentPosition: fc.record({
      sectionId: fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
      categoryId: fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s))
    }),
    mode: appModeArbitrary,
    lastVisited: isoTimestampArbitrary
  });

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Deep equality check for ChecklistData sections
   * (ignoring version and lastModified which may be updated by the service)
   */
  function sectionsAreEquivalent(original: ChecklistData, loaded: ChecklistData): boolean {
    return JSON.stringify(original.sections) === JSON.stringify(loaded.sections);
  }

  /**
   * Deep equality check for ProgressState
   * (ignoring lastVisited which may be updated by the service)
   */
  function progressIsEquivalent(original: ProgressState, loaded: ProgressState): boolean {
    return (
      original.overall === loaded.overall &&
      original.mode === loaded.mode &&
      JSON.stringify(original.currentPosition) === JSON.stringify(loaded.currentPosition) &&
      JSON.stringify(original.sections) === JSON.stringify(loaded.sections)
    );
  }

  // ============================================================================
  // Property Tests: ChecklistData Round-Trip
  // ============================================================================

  describe('ChecklistData localStorage Round-Trip', () => {
    it('save → load preserves all section data for any valid ChecklistData', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: For any valid ChecklistData object, saving it to localStorage
       * and then loading it back should produce an object with equivalent sections.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (originalData) => {
          // Save the data
          service.save(originalData);
          
          // Load the data back
          const loadedData = service.load();
          
          // Verify loaded data is not null
          if (loadedData === null) {
            throw new Error('Loaded data is null after save');
          }
          
          // Verify sections are equivalent
          if (!sectionsAreEquivalent(originalData, loadedData)) {
            throw new Error(
              `Sections mismatch after round-trip.\n` +
              `Original: ${JSON.stringify(originalData.sections)}\n` +
              `Loaded: ${JSON.stringify(loadedData.sections)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('save → load preserves nested object structures', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: The round-trip should preserve all nested structures including
       * deeply nested ItemValueObjects.
       */
      // Create an arbitrary specifically for deeply nested data
      const deeplyNestedDataArbitrary = fc.record({
        version: versionArbitrary,
        lastModified: isoTimestampArbitrary,
        sections: fc.record({
          'test-section': fc.record({
            categories: fc.record({
              'test-category': fc.record({
                items: fc.record({
                  'nested-item': createItemValueObjectArbitrary(0),
                  'array-item': fc.array(createItemValueObjectArbitrary(0), { minLength: 1, maxLength: 3 })
                })
              })
            })
          })
        })
      });

      fc.assert(
        fc.property(deeplyNestedDataArbitrary, (originalData) => {
          service.save(originalData);
          const loadedData = service.load();
          
          if (loadedData === null) {
            throw new Error('Loaded data is null after save');
          }
          
          // Deep comparison of the nested structure
          const originalNested = originalData.sections['test-section']?.categories['test-category']?.items;
          const loadedNested = loadedData.sections['test-section']?.categories['test-category']?.items;
          
          if (JSON.stringify(originalNested) !== JSON.stringify(loadedNested)) {
            throw new Error(
              `Nested structure mismatch.\n` +
              `Original: ${JSON.stringify(originalNested)}\n` +
              `Loaded: ${JSON.stringify(loadedNested)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('multiple save → load cycles preserve data integrity', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: Multiple consecutive save/load cycles should preserve data integrity.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (originalData) => {
          // First cycle
          service.save(originalData);
          const loaded1 = service.load();
          
          if (loaded1 === null) {
            throw new Error('First load returned null');
          }
          
          // Second cycle - save the loaded data
          service.save(loaded1);
          const loaded2 = service.load();
          
          if (loaded2 === null) {
            throw new Error('Second load returned null');
          }
          
          // Third cycle
          service.save(loaded2);
          const loaded3 = service.load();
          
          if (loaded3 === null) {
            throw new Error('Third load returned null');
          }
          
          // All loaded versions should have equivalent sections to original
          if (!sectionsAreEquivalent(originalData, loaded3)) {
            throw new Error(
              `Data degraded after multiple cycles.\n` +
              `Original sections: ${JSON.stringify(originalData.sections)}\n` +
              `After 3 cycles: ${JSON.stringify(loaded3.sections)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Property Tests: ProgressState Round-Trip
  // ============================================================================

  describe('ProgressState localStorage Round-Trip', () => {
    it('saveProgress → loadProgress preserves all progress data', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: For any valid ProgressState object, saving it to localStorage
       * and then loading it back should produce an equivalent object.
       */
      fc.assert(
        fc.property(progressStateArbitrary, (originalProgress) => {
          // Save the progress
          service.saveProgress(originalProgress);
          
          // Load the progress back
          const loadedProgress = service.loadProgress();
          
          // Verify loaded progress is not null
          if (loadedProgress === null) {
            throw new Error('Loaded progress is null after save');
          }
          
          // Verify progress is equivalent
          if (!progressIsEquivalent(originalProgress, loadedProgress)) {
            throw new Error(
              `Progress mismatch after round-trip.\n` +
              `Original overall: ${originalProgress.overall}, Loaded: ${loadedProgress.overall}\n` +
              `Original mode: ${originalProgress.mode}, Loaded: ${loadedProgress.mode}\n` +
              `Original position: ${JSON.stringify(originalProgress.currentPosition)}, ` +
              `Loaded: ${JSON.stringify(loadedProgress.currentPosition)}\n` +
              `Original sections: ${JSON.stringify(originalProgress.sections)}\n` +
              `Loaded sections: ${JSON.stringify(loadedProgress.sections)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('saveProgress → loadProgress preserves category progress details', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: The round-trip should preserve all category progress details
       * including filledItems and totalItems counts.
       */
      fc.assert(
        fc.property(progressStateArbitrary, (originalProgress) => {
          service.saveProgress(originalProgress);
          const loadedProgress = service.loadProgress();
          
          if (loadedProgress === null) {
            throw new Error('Loaded progress is null');
          }
          
          // Check each section's categories
          for (const [sectionId, sectionProgress] of Object.entries(originalProgress.sections)) {
            const loadedSection = loadedProgress.sections[sectionId];
            
            if (!loadedSection) {
              throw new Error(`Section ${sectionId} missing after round-trip`);
            }
            
            for (const [categoryId, categoryProgress] of Object.entries(sectionProgress.categories)) {
              const loadedCategory = loadedSection.categories[categoryId];
              
              if (!loadedCategory) {
                throw new Error(`Category ${categoryId} in section ${sectionId} missing after round-trip`);
              }
              
              if (
                loadedCategory.progress !== categoryProgress.progress ||
                loadedCategory.status !== categoryProgress.status ||
                loadedCategory.filledItems !== categoryProgress.filledItems ||
                loadedCategory.totalItems !== categoryProgress.totalItems
              ) {
                throw new Error(
                  `Category ${categoryId} progress mismatch.\n` +
                  `Original: ${JSON.stringify(categoryProgress)}\n` +
                  `Loaded: ${JSON.stringify(loadedCategory)}`
                );
              }
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Property Tests: JSON Export/Import Round-Trip
  // ============================================================================

  describe('JSON Export/Import Round-Trip', () => {
    it('JSON.stringify → JSON.parse preserves ChecklistData', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: Exporting ChecklistData to JSON and importing back
       * should produce an equivalent object.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (originalData) => {
          // Export to JSON
          const jsonString = JSON.stringify(originalData);
          
          // Import from JSON
          const importedData = JSON.parse(jsonString) as ChecklistData;
          
          // Verify complete equivalence (JSON round-trip should be exact)
          if (JSON.stringify(originalData) !== JSON.stringify(importedData)) {
            throw new Error(
              `JSON round-trip produced different data.\n` +
              `Original: ${JSON.stringify(originalData)}\n` +
              `Imported: ${JSON.stringify(importedData)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('JSON.stringify → JSON.parse preserves ProgressState', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: Exporting ProgressState to JSON and importing back
       * should produce an equivalent object.
       */
      fc.assert(
        fc.property(progressStateArbitrary, (originalProgress) => {
          // Export to JSON
          const jsonString = JSON.stringify(originalProgress);
          
          // Import from JSON
          const importedProgress = JSON.parse(jsonString) as ProgressState;
          
          // Verify complete equivalence
          if (JSON.stringify(originalProgress) !== JSON.stringify(importedProgress)) {
            throw new Error(
              `JSON round-trip produced different progress.\n` +
              `Original: ${JSON.stringify(originalProgress)}\n` +
              `Imported: ${JSON.stringify(importedProgress)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Property Tests: Combined Data and Progress Round-Trip
  // ============================================================================

  describe('Combined ChecklistData and ProgressState Round-Trip', () => {
    it('saving both data and progress preserves both independently', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: Saving both ChecklistData and ProgressState should preserve
       * both independently without interference.
       */
      const combinedArbitrary = fc.record({
        data: checklistDataArbitrary,
        progress: progressStateArbitrary
      });

      fc.assert(
        fc.property(combinedArbitrary, ({ data, progress }) => {
          // Save both
          service.save(data);
          service.saveProgress(progress);
          
          // Load both
          const loadedData = service.load();
          const loadedProgress = service.loadProgress();
          
          // Verify both are loaded correctly
          if (loadedData === null) {
            throw new Error('Loaded data is null');
          }
          
          if (loadedProgress === null) {
            throw new Error('Loaded progress is null');
          }
          
          // Verify data sections are preserved
          if (!sectionsAreEquivalent(data, loadedData)) {
            throw new Error('Data sections not preserved when saving both data and progress');
          }
          
          // Verify progress is preserved
          if (!progressIsEquivalent(progress, loadedProgress)) {
            throw new Error('Progress not preserved when saving both data and progress');
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('clear removes both data and progress', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: After clearing, both data and progress should be null.
       */
      const combinedArbitrary = fc.record({
        data: checklistDataArbitrary,
        progress: progressStateArbitrary
      });

      fc.assert(
        fc.property(combinedArbitrary, ({ data, progress }) => {
          // Save both
          service.save(data);
          service.saveProgress(progress);
          
          // Clear
          service.clear();
          
          // Both should be null
          const loadedData = service.load();
          const loadedProgress = service.loadProgress();
          
          if (loadedData !== null) {
            throw new Error('Data should be null after clear');
          }
          
          if (loadedProgress !== null) {
            throw new Error('Progress should be null after clear');
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Property Tests: Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('empty sections object is preserved', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: ChecklistData with empty sections should round-trip correctly.
       */
      const emptyDataArbitrary = fc.record({
        version: versionArbitrary,
        lastModified: isoTimestampArbitrary,
        sections: fc.constant({})
      });

      fc.assert(
        fc.property(emptyDataArbitrary, (originalData) => {
          service.save(originalData);
          const loadedData = service.load();
          
          if (loadedData === null) {
            throw new Error('Loaded data is null');
          }
          
          if (Object.keys(loadedData.sections).length !== 0) {
            throw new Error('Empty sections should remain empty after round-trip');
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('special characters in string values are preserved', () => {
      /**
       * **Validates: Requirements 3.2, 4.2, 4.5**
       * 
       * Property: String values with special characters should be preserved.
       */
      const specialCharsArbitrary = fc.stringOf(
        fc.constantFrom(
          'a', 'Z', '0', ' ', '\n', '\t', '"', "'", '\\', '/', 
          '<', '>', '&', '中', '文', '日', '本', '語', '🎉', '😀'
        ),
        { minLength: 1, maxLength: 50 }
      );

      const dataWithSpecialCharsArbitrary = fc.record({
        version: versionArbitrary,
        lastModified: isoTimestampArbitrary,
        sections: fc.record({
          'test-section': fc.record({
            categories: fc.record({
              'test-category': fc.record({
                items: fc.record({
                  'special-item': specialCharsArbitrary
                })
              })
            })
          })
        })
      });

      fc.assert(
        fc.property(dataWithSpecialCharsArbitrary, (originalData) => {
          service.save(originalData);
          const loadedData = service.load();
          
          if (loadedData === null) {
            throw new Error('Loaded data is null');
          }
          
          const originalValue = originalData.sections['test-section']?.categories['test-category']?.items['special-item'];
          const loadedValue = loadedData.sections['test-section']?.categories['test-category']?.items['special-item'];
          
          if (originalValue !== loadedValue) {
            throw new Error(
              `Special characters not preserved.\n` +
              `Original: ${JSON.stringify(originalValue)}\n` +
              `Loaded: ${JSON.stringify(loadedValue)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
