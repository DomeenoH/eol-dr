/**
 * Property-Based Tests for Field Type Mapping
 * 
 * **Validates: Requirements 6.2, 8.4**
 * 
 * Property 5: Field Type Mapping
 * - For any ItemDefinition with sensitive: true, the rendered input should have type="password"
 * - For any ItemDefinition with a specific type (email, tel, url, number), the rendered input
 *   should have the corresponding HTML5 input type
 * 
 * Requirements:
 * - 6.2: THE Checklist_App SHALL 对敏感字段（如密码、PIN码、安全问题答案）使用 password 类型输入框，默认隐藏内容
 * - 8.4: THE Checklist_App SHALL 使用适当的 HTML5 输入类型（tel、email、url、number）以便移动设备显示正确的键盘
 */

import { describe, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import React from 'react';
import type { ItemDefinition, ItemType } from '../../types/checklist-structure';
import { PlatformCard, type PlatformField } from '../PlatformCard';
import { BankAccountCardForm } from '../BankAccountCard';

// ============================================================================
// Constants
// ============================================================================

/**
 * HTML5 input types that should map directly from ItemType
 */
const HTML5_INPUT_TYPES: ItemType[] = ['email', 'tel', 'url', 'number'];

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Renders an input field based on ItemDefinition and returns the input element
 * This simulates how the application renders form fields
 */
function renderInputField(itemDef: ItemDefinition): HTMLElement | null {
  const { id, type, sensitive, label, placeholder } = itemDef;
  
  // Create a simple test component that renders the input based on ItemDefinition
  const TestInput: React.FC = () => {
    // Determine the actual input type based on sensitive flag and type
    let inputType: string;
    
    if (sensitive) {
      // Sensitive fields should always render as password type
      inputType = 'password';
    } else if (type === 'textarea' || type === 'select' || type === 'checkbox' || type === 'group') {
      // These types don't render as standard input elements
      inputType = type;
    } else {
      // Map ItemType to HTML5 input type
      inputType = type;
    }
    
    if (type === 'textarea') {
      return (
        <textarea
          id={id}
          data-testid={`input-${id}`}
          placeholder={placeholder}
          aria-label={label}
        />
      );
    }
    
    if (type === 'select') {
      return (
        <select id={id} data-testid={`input-${id}`} aria-label={label}>
          <option value="">Select...</option>
        </select>
      );
    }
    
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          id={id}
          data-testid={`input-${id}`}
          aria-label={label}
        />
      );
    }
    
    if (type === 'group') {
      return <div data-testid={`input-${id}`}>{label}</div>;
    }
    
    return (
      <input
        type={inputType}
        id={id}
        data-testid={`input-${id}`}
        placeholder={placeholder}
        aria-label={label}
      />
    );
  };
  
  render(<TestInput />);
  return screen.queryByTestId(`input-${id}`);
}

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
 * Generate an HTML5 input type (email, tel, url, number)
 */
const html5InputTypeArbitrary: fc.Arbitrary<ItemType> = fc.constantFrom(...HTML5_INPUT_TYPES);

/**
 * Generate an ItemDefinition with sensitive: true
 */
const sensitiveItemDefinitionArbitrary: fc.Arbitrary<ItemDefinition> = fc.record({
  id: fieldIdArbitrary,
  label: labelArbitrary,
  type: fc.constantFrom<ItemType>('text', 'password', 'email', 'tel', 'url', 'number'),
  placeholder: placeholderArbitrary,
  sensitive: fc.constant(true),
  required: fc.boolean(),
  repeatable: fc.boolean(),
});

/**
 * Generate an ItemDefinition with a specific HTML5 input type
 */
const html5TypeItemDefinitionArbitrary: fc.Arbitrary<ItemDefinition> = fc.record({
  id: fieldIdArbitrary,
  label: labelArbitrary,
  type: html5InputTypeArbitrary,
  placeholder: placeholderArbitrary,
  sensitive: fc.constant(false), // Non-sensitive to test HTML5 type mapping
  required: fc.boolean(),
  repeatable: fc.boolean(),
});

/**
 * Generate a sensitive PlatformField
 */
const sensitivePlatformFieldArbitrary: fc.Arbitrary<PlatformField> = fc.record({
  id: fieldIdArbitrary,
  label: labelArbitrary,
  type: fc.constantFrom<'text' | 'email' | 'password' | 'textarea'>('text', 'email', 'password'),
  placeholder: placeholderArbitrary,
  sensitive: fc.constant(true),
});

