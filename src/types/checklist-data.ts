/**
 * Checklist Data Types
 * User-filled data structures
 */

/**
 * Primitive value types
 */
export type PrimitiveValue = string | number | boolean;

/**
 * Value type for a single item
 * Can be a primitive or a nested object for group types
 */
export interface ItemValueObject {
  [key: string]: PrimitiveValue | ItemValueObject;
}

export type ItemValue = PrimitiveValue | ItemValueObject;

/**
 * Data for a single category
 */
export interface CategoryData {
  /** Item values keyed by item ID */
  items: Record<string, ItemValue | ItemValue[]>;
}

/**
 * Data for a single section
 */
export interface SectionData {
  /** Category data keyed by category ID */
  categories: Record<string, CategoryData>;
}

/**
 * Complete user-filled checklist data
 */
export interface ChecklistData {
  /** Data format version for migration support */
  version: string;
  /** Last modification timestamp (ISO format) */
  lastModified: string;
  /** Section data keyed by section ID */
  sections: Record<string, SectionData>;
}

/**
 * Metadata for exported data
 */
export interface ExportMetadata {
  /** Export timestamp (ISO format) */
  exportedAt: string;
  /** Data format version */
  version: string;
  /** Application version */
  appVersion: string;
}

/**
 * Complete exported data package
 */
export interface ExportedData {
  /** Export metadata */
  metadata: ExportMetadata;
  /** Checklist data */
  data: ChecklistData;
  /** Progress state */
  progress: ProgressState;
}

// Import ProgressState for ExportedData
import type { ProgressState } from './progress';
