/**
 * Checklist Structure Types
 * Static structure definitions for the checklist
 */

/**
 * Input field types supported by the application
 */
export type ItemType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'password'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'group';

/**
 * Definition of a single item/field in the checklist
 */
export interface ItemDefinition {
  /** Unique identifier for the item */
  id: string;
  /** Display label for the item */
  label: string;
  /** Input type for the field */
  type: ItemType;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Help text to guide the user */
  helpText?: string;
  /** Whether this field contains sensitive information (passwords, PINs, etc.) */
  sensitive?: boolean;
  /** Whether this field is required */
  required?: boolean;
  /** Whether multiple instances of this item can be added */
  repeatable?: boolean;
  /** Sub-fields for group/composite types */
  fields?: ItemDefinition[];
  /** Options for select type fields */
  options?: SelectOption[];
  /** 条件显示：当关联字段的值匹配时才显示此字段 */
  showWhen?: {
    /** 关联字段的 ID */
    fieldId: string;
    /** 匹配的值（可以是单个值或多个值） */
    value: string | string[];
  };
}

/**
 * Option for select type fields
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * A category within a section (e.g., "Emails" within "Tech")
 */
export interface Category {
  /** Unique identifier for the category */
  id: string;
  /** Display name for the category */
  name: string;
  /** Description text from the original checklist */
  description?: string;
  /** Additional help text for the category */
  helpText?: string;
  /** Items/fields within this category */
  items: ItemDefinition[];
}

/**
 * A major section of the checklist (e.g., "Tech", "Input", "Output")
 */
export interface Section {
  /** Unique identifier for the section */
  id: string;
  /** Display name for the section */
  name: string;
  /** Description of the section */
  description?: string;
  /** Categories within this section */
  categories: Category[];
}

/**
 * Complete checklist structure
 */
export interface ChecklistStructure {
  /** All sections in the checklist */
  sections: Section[];
}