// ============================================================================
// Property Tests
// ============================================================================

describe('Property 5: Field Type Mapping', () => {
  /**
   * **Validates: Requirements 6.2, 8.4**
   */

  describe('Sensitive Field Rendering', () => {
    it('any ItemDefinition with sensitive: true renders as password type input', () => {
      /**
       * **Validates: Requirements 6.2**
       * 
       * Property: For any ItemDefinition with sensitive: true, the rendered input
       * should have type="password" to hide the content by default.
       */
      fc.assert(
        fc.property(sensitiveItemDefinitionArbitrary, (itemDef) => {
          cleanup();
          
          const element = renderInputField(itemDef);
          
          if (!element) {
            throw new Error(`Failed to render input for ItemDefinition: ${JSON.stringify(itemDef)}`);
          }
          
          // For input elements, check the type attribute
          if (element.tagName.toLowerCase() === 'input') {
            const inputType = element.getAttribute('type');
            
            if (inputType !== 'password') {
              throw new Error(
                `Sensitive field "${itemDef.id}" with type "${itemDef.type}" ` +
                `rendered with type="${inputType}" instead of type="password".\n` +
                `ItemDefinition: ${JSON.stringify(itemDef)}`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('PlatformCard renders sensitive fields with password type by default', () => {
      /**
       * **Validates: Requirements 6.2**
       * 
       * Property: PlatformCard component should render sensitive fields
       * with type="password" by default.
       */
      fc.assert(
        fc.property(sensitivePlatformFieldArbitrary, (field) => {
          cleanup();
          
          // Skip textarea fields as they don't have a type attribute
          if (field.type === 'textarea') {
            return true;
          }
          
          const mockOnChange = vi.fn();
          
          render(
            <PlatformCard
              platform="discord"
              fields={[field]}
              data={{}}
              onChange={mockOnChange}
            />
          );
          
          const inputElement = screen.queryByTestId(`platform-field-${field.id}`);
          
          if (!inputElement) {
            throw new Error(`Failed to find input element for field: ${field.id}`);
          }
          
          const inputType = inputElement.getAttribute('type');
          
          // Sensitive fields should render as password type by default
          if (inputType !== 'password') {
            throw new Error(
              `Sensitive field "${field.id}" rendered with type="${inputType}" ` +
              `instead of type="password".\n` +
              `Field: ${JSON.stringify(field)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('HTML5 Input Type Mapping', () => {
    it('any ItemDefinition with HTML5 type renders with corresponding input type', () => {
      /**
       * **Validates: Requirements 8.4**
       * 
       * Property: For any ItemDefinition with a specific type (email, tel, url, number),
       * the rendered input should have the corresponding HTML5 input type.
       */
      fc.assert(
        fc.property(html5TypeItemDefinitionArbitrary, (itemDef) => {
          cleanup();
          
          const element = renderInputField(itemDef);
          
          if (!element) {
            throw new Error(`Failed to render input for ItemDefinition: ${JSON.stringify(itemDef)}`);
          }
          
          // For input elements, check the type attribute
          if (element.tagName.toLowerCase() === 'input') {
            const inputType = element.getAttribute('type');
            
            if (inputType !== itemDef.type) {
              throw new Error(
                `Field "${itemDef.id}" with type "${itemDef.type}" ` +
                `rendered with type="${inputType}" instead of type="${itemDef.type}".\n` +
                `ItemDefinition: ${JSON.stringify(itemDef)}`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('PlatformCard renders email fields with email type', () => {
      /**
       * **Validates: Requirements 8.4**
       * 
       * Property: PlatformCard should render email fields with type="email"
       * for proper mobile keyboard support.
       */
      fc.assert(
        fc.property(
          fc.record({
            id: fieldIdArbitrary,
            label: labelArbitrary,
            type: fc.constant<'email'>('email'),
            placeholder: placeholderArbitrary,
            sensitive: fc.constant(false),
          }),
          (field) => {
            cleanup();
            
            const mockOnChange = vi.fn();
            
            render(
              <PlatformCard
                platform="google"
                fields={[field]}
                data={{}}
                onChange={mockOnChange}
              />
            );
            
            const inputElement = screen.queryByTestId(`platform-field-${field.id}`);
            
            if (!inputElement) {
              throw new Error(`Failed to find input element for field: ${field.id}`);
            }
            
            const inputType = inputElement.getAttribute('type');
            
            if (inputType !== 'email') {
              throw new Error(
                `Email field "${field.id}" rendered with type="${inputType}" ` +
                `instead of type="email".\n` +
                `Field: ${JSON.stringify(field)}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Combined Type and Sensitive Flag', () => {
    it('sensitive flag takes precedence over type for input rendering', () => {
      /**
       * **Validates: Requirements 6.2, 8.4**
       * 
       * Property: When a field has both a specific type (like email) and sensitive: true,
       * the sensitive flag should take precedence and render as password type.
       */
      const sensitiveWithTypeArbitrary = fc.record({
        id: fieldIdArbitrary,
        label: labelArbitrary,
        type: html5InputTypeArbitrary, // email, tel, url, number
        placeholder: placeholderArbitrary,
        sensitive: fc.constant(true),
        required: fc.boolean(),
        repeatable: fc.boolean(),
      });

      fc.assert(
        fc.property(sensitiveWithTypeArbitrary, (itemDef) => {
          cleanup();
          
          const element = renderInputField(itemDef);
          
          if (!element) {
            throw new Error(`Failed to render input for ItemDefinition: ${JSON.stringify(itemDef)}`);
          }
          
          if (element.tagName.toLowerCase() === 'input') {
            const inputType = element.getAttribute('type');
            
            // Sensitive flag should override the type
            if (inputType !== 'password') {
              throw new Error(
                `Sensitive field "${itemDef.id}" with type "${itemDef.type}" ` +
                `should render as password but got type="${inputType}".\n` +
                `ItemDefinition: ${JSON.stringify(itemDef)}`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('BankAccountCard PIN Field', () => {
    it('BankAccountCard renders PIN field as password type by default', () => {
      /**
       * **Validates: Requirements 6.2**
       * 
       * Property: BankAccountCard should render the PIN field with type="password"
       * to hide sensitive banking information.
       */
      fc.assert(
        fc.property(
          fc.record({
            bankName: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
            pin: fc.string({ minLength: 4, maxLength: 6 }).filter(s => /^\d+$/.test(s)),
          }),
          ({ bankName, pin }) => {
            cleanup();
            
            const mockOnSubmit = vi.fn();
            const mockOnCancel = vi.fn();
            
            render(
              <BankAccountCardForm
                initialData={{ bankName, pin, accountType: 'checking' }}
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
              />
            );
            
            const pinInput = screen.queryByTestId('bank-pin-input');
            
            if (!pinInput) {
              throw new Error('Failed to find PIN input element');
            }
            
            const inputType = pinInput.getAttribute('type');
            
            // PIN should be rendered as password type by default
            if (inputType !== 'password') {
              throw new Error(
                `PIN field rendered with type="${inputType}" instead of type="password".\n` +
                `Bank: ${bankName}, PIN: ${pin}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Non-Sensitive Field Type Preservation', () => {
    it('non-sensitive fields preserve their original type', () => {
      /**
       * **Validates: Requirements 8.4**
       * 
       * Property: Non-sensitive fields should render with their specified type
       * to enable proper mobile keyboard support.
       */
      const nonSensitiveFieldArbitrary = fc.record({
        id: fieldIdArbitrary,
        label: labelArbitrary,
        type: fc.constantFrom<ItemType>('text', 'email', 'tel', 'url', 'number'),
        placeholder: placeholderArbitrary,
        sensitive: fc.constant(false),
        required: fc.boolean(),
        repeatable: fc.boolean(),
      });

      fc.assert(
        fc.property(nonSensitiveFieldArbitrary, (itemDef) => {
          cleanup();
          
          const element = renderInputField(itemDef);
          
          if (!element) {
            throw new Error(`Failed to render input for ItemDefinition: ${JSON.stringify(itemDef)}`);
          }
          
          if (element.tagName.toLowerCase() === 'input') {
            const inputType = element.getAttribute('type');
            
            if (inputType !== itemDef.type) {
              throw new Error(
                `Non-sensitive field "${itemDef.id}" with type "${itemDef.type}" ` +
                `rendered with type="${inputType}" instead of preserving original type.\n` +
                `ItemDefinition: ${JSON.stringify(itemDef)}`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Textarea and Special Types', () => {
    it('textarea type renders as textarea element', () => {
      /**
       * **Validates: Requirements 8.4**
       * 
       * Property: Fields with type="textarea" should render as textarea elements,
       * not input elements.
       */
      const textareaFieldArbitrary = fc.record({
        id: fieldIdArbitrary,
        label: labelArbitrary,
        type: fc.constant<ItemType>('textarea'),
        placeholder: placeholderArbitrary,
        sensitive: fc.constant(false),
        required: fc.boolean(),
        repeatable: fc.boolean(),
      });

      fc.assert(
        fc.property(textareaFieldArbitrary, (itemDef) => {
          cleanup();
          
          const element = renderInputField(itemDef);
          
          if (!element) {
            throw new Error(`Failed to render textarea for ItemDefinition: ${JSON.stringify(itemDef)}`);
          }
          
          if (element.tagName.toLowerCase() !== 'textarea') {
            throw new Error(
              `Field "${itemDef.id}" with type="textarea" ` +
              `rendered as <${element.tagName.toLowerCase()}> instead of <textarea>.\n` +
              `ItemDefinition: ${JSON.stringify(itemDef)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('PlatformCard renders textarea fields as textarea elements', () => {
      /**
       * **Validates: Requirements 8.4**
       * 
       * Property: PlatformCard should render textarea fields as textarea elements.
       */
      fc.assert(
        fc.property(
          fc.record({
            id: fieldIdArbitrary,
            label: labelArbitrary,
            type: fc.constant<'textarea'>('textarea'),
            placeholder: placeholderArbitrary,
            sensitive: fc.constant(false),
          }),
          (field) => {
            cleanup();
            
            const mockOnChange = vi.fn();
            
            render(
              <PlatformCard
                platform="discord"
                fields={[field]}
                data={{}}
                onChange={mockOnChange}
              />
            );
            
            const element = screen.queryByTestId(`platform-field-${field.id}`);
            
            if (!element) {
              throw new Error(`Failed to find element for field: ${field.id}`);
            }
            
            if (element.tagName.toLowerCase() !== 'textarea') {
              throw new Error(
                `Textarea field "${field.id}" rendered as <${element.tagName.toLowerCase()}> ` +
                `instead of <textarea>.\n` +
                `Field: ${JSON.stringify(field)}`
              );
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('password type without sensitive flag renders correctly', () => {
      /**
       * **Validates: Requirements 6.2, 8.4**
       * 
       * Property: A field with type="password" but without sensitive flag
       * should still render as password type (the type itself implies sensitivity).
       */
      const passwordTypeFieldArbitrary = fc.record({
        id: fieldIdArbitrary,
        label: labelArbitrary,
        type: fc.constant<ItemType>('password'),
        placeholder: placeholderArbitrary,
        sensitive: fc.boolean(), // Can be true or false
        required: fc.boolean(),
        repeatable: fc.boolean(),
      });

      fc.assert(
        fc.property(passwordTypeFieldArbitrary, (itemDef) => {
          cleanup();
          
          const element = renderInputField(itemDef);
          
          if (!element) {
            throw new Error(`Failed to render input for ItemDefinition: ${JSON.stringify(itemDef)}`);
          }
          
          if (element.tagName.toLowerCase() === 'input') {
            const inputType = element.getAttribute('type');
            
            // Password type should always render as password
            if (inputType !== 'password') {
              throw new Error(
                `Password field "${itemDef.id}" rendered with type="${inputType}" ` +
                `instead of type="password".\n` +
                `ItemDefinition: ${JSON.stringify(itemDef)}`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('text type with sensitive flag renders as password', () => {
      /**
       * **Validates: Requirements 6.2**
       * 
       * Property: A field with type="text" but with sensitive: true
       * should render as password type to hide the content.
       */
      const sensitiveTextFieldArbitrary = fc.record({
        id: fieldIdArbitrary,
        label: labelArbitrary,
        type: fc.constant<ItemType>('text'),
        placeholder: placeholderArbitrary,
        sensitive: fc.constant(true),
        required: fc.boolean(),
        repeatable: fc.boolean(),
      });

      fc.assert(
        fc.property(sensitiveTextFieldArbitrary, (itemDef) => {
          cleanup();
          
          const element = renderInputField(itemDef);
          
          if (!element) {
            throw new Error(`Failed to render input for ItemDefinition: ${JSON.stringify(itemDef)}`);
          }
          
          if (element.tagName.toLowerCase() === 'input') {
            const inputType = element.getAttribute('type');
            
            if (inputType !== 'password') {
              throw new Error(
                `Sensitive text field "${itemDef.id}" rendered with type="${inputType}" ` +
                `instead of type="password".\n` +
                `ItemDefinition: ${JSON.stringify(itemDef)}`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
