/**
 * Property-Based Tests for Dynamic Item Operations
 * 
 * **Validates: Requirements 8.3**
 * 
 * Property 6: Dynamic Item Operations
 * - For any repeatable Item, adding a new instance should increase the array length by 1
 * - Deleting an instance should decrease the array length by 1
 * - The remaining items should preserve their values
 * 
 * Requirements:
 * - 8.3: THE Checklist_App SHALL 支持动态添加和删除重复类型的 Item（如多个联系人、多个银行账户、多个订阅服务）
 */

import { describe, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import type { ItemDefinition, ItemType } from '../../types/checklist-structure';
import type { ItemValue } from '../../types/checklist-data';
import { RepeatableItemList, getDefaultValue } from '../RepeatableItemList';

// ============================================================================
// Constants
// ============================================================================

/**
 * Item types that can be used in repeatable lists
 */
const REPEATABLE_ITEM_TYPES: ItemType[] = [
  'text',
  'email',
  'tel',
  'url',
  'password',
  'number',
  'textarea',
  'checkbox',
];

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Reserved JavaScript property names that should be avoided as field IDs
 */
const RESERVED_NAMES = new Set([
  'valueOf', 'toString', 'constructor', 'prototype', '__proto__',
  'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
  'toLocaleString', 'length', 'name', 'caller', 'callee', 'arguments',
]);


/**
 * Generate a valid field ID (alphanumeric with hyphens, avoiding reserved names)
 */
const fieldIdArbitrary = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => /^[a-zA-Z][a-zA-Z0-9-]*$/.test(s))
  .filter(s => !RESERVED_NAMES.has(s));

/**
 * Generate a valid label string
 */
const labelArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0);

/**
 * Generate a placeholder string
 */
const placeholderArbitrary = fc.option(
  fc.string({ minLength: 1, maxLength: 100 }),
  { nil: undefined }
);

/**
 * Generate an ItemType suitable for repeatable items
 */
const repeatableItemTypeArbitrary: fc.Arbitrary<ItemType> = fc.constantFrom(...REPEATABLE_ITEM_TYPES);

/**
 * Generate a primitive ItemValue based on type
 */
const primitiveValueArbitrary = (type: ItemType): fc.Arbitrary<ItemValue> => {
  switch (type) {
    case 'checkbox':
      return fc.boolean();
    case 'number':
      return fc.integer({ min: -10000, max: 10000 });
    default:
      // For text-based types, generate non-empty strings
      return fc.string({ minLength: 0, maxLength: 100 });
  }
};

/**
 * Generate an ItemDefinition for repeatable items
 */
const repeatableItemDefinitionArbitrary: fc.Arbitrary<ItemDefinition> = fc.record({
  id: fieldIdArbitrary,
  label: labelArbitrary,
  type: repeatableItemTypeArbitrary,
  placeholder: placeholderArbitrary,
  sensitive: fc.boolean(),
  required: fc.boolean(),
  repeatable: fc.constant(true),
});


/**
 * Generate an array of ItemValues for a given item type
 */
const itemValueArrayArbitrary = (type: ItemType, minLength: number = 0, maxLength: number = 10): fc.Arbitrary<ItemValue[]> => {
  return fc.array(primitiveValueArbitrary(type), { minLength, maxLength });
};

/**
 * Generate a valid index within an array
 */
const validIndexArbitrary = (arrayLength: number): fc.Arbitrary<number> => {
  if (arrayLength <= 0) {
    return fc.constant(0);
  }
  return fc.integer({ min: 0, max: arrayLength - 1 });
};

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Simulates adding an item to the RepeatableItemList
 * Returns the new array that would be passed to onChange
 */
function simulateAddItem(values: ItemValue[], item: ItemDefinition): ItemValue[] {
  const newValue = getDefaultValue(item);
  return [...values, newValue];
}

/**
 * Simulates deleting an item from the RepeatableItemList at a given index
 * Returns the new array that would be passed to onChange
 */
