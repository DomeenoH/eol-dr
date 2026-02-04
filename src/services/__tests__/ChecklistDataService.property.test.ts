/**
 * Property-Based Tests for ChecklistDataService Navigation
 * 
 * **Validates: Requirements 1.2, 2.4**
 * 
 * Property 1: Navigation Order Consistency
 * - For any current position in the checklist (Section and Category), calling getNextCategory()
 *   should return the next Category in the predefined order, and calling getPrevCategory()
 *   should return the previous Category.
 * - The sequence should be deterministic and consistent.
 */

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ChecklistDataService } from '../ChecklistDataService';
import { getAllCategoriesInOrder } from '../../data/checklistStructure';

describe('Property 1: Navigation Order Consistency', () => {
  /**
   * **Validates: Requirements 1.2, 2.4**
   */
  
  let service: ChecklistDataService;
  let allCategories: ReturnType<typeof getAllCategoriesInOrder>;
  
  beforeEach(() => {
    service = new ChecklistDataService();
    allCategories = getAllCategoriesInOrder();
  });
  
  /**
   * Helper function to build a path from section and category
   */
  function buildPath(sectionId: string, categoryId: string): string {
    return `${sectionId}/${categoryId}`;
  }
  
  /**
   * Create an arbitrary that generates any valid category position
   */
  function createAnyPositionArbitrary() {
    return fc.integer({ min: 0, max: allCategories.length - 1 })
      .map(index => {
        const { section, category } = allCategories[index];
        return {
          index,
          path: buildPath(section.id, category.id),
          section,
          category,
          isFirst: index === 0,
          isLast: index === allCategories.length - 1
        };
      });
  }

  describe('Round-trip Navigation Properties', () => {
    it('getNextCategory followed by getPrevCategory returns to original position (except at boundaries)', () => {
      /**
       * **Validates: Requirements 1.2, 2.4**
       * 
       * Property: For any position that is not the last category,
       * calling getNextCategory() and then getPrevCategory() on the result
       * should return the original position.
       */
      const positionArbitrary = createAnyPositionArbitrary();
      
      fc.assert(
        fc.property(positionArbitrary, (position) => {
          // Skip if at the last position (no next category)
          if (position.isLast) {
            return true;
          }
          
          const nextPath = service.getNextCategory(position.path);
          
          // Next should exist for non-last positions
          if (nextPath === null) {
            throw new Error(
              `getNextCategory returned null for non-last position: ${position.path} ` +
              `(index: ${position.index}, total: ${allCategories.length})`
            );
          }
          
          const backToOriginal = service.getPrevCategory(nextPath);
          
          // Going back should return to original
          if (backToOriginal !== position.path) {
            throw new Error(
              `Round-trip failed: ${position.path} -> ${nextPath} -> ${backToOriginal}. ` +
              `Expected to return to ${position.path}`
            );
          }
          
          return backToOriginal === position.path;
        }),
        { numRuns: 100 }
      );
    });

    it('getPrevCategory followed by getNextCategory returns to original position (except at boundaries)', () => {
      /**
       * **Validates: Requirements 1.2, 2.4**
       * 
       * Property: For any position that is not the first category,
       * calling getPrevCategory() and then getNextCategory() on the result
       * should return the original position.
       */
      const positionArbitrary = createAnyPositionArbitrary();
      
      fc.assert(
        fc.property(positionArbitrary, (position) => {
          // Skip if at the first position (no previous category)
          if (position.isFirst) {
            return true;
          }
          
          const prevPath = service.getPrevCategory(position.path);
          
          // Prev should exist for non-first positions
          if (prevPath === null) {
            throw new Error(
              `getPrevCategory returned null for non-first position: ${position.path} ` +
              `(index: ${position.index})`
            );
          }
          
          const backToOriginal = service.getNextCategory(prevPath);
          
          // Going forward should return to original
          if (backToOriginal !== position.path) {
            throw new Error(
              `Round-trip failed: ${position.path} -> ${prevPath} -> ${backToOriginal}. ` +
              `Expected to return to ${position.path}`
            );
          }
          
          return backToOriginal === position.path;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Determinism Properties', () => {
    it('getNextCategory is deterministic - same input always produces same output', () => {
      /**
       * **Validates: Requirements 1.2, 2.4**
       * 
       * Property: For any position, calling getNextCategory() multiple times
       * with the same input should always return the same result.
       */
      const positionArbitrary = createAnyPositionArbitrary();
      
      fc.assert(
        fc.property(positionArbitrary, (position) => {
          // Call getNextCategory multiple times
          const result1 = service.getNextCategory(position.path);
          const result2 = service.getNextCategory(position.path);
          const result3 = service.getNextCategory(position.path);
          
          // All results should be identical
          if (result1 !== result2 || result2 !== result3) {
            throw new Error(
              `getNextCategory is not deterministic for ${position.path}: ` +
              `got ${result1}, ${result2}, ${result3}`
            );
          }
          
          return result1 === result2 && result2 === result3;
        }),
        { numRuns: 100 }
      );
    });

    it('getPrevCategory is deterministic - same input always produces same output', () => {
      /**
       * **Validates: Requirements 1.2, 2.4**
       * 
       * Property: For any position, calling getPrevCategory() multiple times
       * with the same input should always return the same result.
       */
      const positionArbitrary = createAnyPositionArbitrary();
      
      fc.assert(
        fc.property(positionArbitrary, (position) => {
          // Call getPrevCategory multiple times
          const result1 = service.getPrevCategory(position.path);
          const result2 = service.getPrevCategory(position.path);
          const result3 = service.getPrevCategory(position.path);
          
          // All results should be identical
          if (result1 !== result2 || result2 !== result3) {
            throw new Error(
              `getPrevCategory is not deterministic for ${position.path}: ` +
              `got ${result1}, ${result2}, ${result3}`
            );
          }
          
          return result1 === result2 && result2 === result3;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Boundary Behavior Properties', () => {
    it('getNextCategory returns null only at the last position', () => {
      /**
       * **Validates: Requirements 1.2, 2.4**
       * 
       * Property: getNextCategory should return null if and only if
       * the current position is the last category in the checklist.
       */
      const positionArbitrary = createAnyPositionArbitrary();
      
      fc.assert(
        fc.property(positionArbitrary, (position) => {
          const nextPath = service.getNextCategory(position.path);
          
          if (position.isLast) {
            // Last position should return null
            if (nextPath !== null) {
              throw new Error(
                `getNextCategory should return null for last position ${position.path}, ` +
                `but got ${nextPath}`
              );
            }
            return nextPath === null;
          } else {
            // Non-last positions should return a valid path
            if (nextPath === null) {
              throw new Error(
                `getNextCategory should not return null for non-last position ${position.path} ` +
                `(index: ${position.index}, total: ${allCategories.length})`
              );
            }
            return nextPath !== null;
          }
        }),
        { numRuns: 100 }
      );
    });

    it('getPrevCategory returns null only at the first position', () => {
      /**
       * **Validates: Requirements 1.2, 2.4**
       * 
       * Property: getPrevCategory should return null if and only if
       * the current position is the first category in the checklist.
       */
      const positionArbitrary = createAnyPositionArbitrary();
      
      fc.assert(
        fc.property(positionArbitrary, (position) => {
          const prevPath = service.getPrevCategory(position.path);
          
          if (position.isFirst) {
            // First position should return null
            if (prevPath !== null) {
              throw new Error(
                `getPrevCategory should return null for first position ${position.path}, ` +
                `but got ${prevPath}`
              );
            }
            return prevPath === null;
          } else {
            // Non-first positions should return a valid path
            if (prevPath === null) {
              throw new Error(
                `getPrevCategory should not return null for non-first position ${position.path} ` +
                `(index: ${position.index})`
              );
            }
            return prevPath !== null;
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Sequential Order Properties', () => {
    it('navigation follows the predefined category order', () => {
      /**
       * **Validates: Requirements 1.2, 2.4**
       * 
       * Property: For any position (not at the end), getNextCategory should return
       * the path corresponding to the next index in the ordered categories array.
       */
      const positionArbitrary = createAnyPositionArbitrary();
      
      fc.assert(
        fc.property(positionArbitrary, (position) => {
          // Skip last position
          if (position.isLast) {
            return true;
          }
          
          const nextPath = service.getNextCategory(position.path);
          const expectedNext = allCategories[position.index + 1];
          const expectedPath = buildPath(expectedNext.section.id, expectedNext.category.id);
          
          if (nextPath !== expectedPath) {
            throw new Error(
              `Navigation order mismatch at index ${position.index}: ` +
              `expected ${expectedPath}, got ${nextPath}`
            );
          }
          
          return nextPath === expectedPath;
        }),
        { numRuns: 100 }
      );
    });

    it('backward navigation follows the predefined category order in reverse', () => {
      /**
       * **Validates: Requirements 1.2, 2.4**
       * 
       * Property: For any position (not at the beginning), getPrevCategory should return
       * the path corresponding to the previous index in the ordered categories array.
       */
      const positionArbitrary = createAnyPositionArbitrary();
      
      fc.assert(
        fc.property(positionArbitrary, (position) => {
          // Skip first position
          if (position.isFirst) {
            return true;
          }
          
          const prevPath = service.getPrevCategory(position.path);
          const expectedPrev = allCategories[position.index - 1];
          const expectedPath = buildPath(expectedPrev.section.id, expectedPrev.category.id);
          
          if (prevPath !== expectedPath) {
            throw new Error(
              `Backward navigation order mismatch at index ${position.index}: ` +
              `expected ${expectedPath}, got ${prevPath}`
            );
          }
          
          return prevPath === expectedPath;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Cross-Section Navigation Properties', () => {
    it('navigation correctly crosses section boundaries', () => {
      /**
       * **Validates: Requirements 1.2, 2.4**
       * 
       * Property: When navigating from the last category of one section,
       * getNextCategory should return the first category of the next section.
       */
      // Find all section boundary positions (last category of each section except the last section)
      const sectionBoundaries: Array<{
        index: number;
        path: string;
        currentSection: string;
        nextSection: string;
      }> = [];
      
      let currentIndex = 0;
      const structure = service.getStructure();
      
      for (let sectionIdx = 0; sectionIdx < structure.sections.length - 1; sectionIdx++) {
        const section = structure.sections[sectionIdx];
        const nextSection = structure.sections[sectionIdx + 1];
        
        // Move to the last category of this section
        currentIndex += section.categories.length - 1;
        const lastCategory = section.categories[section.categories.length - 1];
        
        sectionBoundaries.push({
          index: currentIndex,
          path: buildPath(section.id, lastCategory.id),
          currentSection: section.id,
          nextSection: nextSection.id
        });
        
        // Move to start of next section
        currentIndex++;
      }
      
      if (sectionBoundaries.length === 0) {
        // Only one section, skip this test
        return;
      }
      
      const boundaryArbitrary = fc.integer({ min: 0, max: sectionBoundaries.length - 1 })
        .map(index => sectionBoundaries[index]);
      
      fc.assert(
        fc.property(boundaryArbitrary, (boundary) => {
          const nextPath = service.getNextCategory(boundary.path);
          
          if (nextPath === null) {
            throw new Error(
              `getNextCategory returned null at section boundary: ${boundary.path}`
            );
          }
          
          // The next path should be in the next section
          const nextSectionId = nextPath.split('/')[0];
          
          if (nextSectionId !== boundary.nextSection) {
            throw new Error(
              `Cross-section navigation failed: from ${boundary.path} (section: ${boundary.currentSection}) ` +
              `expected next section ${boundary.nextSection}, got ${nextSectionId}`
            );
          }
          
          return nextSectionId === boundary.nextSection;
        }),
        { numRuns: 100 }
      );
    });
  });
});


/**
 * Property-Based Tests for Progress Calculation
 * 
 * **Validates: Requirements 10.1-10.4**
 * 
 * Property 7: Progress Calculation
 * - The overall progress percentage should equal the weighted average of all Section progresses
 * - Each Section progress should equal the average of its Category progresses
 * - A Category with at least one filled Item should have status "in_progress"
 * - A Category with all Items filled should have status "completed"
 * - A Category with no Items filled should have status "not_started"
 */

import type { ChecklistData, CategoryData, ItemValue, SectionData } from '../../types/checklist-data';
import type { Category, Section, ItemDefinition } from '../../types/checklist-structure';
import { checklistStructure } from '../../data/checklistStructure';

describe('Property 7: Progress Calculation', () => {
  /**
   * **Validates: Requirements 10.1-10.4**
   */
  
  let service: ChecklistDataService;
  
  beforeEach(() => {
    service = new ChecklistDataService();
  });
  
  /**
   * Helper to create an empty ChecklistData structure
   */
  function createEmptyChecklistData(): ChecklistData {
    return {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      sections: {}
    };
  }
  
  /**
   * Helper to generate a filled value for an item based on its type
   */
  function generateFilledValue(item: ItemDefinition): ItemValue {
    switch (item.type) {
      case 'text':
      case 'textarea':
      case 'password':
        return 'test value';
      case 'email':
        return 'test@example.com';
      case 'tel':
        return '555-555-5555';
      case 'url':
        return 'https://example.com';
      case 'number':
        return 42;
      case 'checkbox':
        return true;
      case 'select':
        return item.options?.[0]?.value || 'option1';
      case 'group':
        // For group types, fill all sub-fields
        if (item.fields) {
          const groupValue: Record<string, ItemValue> = {};
          for (const field of item.fields) {
            groupValue[field.id] = generateFilledValue(field);
          }
          return groupValue;
        }
        return { value: 'test' };
      default:
        return 'test';
    }
  }
  
  /**
   * Arbitrary to generate a fill pattern for a category
   * Returns an object mapping item IDs to whether they should be filled
   */
  function createCategoryFillPatternArbitrary(category: Category) {
    // Generate a boolean for each item in the category
    const itemArbitraries = category.items.map(item => 
      fc.boolean().map(filled => ({ itemId: item.id, filled, item }))
    );
    
    return fc.tuple(...itemArbitraries);
  }
  
  /**
   * Arbitrary to generate fill patterns for all categories in a section
   */
  function createSectionFillPatternArbitrary(section: Section) {
    const categoryArbitraries = section.categories.map(category => 
      createCategoryFillPatternArbitrary(category).map(pattern => ({
        categoryId: category.id,
        pattern,
        category
      }))
    );
    
    return fc.tuple(...categoryArbitraries);
  }
  
  /**
   * Arbitrary to generate fill patterns for the entire checklist
   */
  function createChecklistFillPatternArbitrary() {
    const sectionArbitraries = checklistStructure.sections.map(section =>
      createSectionFillPatternArbitrary(section).map(pattern => ({
        sectionId: section.id,
        pattern,
        section
      }))
    );
    
    return fc.tuple(...sectionArbitraries);
  }
  
  /**
   * Apply a fill pattern to create ChecklistData
   */
  function applyFillPattern(
    fillPattern: Array<{
      sectionId: string;
      pattern: Array<{
        categoryId: string;
        pattern: Array<{ itemId: string; filled: boolean; item: ItemDefinition }>;
        category: Category;
      }>;
      section: Section;
    }>
  ): ChecklistData {
    const data = createEmptyChecklistData();
    
    for (const sectionPattern of fillPattern) {
      const sectionData: SectionData = { categories: {} };
      
      for (const categoryPattern of sectionPattern.pattern) {
        const categoryData: CategoryData = { items: {} };
        
        for (const itemPattern of categoryPattern.pattern) {
          if (itemPattern.filled) {
            if (itemPattern.item.repeatable) {
              // For repeatable items, add one filled value in an array
              categoryData.items[itemPattern.itemId] = [generateFilledValue(itemPattern.item)];
            } else {
              categoryData.items[itemPattern.itemId] = generateFilledValue(itemPattern.item);
            }
          }
        }
        
        sectionData.categories[categoryPattern.categoryId] = categoryData;
      }
      
      data.sections[sectionPattern.sectionId] = sectionData;
    }
    
    return data;
  }
  
  /**
   * Calculate expected category progress percentage
   */
  function expectedCategoryProgress(
    pattern: Array<{ itemId: string; filled: boolean; item: ItemDefinition }>
  ): number {
    const filledCount = pattern.filter(p => p.filled).length;
    const totalCount = pattern.length;
    
    if (totalCount === 0) return 0;
    return Math.round((filledCount / totalCount) * 100);
  }

  describe('Category Status Properties', () => {
    it('a category with no items filled should have status "not_started"', () => {
      /**
       * **Validates: Requirements 10.1-10.4**
       * 
       * Property: A Category with no Items filled should have status "not_started"
       */
      const fillPatternArbitrary = createChecklistFillPatternArbitrary();
      
      fc.assert(
        fc.property(fillPatternArbitrary, (fillPattern) => {
          const data = applyFillPattern(fillPattern);
          const progress = service.calculateProgress(data);
          
          // Check each category
          for (const sectionPattern of fillPattern) {
            for (const categoryPattern of sectionPattern.pattern) {
              const filledCount = categoryPattern.pattern.filter(p => p.filled).length;
              
              if (filledCount === 0) {
                const categoryProgress = progress.sections[sectionPattern.sectionId]
                  ?.categories[categoryPattern.categoryId];
                
                if (categoryProgress?.status !== 'not_started') {
                  throw new Error(
                    `Category ${sectionPattern.sectionId}/${categoryPattern.categoryId} ` +
                    `has no filled items but status is "${categoryProgress?.status}" instead of "not_started"`
                  );
                }
              }
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('a category with at least one filled item (but not all) should have status "in_progress"', () => {
      /**
       * **Validates: Requirements 10.1-10.4**
       * 
       * Property: A Category with at least one filled Item should have status "in_progress"
       */
      const fillPatternArbitrary = createChecklistFillPatternArbitrary();
      
      fc.assert(
        fc.property(fillPatternArbitrary, (fillPattern) => {
          const data = applyFillPattern(fillPattern);
          const progress = service.calculateProgress(data);
          
          // Check each category
          for (const sectionPattern of fillPattern) {
            for (const categoryPattern of sectionPattern.pattern) {
              const filledCount = categoryPattern.pattern.filter(p => p.filled).length;
              const totalCount = categoryPattern.pattern.length;
              
              // Only check categories that are partially filled (at least one but not all)
              if (filledCount > 0 && filledCount < totalCount) {
                const categoryProgress = progress.sections[sectionPattern.sectionId]
                  ?.categories[categoryPattern.categoryId];
                
                if (categoryProgress?.status !== 'in_progress') {
                  throw new Error(
                    `Category ${sectionPattern.sectionId}/${categoryPattern.categoryId} ` +
                    `has ${filledCount}/${totalCount} filled items but status is "${categoryProgress?.status}" ` +
                    `instead of "in_progress"`
                  );
                }
              }
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('a category with all items filled should have status "completed"', () => {
      /**
       * **Validates: Requirements 10.1-10.4**
       * 
       * Property: A Category with all Items filled should have status "completed"
       */
      const fillPatternArbitrary = createChecklistFillPatternArbitrary();
      
      fc.assert(
        fc.property(fillPatternArbitrary, (fillPattern) => {
          const data = applyFillPattern(fillPattern);
          const progress = service.calculateProgress(data);
          
          // Check each category
          for (const sectionPattern of fillPattern) {
            for (const categoryPattern of sectionPattern.pattern) {
              const filledCount = categoryPattern.pattern.filter(p => p.filled).length;
              const totalCount = categoryPattern.pattern.length;
              
              // Only check categories that are fully filled
              if (filledCount >= totalCount && totalCount > 0) {
                const categoryProgress = progress.sections[sectionPattern.sectionId]
                  ?.categories[categoryPattern.categoryId];
                
                if (categoryProgress?.status !== 'completed') {
                  throw new Error(
                    `Category ${sectionPattern.sectionId}/${categoryPattern.categoryId} ` +
                    `has all ${totalCount} items filled but status is "${categoryProgress?.status}" ` +
                    `instead of "completed"`
                  );
                }
              }
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Category Progress Calculation Properties', () => {
    it('category progress should equal (filledItems / totalItems) * 100, rounded', () => {
      /**
       * **Validates: Requirements 10.1-10.4**
       * 
       * Property: Category progress percentage should be calculated correctly
       */
      const fillPatternArbitrary = createChecklistFillPatternArbitrary();
      
      fc.assert(
        fc.property(fillPatternArbitrary, (fillPattern) => {
          const data = applyFillPattern(fillPattern);
          const progress = service.calculateProgress(data);
          
          // Check each category
          for (const sectionPattern of fillPattern) {
            for (const categoryPattern of sectionPattern.pattern) {
              const expectedProgress = expectedCategoryProgress(categoryPattern.pattern);
              const categoryProgress = progress.sections[sectionPattern.sectionId]
                ?.categories[categoryPattern.categoryId];
              
              if (categoryProgress?.progress !== expectedProgress) {
                throw new Error(
                  `Category ${sectionPattern.sectionId}/${categoryPattern.categoryId} ` +
                  `progress is ${categoryProgress?.progress}% but expected ${expectedProgress}%`
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

  describe('Section Progress Calculation Properties', () => {
    it('section progress should equal the average of its category progresses', () => {
      /**
       * **Validates: Requirements 10.1-10.4**
       * 
       * Property: Each Section progress should equal the average of its Category progresses
       */
      const fillPatternArbitrary = createChecklistFillPatternArbitrary();
      
      fc.assert(
        fc.property(fillPatternArbitrary, (fillPattern) => {
          const data = applyFillPattern(fillPattern);
          const progress = service.calculateProgress(data);
          
          // Check each section
          for (const sectionPattern of fillPattern) {
            const sectionProgress = progress.sections[sectionPattern.sectionId];
            
            if (!sectionProgress) {
              throw new Error(`Section ${sectionPattern.sectionId} not found in progress`);
            }
            
            // Calculate expected section progress as average of category progresses
            const categoryProgresses = sectionPattern.pattern.map(cp => 
              expectedCategoryProgress(cp.pattern)
            );
            
            const expectedSectionProgress = categoryProgresses.length > 0
              ? Math.round(categoryProgresses.reduce((a, b) => a + b, 0) / categoryProgresses.length)
              : 0;
            
            if (sectionProgress.progress !== expectedSectionProgress) {
              throw new Error(
                `Section ${sectionPattern.sectionId} progress is ${sectionProgress.progress}% ` +
                `but expected ${expectedSectionProgress}% (average of category progresses: ${categoryProgresses.join(', ')})`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Overall Progress Calculation Properties', () => {
    it('overall progress should equal the weighted average of all section progresses', () => {
      /**
       * **Validates: Requirements 10.1-10.4**
       * 
       * Property: The overall progress percentage should equal the weighted average of all Section progresses
       */
      const fillPatternArbitrary = createChecklistFillPatternArbitrary();
      
      fc.assert(
        fc.property(fillPatternArbitrary, (fillPattern) => {
          const data = applyFillPattern(fillPattern);
          const progress = service.calculateProgress(data);
          
          // Calculate expected overall progress as average of section progresses
          const sectionProgresses = fillPattern.map(sp => {
            const categoryProgresses = sp.pattern.map(cp => 
              expectedCategoryProgress(cp.pattern)
            );
            return categoryProgresses.length > 0
              ? Math.round(categoryProgresses.reduce((a, b) => a + b, 0) / categoryProgresses.length)
              : 0;
          });
          
          const expectedOverall = sectionProgresses.length > 0
            ? Math.round(sectionProgresses.reduce((a, b) => a + b, 0) / sectionProgresses.length)
            : 0;
          
          if (progress.overall !== expectedOverall) {
            throw new Error(
              `Overall progress is ${progress.overall}% but expected ${expectedOverall}% ` +
              `(average of section progresses: ${sectionProgresses.join(', ')})`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Progress Bounds Properties', () => {
    it('all progress values should be between 0 and 100', () => {
      /**
       * **Validates: Requirements 10.1-10.4**
       * 
       * Property: Progress percentages should always be valid (0-100)
       */
      const fillPatternArbitrary = createChecklistFillPatternArbitrary();
      
      fc.assert(
        fc.property(fillPatternArbitrary, (fillPattern) => {
          const data = applyFillPattern(fillPattern);
          const progress = service.calculateProgress(data);
          
          // Check overall progress
          if (progress.overall < 0 || progress.overall > 100) {
            throw new Error(`Overall progress ${progress.overall}% is out of bounds [0, 100]`);
          }
          
          // Check each section and category
          for (const [sectionId, sectionProgress] of Object.entries(progress.sections)) {
            if (sectionProgress.progress < 0 || sectionProgress.progress > 100) {
              throw new Error(
                `Section ${sectionId} progress ${sectionProgress.progress}% is out of bounds [0, 100]`
              );
            }
            
            for (const [categoryId, categoryProgress] of Object.entries(sectionProgress.categories)) {
              if (categoryProgress.progress < 0 || categoryProgress.progress > 100) {
                throw new Error(
                  `Category ${sectionId}/${categoryId} progress ${categoryProgress.progress}% is out of bounds [0, 100]`
                );
              }
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('filledItems should never exceed totalItems', () => {
      /**
       * **Validates: Requirements 10.1-10.4**
       * 
       * Property: filledItems count should be consistent with totalItems
       */
      const fillPatternArbitrary = createChecklistFillPatternArbitrary();
      
      fc.assert(
        fc.property(fillPatternArbitrary, (fillPattern) => {
          const data = applyFillPattern(fillPattern);
          const progress = service.calculateProgress(data);
          
          // Check each category
          for (const [sectionId, sectionProgress] of Object.entries(progress.sections)) {
            for (const [categoryId, categoryProgress] of Object.entries(sectionProgress.categories)) {
              if (categoryProgress.filledItems > categoryProgress.totalItems) {
                throw new Error(
                  `Category ${sectionId}/${categoryId} has filledItems (${categoryProgress.filledItems}) ` +
                  `greater than totalItems (${categoryProgress.totalItems})`
                );
              }
              
              if (categoryProgress.filledItems < 0) {
                throw new Error(
                  `Category ${sectionId}/${categoryId} has negative filledItems (${categoryProgress.filledItems})`
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

  describe('Empty Data Edge Cases', () => {
    it('empty checklist data should result in 0% progress for all sections', () => {
      /**
       * **Validates: Requirements 10.1-10.4**
       * 
       * Property: Empty data should result in 0% progress everywhere
       */
      fc.assert(
        fc.property(fc.constant(null), () => {
          const emptyData = createEmptyChecklistData();
          const progress = service.calculateProgress(emptyData);
          
          // Overall should be 0
          if (progress.overall !== 0) {
            throw new Error(`Empty data should have 0% overall progress, got ${progress.overall}%`);
          }
          
          // All sections should be 0% and not_started
          for (const [sectionId, sectionProgress] of Object.entries(progress.sections)) {
            if (sectionProgress.progress !== 0) {
              throw new Error(
                `Empty data should have 0% progress for section ${sectionId}, got ${sectionProgress.progress}%`
              );
            }
            
            if (sectionProgress.status !== 'not_started') {
              throw new Error(
                `Empty data should have "not_started" status for section ${sectionId}, got "${sectionProgress.status}"`
              );
            }
            
            // All categories should be 0% and not_started
            for (const [categoryId, categoryProgress] of Object.entries(sectionProgress.categories)) {
              if (categoryProgress.progress !== 0) {
                throw new Error(
                  `Empty data should have 0% progress for category ${sectionId}/${categoryId}, got ${categoryProgress.progress}%`
                );
              }
              
              if (categoryProgress.status !== 'not_started') {
                throw new Error(
                  `Empty data should have "not_started" status for category ${sectionId}/${categoryId}, got "${categoryProgress.status}"`
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
});
