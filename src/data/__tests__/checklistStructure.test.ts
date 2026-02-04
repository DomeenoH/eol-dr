/**
 * Property-Based Tests for Checklist Structure Data Integrity
 * 
 * **Validates: Requirements 8.1, 8.2**
 * 
 * Property 9: Content Completeness
 * - For any Category in the checklist structure, there should be a non-empty description or helpText.
 * - For any complex field (type: 'group' or fields with multiple sub-fields), there should be 
 *   placeholder text or helpText.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  checklistStructure, 
  getAllCategoriesInOrder 
} from '../checklistStructure';
import type { Category, ItemDefinition, Section } from '../../types/checklist-structure';

/**
 * Helper function to check if a string is non-empty
 */
function isNonEmptyString(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Helper function to check if a field is a complex field
 * A complex field is either:
 * - type: 'group'
 * - has multiple sub-fields (fields array with length > 0)
 */
function isComplexField(item: ItemDefinition): boolean {
  return item.type === 'group' || (Array.isArray(item.fields) && item.fields.length > 0);
}

/**
 * Helper function to check if a complex field has placeholder or helpText
 */
function complexFieldHasGuidance(item: ItemDefinition): boolean {
  return isNonEmptyString(item.placeholder) || isNonEmptyString(item.helpText);
}

/**
 * Recursively collect all complex fields from an item definition
 */
function collectComplexFields(item: ItemDefinition): ItemDefinition[] {
  const result: ItemDefinition[] = [];
  
  if (isComplexField(item)) {
    result.push(item);
  }
  
  // Recursively check sub-fields
  if (item.fields && item.fields.length > 0) {
    for (const subField of item.fields) {
      result.push(...collectComplexFields(subField));
    }
  }
  
  return result;
}

/**
 * Get all complex fields from a category
 */
function getAllComplexFieldsFromCategory(category: Category): ItemDefinition[] {
  const result: ItemDefinition[] = [];
  
  for (const item of category.items) {
    result.push(...collectComplexFields(item));
  }
  
  return result;
}

/**
 * Get all complex fields from the entire checklist structure
 */
function getAllComplexFields(): Array<{ 
  section: Section; 
  category: Category; 
  field: ItemDefinition 
}> {
  const result: Array<{ section: Section; category: Category; field: ItemDefinition }> = [];
  
  for (const section of checklistStructure.sections) {
    for (const category of section.categories) {
      const complexFields = getAllComplexFieldsFromCategory(category);
      for (const field of complexFields) {
        result.push({ section, category, field });
      }
    }
  }
  
  return result;
}

describe('Property 9: Content Completeness', () => {
  /**
   * **Validates: Requirements 8.1, 8.2**
   * 
   * Property: For any Category in the checklist structure, there should be 
   * a non-empty description or helpText.
   */
  describe('Category Content Completeness', () => {
    // Get all categories for property testing
    const allCategories = getAllCategoriesInOrder();
    
    // Create an arbitrary that selects from actual categories
    const categoryArbitrary = fc.integer({ min: 0, max: allCategories.length - 1 })
      .map(index => allCategories[index]);

    it('every category should have description or helpText', () => {
      /**
       * **Validates: Requirements 8.1, 8.2**
       */
      fc.assert(
        fc.property(categoryArbitrary, ({ section, category }) => {
          const hasDescription = isNonEmptyString(category.description);
          const hasHelpText = isNonEmptyString(category.helpText);
          
          // Property: Category must have either description or helpText
          const hasGuidance = hasDescription || hasHelpText;
          
          if (!hasGuidance) {
            // Provide detailed failure message
            throw new Error(
              `Category "${category.name}" (id: ${category.id}) in section "${section.name}" ` +
              `lacks both description and helpText. ` +
              `description: "${category.description || ''}", helpText: "${category.helpText || ''}"`
            );
          }
          
          return hasGuidance;
        }),
        { numRuns: 100 }
      );
    });

    it('should verify all categories have guidance (exhaustive check)', () => {
      /**
       * **Validates: Requirements 8.1, 8.2**
       * 
       * This test exhaustively checks all categories to ensure none are missed
       */
      const categoriesWithoutGuidance: Array<{ sectionName: string; categoryName: string; categoryId: string }> = [];
      
      for (const { section, category } of allCategories) {
        const hasDescription = isNonEmptyString(category.description);
        const hasHelpText = isNonEmptyString(category.helpText);
        
        if (!hasDescription && !hasHelpText) {
          categoriesWithoutGuidance.push({
            sectionName: section.name,
            categoryName: category.name,
            categoryId: category.id
          });
        }
      }
      
      expect(categoriesWithoutGuidance).toEqual([]);
    });
  });

  /**
   * **Validates: Requirements 8.1, 8.2**
   * 
   * Property: For any complex field (type: 'group' or fields with multiple sub-fields), 
   * there should be placeholder text or helpText.
   */
  describe('Complex Field Content Completeness', () => {
    // Get all complex fields for property testing
    const allComplexFields = getAllComplexFields();
    
    // Skip if no complex fields exist (shouldn't happen, but handle gracefully)
    const hasComplexFields = allComplexFields.length > 0;
    
    // Create an arbitrary that selects from actual complex fields
    const complexFieldArbitrary = hasComplexFields 
      ? fc.integer({ min: 0, max: allComplexFields.length - 1 })
          .map(index => allComplexFields[index])
      : fc.constant(null);

    it('every complex field should have placeholder or helpText', () => {
      /**
       * **Validates: Requirements 8.1, 8.2**
       */
      if (!hasComplexFields) {
        // No complex fields to test - this is unexpected but not a failure
        return;
      }

      fc.assert(
        fc.property(complexFieldArbitrary, (data) => {
          if (data === null) return true;
          
          const { section, category, field } = data;
          const hasGuidance = complexFieldHasGuidance(field);
          
          if (!hasGuidance) {
            // Provide detailed failure message
            throw new Error(
              `Complex field "${field.label}" (id: ${field.id}, type: ${field.type}) ` +
              `in category "${category.name}" (section: "${section.name}") ` +
              `lacks both placeholder and helpText. ` +
              `placeholder: "${field.placeholder || ''}", helpText: "${field.helpText || ''}"`
            );
          }
          
          return hasGuidance;
        }),
        { numRuns: 100 }
      );
    });

    it('should verify all complex fields have guidance (exhaustive check)', () => {
      /**
       * **Validates: Requirements 8.1, 8.2**
       * 
       * This test exhaustively checks all complex fields to ensure none are missed
       */
      const fieldsWithoutGuidance: Array<{
        sectionName: string;
        categoryName: string;
        fieldLabel: string;
        fieldId: string;
        fieldType: string;
      }> = [];
      
      for (const { section, category, field } of allComplexFields) {
        if (!complexFieldHasGuidance(field)) {
          fieldsWithoutGuidance.push({
            sectionName: section.name,
            categoryName: category.name,
            fieldLabel: field.label,
            fieldId: field.id,
            fieldType: field.type
          });
        }
      }
      
      expect(fieldsWithoutGuidance).toEqual([]);
    });
  });

  /**
   * Additional property tests for structure integrity
   */
  describe('Structure Integrity Properties', () => {
    it('all sections should have at least one category', () => {
      /**
       * **Validates: Requirements 8.1, 8.2**
       */
      const sectionArbitrary = fc.integer({ min: 0, max: checklistStructure.sections.length - 1 })
        .map(index => checklistStructure.sections[index]);

      fc.assert(
        fc.property(sectionArbitrary, (section) => {
          const hasCategories = section.categories.length > 0;
          
          if (!hasCategories) {
            throw new Error(`Section "${section.name}" (id: ${section.id}) has no categories`);
          }
          
          return hasCategories;
        }),
        { numRuns: 100 }
      );
    });

    it('all categories should have at least one item', () => {
      /**
       * **Validates: Requirements 8.1, 8.2**
       */
      const allCategories = getAllCategoriesInOrder();
      const categoryArbitrary = fc.integer({ min: 0, max: allCategories.length - 1 })
        .map(index => allCategories[index]);

      fc.assert(
        fc.property(categoryArbitrary, ({ section, category }) => {
          const hasItems = category.items.length > 0;
          
          if (!hasItems) {
            throw new Error(
              `Category "${category.name}" (id: ${category.id}) in section "${section.name}" has no items`
            );
          }
          
          return hasItems;
        }),
        { numRuns: 100 }
      );
    });

    it('all items should have valid id and label', () => {
      /**
       * **Validates: Requirements 8.1, 8.2**
       */
      // Collect all items from all categories
      const allItems: Array<{ section: Section; category: Category; item: ItemDefinition }> = [];
      
      for (const section of checklistStructure.sections) {
        for (const category of section.categories) {
          for (const item of category.items) {
            allItems.push({ section, category, item });
            // Also add sub-fields if they exist
            if (item.fields) {
              for (const subField of item.fields) {
                allItems.push({ section, category, item: subField });
              }
            }
          }
        }
      }

      const itemArbitrary = fc.integer({ min: 0, max: allItems.length - 1 })
        .map(index => allItems[index]);

      fc.assert(
        fc.property(itemArbitrary, ({ section, category, item }) => {
          const hasValidId = isNonEmptyString(item.id);
          const hasValidLabel = isNonEmptyString(item.label);
          
          if (!hasValidId || !hasValidLabel) {
            throw new Error(
              `Item in category "${category.name}" (section: "${section.name}") ` +
              `has invalid id or label. id: "${item.id}", label: "${item.label}"`
            );
          }
          
          return hasValidId && hasValidLabel;
        }),
        { numRuns: 100 }
      );
    });
  });
});