function simulateDeleteItem(values: ItemValue[], index: number): ItemValue[] {
  return values.filter((_, i) => i !== index);
}

/**
 * Checks if two ItemValue arrays are equal (deep comparison)
 */
function arraysAreEqual(arr1: ItemValue[], arr2: ItemValue[]): boolean {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

/**
 * Checks if remaining items preserve their values after an operation
 */
function remainingItemsPreserved(
  original: ItemValue[],
  result: ItemValue[],
  deletedIndex?: number
): boolean {
  let originalIndex = 0;
  for (let resultIndex = 0; resultIndex < result.length; resultIndex++) {
    // Skip the deleted index in original
    if (deletedIndex !== undefined && originalIndex === deletedIndex) {
      originalIndex++;
    }
    
    if (JSON.stringify(original[originalIndex]) !== JSON.stringify(result[resultIndex])) {
      return false;
    }
    originalIndex++;
  }
  return true;
}


// ============================================================================
// Property Tests
// ============================================================================

describe('Property 6: Dynamic Item Operations', () => {
  /**
   * **Validates: Requirements 8.3**
   */

  describe('Add Item Operations', () => {
    it('adding a new instance increases array length by exactly 1', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: For any repeatable Item and any initial array of values,
       * adding a new instance should increase the array length by exactly 1.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary,
          fc.integer({ min: 0, max: 10 }),
          (itemDef, initialLength) => {
            // Generate initial values based on item type
            const initialValues: ItemValue[] = [];
            for (let i = 0; i < initialLength; i++) {
              initialValues.push(getDefaultValue(itemDef));
            }
            
            // Simulate adding an item
            const resultValues = simulateAddItem(initialValues, itemDef);
            
            // Verify length increased by exactly 1
            if (resultValues.length !== initialValues.length + 1) {
              throw new Error(
                `Adding item did not increase length by 1.\n` +
                `Initial length: ${initialValues.length}\n` +
                `Result length: ${resultValues.length}\n` +
                `Expected: ${initialValues.length + 1}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('adding preserves all existing item values', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: When adding a new item, all existing items should
       * preserve their original values.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 0, 10)
            )
          ),
          ([itemDef, initialValues]) => {
            // Simulate adding an item
            const resultValues = simulateAddItem(initialValues, itemDef);
            
            // Verify all original values are preserved at their positions
            for (let i = 0; i < initialValues.length; i++) {
              if (JSON.stringify(initialValues[i]) !== JSON.stringify(resultValues[i])) {
                throw new Error(
                  `Item at index ${i} was modified after add.\n` +
                  `Original: ${JSON.stringify(initialValues[i])}\n` +
                  `After add: ${JSON.stringify(resultValues[i])}`
                );
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });


    it('new item is added at the end of the array', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: The newly added item should be appended at the end
       * of the array, not inserted elsewhere.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 1, 10)
            )
          ),
          ([itemDef, initialValues]) => {
            // Simulate adding an item
            const resultValues = simulateAddItem(initialValues, itemDef);
            const expectedNewValue = getDefaultValue(itemDef);
            
            // Verify the new item is at the last position
            const lastItem = resultValues[resultValues.length - 1];
            if (JSON.stringify(lastItem) !== JSON.stringify(expectedNewValue)) {
              throw new Error(
                `New item not at end of array.\n` +
                `Expected last item: ${JSON.stringify(expectedNewValue)}\n` +
                `Actual last item: ${JSON.stringify(lastItem)}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('adding to empty array creates array with single item', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: Adding an item to an empty array should result in
       * an array with exactly one item (the default value).
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary,
          (itemDef) => {
            const emptyValues: ItemValue[] = [];
            
            // Simulate adding an item
            const resultValues = simulateAddItem(emptyValues, itemDef);
            const expectedValue = getDefaultValue(itemDef);
            
            // Verify result has exactly one item
            if (resultValues.length !== 1) {
              throw new Error(
                `Adding to empty array should result in length 1.\n` +
                `Result length: ${resultValues.length}`
              );
            }
            
            // Verify the item is the default value
            if (JSON.stringify(resultValues[0]) !== JSON.stringify(expectedValue)) {
              throw new Error(
                `Added item is not the default value.\n` +
                `Expected: ${JSON.stringify(expectedValue)}\n` +
                `Actual: ${JSON.stringify(resultValues[0])}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  describe('Delete Item Operations', () => {
    it('deleting an instance decreases array length by exactly 1', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: For any repeatable Item with at least one value,
       * deleting an instance should decrease the array length by exactly 1.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 1, 10)
            )
          ).chain(([itemDef, values]) =>
            fc.tuple(
              fc.constant(itemDef),
              fc.constant(values),
              validIndexArbitrary(values.length)
            )
          ),
          ([_itemDef, initialValues, deleteIndex]) => {
            // Simulate deleting an item
            const resultValues = simulateDeleteItem(initialValues, deleteIndex);
            
            // Verify length decreased by exactly 1
            if (resultValues.length !== initialValues.length - 1) {
              throw new Error(
                `Deleting item did not decrease length by 1.\n` +
                `Initial length: ${initialValues.length}\n` +
                `Result length: ${resultValues.length}\n` +
                `Expected: ${initialValues.length - 1}\n` +
                `Delete index: ${deleteIndex}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('deleting preserves all remaining item values', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: When deleting an item, all remaining items should
       * preserve their original values (in order, excluding the deleted item).
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 2, 10)
            )
          ).chain(([itemDef, values]) =>
            fc.tuple(
              fc.constant(itemDef),
              fc.constant(values),
              validIndexArbitrary(values.length)
            )
          ),
          ([_itemDef, initialValues, deleteIndex]) => {
            // Simulate deleting an item
            const resultValues = simulateDeleteItem(initialValues, deleteIndex);
            
            // Verify remaining items preserve their values
            if (!remainingItemsPreserved(initialValues, resultValues, deleteIndex)) {
              throw new Error(
                `Remaining items were not preserved after delete.\n` +
                `Initial: ${JSON.stringify(initialValues)}\n` +
                `Delete index: ${deleteIndex}\n` +
                `Result: ${JSON.stringify(resultValues)}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });


    it('deleting from single-item array results in empty array', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: Deleting the only item from a single-item array
       * should result in an empty array.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              primitiveValueArbitrary(itemDef.type)
            )
          ),
          ([_itemDef, singleValue]) => {
            const initialValues: ItemValue[] = [singleValue];
            
            // Simulate deleting the only item
            const resultValues = simulateDeleteItem(initialValues, 0);
            
            // Verify result is empty
            if (resultValues.length !== 0) {
              throw new Error(
                `Deleting from single-item array should result in empty array.\n` +
                `Result length: ${resultValues.length}\n` +
                `Result: ${JSON.stringify(resultValues)}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('deleting first item shifts remaining items correctly', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: When deleting the first item, all subsequent items
       * should shift to fill the gap while preserving their values.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 2, 10)
            )
          ),
          ([_itemDef, initialValues]) => {
            // Delete the first item
            const resultValues = simulateDeleteItem(initialValues, 0);
            
            // Verify each remaining item matches the original at index+1
            for (let i = 0; i < resultValues.length; i++) {
              if (JSON.stringify(resultValues[i]) !== JSON.stringify(initialValues[i + 1])) {
                throw new Error(
                  `Item at index ${i} does not match original at ${i + 1}.\n` +
                  `Expected: ${JSON.stringify(initialValues[i + 1])}\n` +
                  `Actual: ${JSON.stringify(resultValues[i])}`
                );
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('deleting last item preserves all preceding items', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: When deleting the last item, all preceding items
       * should remain unchanged at their original positions.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 2, 10)
            )
          ),
          ([_itemDef, initialValues]) => {
            const lastIndex = initialValues.length - 1;
            
            // Delete the last item
            const resultValues = simulateDeleteItem(initialValues, lastIndex);
            
            // Verify all preceding items are unchanged
            for (let i = 0; i < resultValues.length; i++) {
              if (JSON.stringify(resultValues[i]) !== JSON.stringify(initialValues[i])) {
                throw new Error(
                  `Item at index ${i} was modified after deleting last item.\n` +
                  `Expected: ${JSON.stringify(initialValues[i])}\n` +
                  `Actual: ${JSON.stringify(resultValues[i])}`
                );
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  describe('Combined Add and Delete Operations', () => {
    it('add then delete at same position returns to original state', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: Adding an item and then immediately deleting it
       * (at the last position) should return the array to its original state.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 0, 10)
            )
          ),
          ([itemDef, initialValues]) => {
            // Add an item
            const afterAdd = simulateAddItem(initialValues, itemDef);
            
            // Delete the newly added item (at the last position)
            const afterDelete = simulateDeleteItem(afterAdd, afterAdd.length - 1);
            
            // Verify we're back to original state
            if (!arraysAreEqual(initialValues, afterDelete)) {
              throw new Error(
                `Add then delete did not return to original state.\n` +
                `Original: ${JSON.stringify(initialValues)}\n` +
                `After add+delete: ${JSON.stringify(afterDelete)}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('multiple adds increase length correctly', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: Adding N items should increase the array length by exactly N.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary,
          fc.integer({ min: 0, max: 5 }),
          fc.integer({ min: 1, max: 5 }),
          (itemDef, initialLength, addCount) => {
            // Create initial values
            let values: ItemValue[] = [];
            for (let i = 0; i < initialLength; i++) {
              values.push(getDefaultValue(itemDef));
            }
            
            // Add multiple items
            for (let i = 0; i < addCount; i++) {
              values = simulateAddItem(values, itemDef);
            }
            
            // Verify final length
            const expectedLength = initialLength + addCount;
            if (values.length !== expectedLength) {
              throw new Error(
                `Multiple adds did not increase length correctly.\n` +
                `Initial: ${initialLength}, Added: ${addCount}\n` +
                `Expected: ${expectedLength}, Actual: ${values.length}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });


    it('multiple deletes decrease length correctly', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: Deleting N items should decrease the array length by exactly N.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              fc.integer({ min: 3, max: 10 })
            )
          ).chain(([itemDef, initialLength]) =>
            fc.tuple(
              fc.constant(itemDef),
              fc.constant(initialLength),
              fc.integer({ min: 1, max: Math.min(initialLength, 3) })
            )
          ),
          ([itemDef, initialLength, deleteCount]) => {
            // Create initial values
            let values: ItemValue[] = [];
            for (let i = 0; i < initialLength; i++) {
              values.push(getDefaultValue(itemDef));
            }
            
            // Delete multiple items (always from the end to avoid index issues)
            for (let i = 0; i < deleteCount; i++) {
              values = simulateDeleteItem(values, values.length - 1);
            }
            
            // Verify final length
            const expectedLength = initialLength - deleteCount;
            if (values.length !== expectedLength) {
              throw new Error(
                `Multiple deletes did not decrease length correctly.\n` +
                `Initial: ${initialLength}, Deleted: ${deleteCount}\n` +
                `Expected: ${expectedLength}, Actual: ${values.length}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('interleaved add and delete operations maintain consistency', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: A sequence of interleaved add and delete operations
       * should result in the correct final length.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary,
          fc.array(fc.boolean(), { minLength: 1, maxLength: 10 }),
          (itemDef, operations) => {
            let values: ItemValue[] = [getDefaultValue(itemDef)]; // Start with one item
            let expectedLength = 1;
            
            for (const isAdd of operations) {
              if (isAdd) {
                // Add operation
                values = simulateAddItem(values, itemDef);
                expectedLength++;
              } else if (values.length > 0) {
                // Delete operation (only if array is not empty)
                values = simulateDeleteItem(values, values.length - 1);
                expectedLength--;
              }
            }
            
            if (values.length !== expectedLength) {
              throw new Error(
                `Interleaved operations resulted in wrong length.\n` +
                `Operations: ${operations.map(o => o ? 'add' : 'delete').join(', ')}\n` +
                `Expected: ${expectedLength}, Actual: ${values.length}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  describe('Value Preservation', () => {
    it('original array is never mutated by add operation', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: The add operation should create a new array
       * without mutating the original array.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 1, 10)
            )
          ),
          ([itemDef, initialValues]) => {
            // Create a deep copy to compare later
            const originalCopy = JSON.parse(JSON.stringify(initialValues));
            
            // Simulate adding an item
            simulateAddItem(initialValues, itemDef);
            
            // Verify original array was not mutated
            if (!arraysAreEqual(initialValues, originalCopy)) {
              throw new Error(
                `Original array was mutated by add operation.\n` +
                `Original (before): ${JSON.stringify(originalCopy)}\n` +
                `Original (after): ${JSON.stringify(initialValues)}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('original array is never mutated by delete operation', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: The delete operation should create a new array
       * without mutating the original array.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 2, 10)
            )
          ).chain(([itemDef, values]) =>
            fc.tuple(
              fc.constant(itemDef),
              fc.constant(values),
              validIndexArbitrary(values.length)
            )
          ),
          ([_itemDef, initialValues, deleteIndex]) => {
            // Create a deep copy to compare later
            const originalCopy = JSON.parse(JSON.stringify(initialValues));
            
            // Simulate deleting an item
            simulateDeleteItem(initialValues, deleteIndex);
            
            // Verify original array was not mutated
            if (!arraysAreEqual(initialValues, originalCopy)) {
              throw new Error(
                `Original array was mutated by delete operation.\n` +
                `Original (before): ${JSON.stringify(originalCopy)}\n` +
                `Original (after): ${JSON.stringify(initialValues)}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });


    it('complex values are preserved correctly after operations', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: Complex values (strings with special characters, numbers)
       * should be preserved exactly after add/delete operations.
       */
      const complexStringArbitrary = fc.stringOf(
        fc.constantFrom(
          'a', 'Z', '0', ' ', '\n', '\t', '"', "'", '\\', '/',
          '<', '>', '&', '中', '文', '日', '本', '語', '🎉', '😀'
        ),
        { minLength: 1, maxLength: 50 }
      );

      fc.assert(
        fc.property(
          fc.array(complexStringArbitrary, { minLength: 2, maxLength: 5 }),
          (complexValues) => {
            const itemDef: ItemDefinition = {
              id: 'test',
              label: 'Test',
              type: 'text',
              repeatable: true,
            };
            
            // Add a new item
            const afterAdd = simulateAddItem(complexValues, itemDef);
            
            // Verify all original complex values are preserved
            for (let i = 0; i < complexValues.length; i++) {
              if (afterAdd[i] !== complexValues[i]) {
                throw new Error(
                  `Complex value at index ${i} was not preserved.\n` +
                  `Original: ${JSON.stringify(complexValues[i])}\n` +
                  `After add: ${JSON.stringify(afterAdd[i])}`
                );
              }
            }
            
            // Delete from middle
            const middleIndex = Math.floor(complexValues.length / 2);
            const afterDelete = simulateDeleteItem(afterAdd, middleIndex);
            
            // Verify remaining values are correct
            let originalIndex = 0;
            for (let i = 0; i < afterDelete.length - 1; i++) { // -1 because we added one
              if (originalIndex === middleIndex) {
                originalIndex++;
              }
              if (originalIndex < complexValues.length && afterDelete[i] !== complexValues[originalIndex]) {
                throw new Error(
                  `Complex value not preserved after delete.\n` +
                  `Expected: ${JSON.stringify(complexValues[originalIndex])}\n` +
                  `Actual: ${JSON.stringify(afterDelete[i])}`
                );
              }
              originalIndex++;
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  describe('Component Integration', () => {
    afterEach(() => {
      cleanup();
    });

    it('RepeatableItemList add button triggers correct onChange', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: Clicking the add button in RepeatableItemList should
       * call onChange with an array that has length increased by 1.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 0, 5)
            )
          ),
          ([itemDef, initialValues]) => {
            cleanup();
            
            const mockOnChange = vi.fn();
            
            render(
              <RepeatableItemList
                item={itemDef}
                values={initialValues}
                onChange={mockOnChange}
              />
            );
            
            // Click the add button
            const addButton = screen.getByTestId('repeatable-add-button');
            fireEvent.click(addButton);
            
            // Verify onChange was called
            if (mockOnChange.mock.calls.length !== 1) {
              throw new Error(
                `onChange should be called exactly once.\n` +
                `Called: ${mockOnChange.mock.calls.length} times`
              );
            }
            
            // Verify the new array has correct length
            const newValues = mockOnChange.mock.calls[0][0] as ItemValue[];
            if (newValues.length !== initialValues.length + 1) {
              throw new Error(
                `New array length incorrect.\n` +
                `Initial: ${initialValues.length}\n` +
                `New: ${newValues.length}\n` +
                `Expected: ${initialValues.length + 1}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });


    it('RepeatableItemList delete button triggers correct onChange', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: Clicking a delete button in RepeatableItemList should
       * call onChange with an array that has length decreased by 1.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 2, 5)
            )
          ),
          ([itemDef, initialValues]) => {
            cleanup();
            
            const mockOnChange = vi.fn();
            
            render(
              <RepeatableItemList
                item={itemDef}
                values={initialValues}
                onChange={mockOnChange}
              />
            );
            
            // Click the first delete button
            const deleteButtons = screen.getAllByTestId('item-delete-button');
            if (deleteButtons.length === 0) {
              throw new Error('No delete buttons found');
            }
            fireEvent.click(deleteButtons[0]);
            
            // Verify onChange was called
            if (mockOnChange.mock.calls.length !== 1) {
              throw new Error(
                `onChange should be called exactly once.\n` +
                `Called: ${mockOnChange.mock.calls.length} times`
              );
            }
            
            // Verify the new array has correct length
            const newValues = mockOnChange.mock.calls[0][0] as ItemValue[];
            if (newValues.length !== initialValues.length - 1) {
              throw new Error(
                `New array length incorrect after delete.\n` +
                `Initial: ${initialValues.length}\n` +
                `New: ${newValues.length}\n` +
                `Expected: ${initialValues.length - 1}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('RepeatableItemList preserves values after add via component', () => {
      /**
       * **Validates: Requirements 8.3**
       * 
       * Property: After clicking add in RepeatableItemList, all original
       * values should be preserved in the onChange callback.
       */
      fc.assert(
        fc.property(
          repeatableItemDefinitionArbitrary.chain(itemDef => 
            fc.tuple(
              fc.constant(itemDef),
              itemValueArrayArbitrary(itemDef.type, 1, 5)
            )
          ),
          ([itemDef, initialValues]) => {
            cleanup();
            
            const mockOnChange = vi.fn();
            
            render(
              <RepeatableItemList
                item={itemDef}
                values={initialValues}
                onChange={mockOnChange}
              />
            );
            
            // Click the add button
            fireEvent.click(screen.getByTestId('repeatable-add-button'));
            
            // Verify all original values are preserved
            const newValues = mockOnChange.mock.calls[0][0] as ItemValue[];
            for (let i = 0; i < initialValues.length; i++) {
              if (JSON.stringify(newValues[i]) !== JSON.stringify(initialValues[i])) {
                throw new Error(
                  `Value at index ${i} not preserved after add.\n` +
                  `Original: ${JSON.stringify(initialValues[i])}\n` +
                  `New: ${JSON.stringify(newValues[i])}`
                );
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
