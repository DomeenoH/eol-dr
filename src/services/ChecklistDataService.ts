/**
 * ChecklistDataService
 * Service for managing checklist structure, navigation, and progress calculation
 * 
 * Requirements: 1.2, 2.4, 10.1-10.4
 */

import type { ChecklistStructure, Section, Category, ItemDefinition } from '../types/checklist-structure';
import type { ChecklistData, CategoryData, ItemValue, ItemValueObject } from '../types/checklist-data';
import type { ProgressState, SectionProgress, CategoryProgress, ProgressStatus } from '../types/progress';
import type { ValidationResult, ValidationError } from '../types/validation';
import { checklistStructure, getAllCategoriesInOrder } from '../data/checklistStructure';

/**
 * Interface for ChecklistDataService
 */
export interface IChecklistDataService {
  getStructure(): ChecklistStructure;
  validateItem(item: ItemDefinition, value: ItemValue): ValidationResult;
  calculateProgress(data: ChecklistData): ProgressState;
  getNextCategory(currentPath: string): string | null;
  getPrevCategory(currentPath: string): string | null;
}

/**
 * Parse a path string into section and category IDs
 * @param path - Path in format "sectionId/categoryId"
 * @returns Object with sectionId and categoryId, or null if invalid
 */
function parsePath(path: string): { sectionId: string; categoryId: string } | null {
  const parts = path.split('/');
  if (parts.length !== 2) {
    return null;
  }
  return { sectionId: parts[0], categoryId: parts[1] };
}

/**
 * Build a path string from section and category IDs
 * @param sectionId - Section ID
 * @param categoryId - Category ID
 * @returns Path string in format "sectionId/categoryId"
 */
function buildPath(sectionId: string, categoryId: string): string {
  return `${sectionId}/${categoryId}`;
}

/**
 * Check if an ItemValue is considered "filled" (non-empty)
 * @param value - The value to check
 * @returns true if the value is considered filled
 */
function isValueFilled(value: ItemValue | undefined | null): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  
  // Handle primitive types
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (typeof value === 'number') {
    return true; // Numbers are always considered filled
  }
  if (typeof value === 'boolean') {
    return value; // Only true is considered filled for checkboxes
  }
  
  // Handle object types (group fields)
  if (typeof value === 'object') {
    const obj = value as ItemValueObject;
    // An object is filled if at least one of its values is filled
    return Object.values(obj).some(v => isValueFilled(v as ItemValue));
  }
  
  return false;
}

/**
 * Check if an array of ItemValues has any filled values
 * @param values - Array of values to check
 * @returns true if at least one value is filled
 */
function hasFilledArrayValues(values: ItemValue[]): boolean {
  return values.some(v => isValueFilled(v));
}

/**
 * Count filled items in a category
 * @param category - Category definition
 * @param categoryData - User data for the category
 * @returns Object with filledItems and totalItems counts
 */
function countFilledItems(
  category: Category,
  categoryData: CategoryData | undefined
): { filledItems: number; totalItems: number } {
  const totalItems = category.items.length;
  let filledItems = 0;
  
  if (!categoryData || !categoryData.items) {
    return { filledItems: 0, totalItems };
  }
  
  for (const item of category.items) {
    const value = categoryData.items[item.id];
    
    if (item.repeatable) {
      // For repeatable items, check if the array has any filled values
      if (Array.isArray(value) && hasFilledArrayValues(value)) {
        filledItems++;
      }
    } else {
      // For non-repeatable items, check if the value is filled
      if (isValueFilled(value as ItemValue)) {
        filledItems++;
      }
    }
  }
  
  return { filledItems, totalItems };
}

/**
 * Determine the status of a category based on filled items
 * @param filledItems - Number of filled items
 * @param totalItems - Total number of items
 * @returns ProgressStatus
 */
function determineStatus(filledItems: number, totalItems: number): ProgressStatus {
  if (filledItems === 0) {
    return 'not_started';
  }
  if (filledItems >= totalItems) {
    return 'completed';
  }
  return 'in_progress';
}

/**
 * ChecklistDataService implementation
 */
class ChecklistDataService implements IChecklistDataService {
  private structure: ChecklistStructure;
  private orderedCategories: Array<{ section: Section; category: Category }>;
  
  constructor() {
    this.structure = checklistStructure;
    this.orderedCategories = getAllCategoriesInOrder();
  }
  
  /**
   * Get the complete checklist structure
   * @returns ChecklistStructure
   */
  getStructure(): ChecklistStructure {
    return this.structure;
  }
  
  /**
   * Validate an item value against its definition
   * @param item - Item definition
   * @param value - Value to validate
   * @returns ValidationResult
   */
  validateItem(item: ItemDefinition, value: ItemValue): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Check required field
    if (item.required && !isValueFilled(value)) {
      errors.push({
        field: item.id,
        message: `${item.label} is required`
      });
    }
    
