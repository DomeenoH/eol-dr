/**
 * Validation Types
 * Form validation results and errors
 */

/**
 * A single validation error
 */
export interface ValidationError {
  /** Field that has the error */
  field: string;
  /** Error message */
  message: string;
}

/**
 * Result of validating an item or form
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** List of validation errors (empty if valid) */
  errors: ValidationError[];
}