    // Type-specific validation
    if (isValueFilled(value) && typeof value === 'string') {
      switch (item.type) {
        case 'email':
          if (!isValidEmail(value)) {
            errors.push({
              field: item.id,
              message: `${item.label} must be a valid email address`
            });
          }
          break;
        case 'url':
          if (!isValidUrl(value)) {
            errors.push({
              field: item.id,
              message: `${item.label} must be a valid URL`
            });
          }
          break;
        case 'tel':
          if (!isValidPhone(value)) {
            errors.push({
              field: item.id,
              message: `${item.label} must be a valid phone number`
            });
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            errors.push({
              field: item.id,
              message: `${item.label} must be a valid number`
            });
          }
          break;
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Calculate progress state from checklist data
   * 
   * Progress Calculation Rules (Property 7):
   * - The overall progress percentage equals the weighted average of all Section progresses
   * - Each Section progress equals the average of its Category progresses
   * - A Category with at least one filled Item has status "in_progress"
   * - A Category with all Items filled has status "completed"
   * - A Category with no Items filled has status "not_started"
   * 
   * @param data - ChecklistData to calculate progress from
   * @returns ProgressState
   */
  calculateProgress(data: ChecklistData): ProgressState {
    const sections: Record<string, SectionProgress> = {};
    let totalSectionProgress = 0;
    let sectionCount = 0;
    
    // Calculate progress for each section
    for (const section of this.structure.sections) {
      const sectionData = data.sections?.[section.id];
      const categories: Record<string, CategoryProgress> = {};
      let totalCategoryProgress = 0;
      let categoryCount = 0;
      
      // Calculate progress for each category in the section
      for (const category of section.categories) {
        const categoryData = sectionData?.categories?.[category.id];
        const { filledItems, totalItems } = countFilledItems(category, categoryData);
        
        // Calculate category progress percentage
        const progress = totalItems > 0 ? Math.round((filledItems / totalItems) * 100) : 0;
        const status = determineStatus(filledItems, totalItems);
        
        categories[category.id] = {
          progress,
          status,
          filledItems,
          totalItems
        };
        
        totalCategoryProgress += progress;
        categoryCount++;
      }
      
      // Calculate section progress as average of category progresses
      const sectionProgress = categoryCount > 0 
        ? Math.round(totalCategoryProgress / categoryCount) 
        : 0;
      
      // Determine section status based on category statuses
      const categoryStatuses = Object.values(categories).map(c => c.status);
      let sectionStatus: ProgressStatus;
      
      if (categoryStatuses.every(s => s === 'completed')) {
        sectionStatus = 'completed';
      } else if (categoryStatuses.every(s => s === 'not_started')) {
        sectionStatus = 'not_started';
      } else {
        sectionStatus = 'in_progress';
      }
      
      sections[section.id] = {
        progress: sectionProgress,
        status: sectionStatus,
        categories
      };
      
      totalSectionProgress += sectionProgress;
      sectionCount++;
    }
    
    // Calculate overall progress as weighted average of section progresses
    const overall = sectionCount > 0 
      ? Math.round(totalSectionProgress / sectionCount) 
      : 0;
    
    // Get current position (first incomplete category or first category)
    const currentPosition = this.findCurrentPosition(sections);
    
    return {
      overall,
      sections,
      currentPosition,
      mode: 'guided', // Default mode
      lastVisited: new Date().toISOString()
    };
  }
  
  /**
   * Get the next category in the predefined order
   * @param currentPath - Current path in format "sectionId/categoryId"
   * @returns Next category path or null if at the end
   */
  getNextCategory(currentPath: string): string | null {
    const parsed = parsePath(currentPath);
    if (!parsed) {
      return null;
    }
    
    const currentIndex = this.orderedCategories.findIndex(
      item => item.section.id === parsed.sectionId && item.category.id === parsed.categoryId
    );
    
    if (currentIndex === -1 || currentIndex >= this.orderedCategories.length - 1) {
      return null;
    }
    
    const next = this.orderedCategories[currentIndex + 1];
    return buildPath(next.section.id, next.category.id);
  }
  
  /**
   * Get the previous category in the predefined order
   * @param currentPath - Current path in format "sectionId/categoryId"
   * @returns Previous category path or null if at the beginning
   */
  getPrevCategory(currentPath: string): string | null {
    const parsed = parsePath(currentPath);
    if (!parsed) {
      return null;
    }
    
    const currentIndex = this.orderedCategories.findIndex(
      item => item.section.id === parsed.sectionId && item.category.id === parsed.categoryId
    );
    
    if (currentIndex <= 0) {
      return null;
    }
    
    const prev = this.orderedCategories[currentIndex - 1];
    return buildPath(prev.section.id, prev.category.id);
  }
  
  /**
   * Find the current position (first incomplete category or first category)
   * @param sections - Section progress data
   * @returns CurrentPosition
   */
  private findCurrentPosition(sections: Record<string, SectionProgress>): { sectionId: string; categoryId: string } {
    // Find first incomplete category
    for (const { section, category } of this.orderedCategories) {
      const sectionProgress = sections[section.id];
      if (sectionProgress) {
        const categoryProgress = sectionProgress.categories[category.id];
        if (categoryProgress && categoryProgress.status !== 'completed') {
          return { sectionId: section.id, categoryId: category.id };
        }
      }
    }
    
    // If all completed or no data, return first category
    if (this.orderedCategories.length > 0) {
      const first = this.orderedCategories[0];
      return { sectionId: first.section.id, categoryId: first.category.id };
    }
    
    // Fallback (should never happen with valid structure)
    return { sectionId: '', categoryId: '' };
  }
}

// Validation helper functions
function isValidEmail(value: string): boolean {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

function isValidUrl(value: string): boolean {
  // Basic URL validation - allows domain names without protocol
  try {
    // Try with protocol first
    if (value.startsWith('http://') || value.startsWith('https://')) {
      new URL(value);
      return true;
    }
    // Try adding protocol for domain-only values
    new URL(`https://${value}`);
    return true;
  } catch {
    return false;
  }
}

function isValidPhone(value: string): boolean {
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\d\s\-+().]+$/;
  return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 7;
}

// Export singleton instance
export const checklistDataService = new ChecklistDataService();

// Export class for testing
export { ChecklistDataService };
