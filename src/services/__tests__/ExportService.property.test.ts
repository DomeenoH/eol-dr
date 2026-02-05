/**
 * Property-Based Tests for ExportService Content Completeness
 * 
 * **Validates: Requirements 4.3, 4.4**
 * 
 * Property 4: Export Content Completeness
 * - For any ChecklistData object, the exported Markdown/HTML should contain all filled values
 *   (non-sensitive values should appear as-is, sensitive values should be masked)
 * - The export should include a valid timestamp
 */

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ExportService } from '../ExportService';
import type { ChecklistData, SectionData, CategoryData, ItemValue, ItemValueObject } from '../../types/checklist-data';

describe('Property 4: Export Content Completeness', () => {
  /**
   * **Validates: Requirements 4.3, 4.4**
   */
  
  let service: ExportService;
  
  beforeEach(() => {
    service = new ExportService();
  });

  // ============================================================================
  // Arbitraries (Generators) for ChecklistData
  // ============================================================================

  /**
   * Generate a primitive value (string, number, or boolean)
   */
  const primitiveValueArbitrary = fc.oneof(
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    fc.integer({ min: -1000000, max: 1000000 }),
    fc.boolean()
  );

  /**
   * Generate a non-empty string value (for testing content presence)
   */
  const nonEmptyStringArbitrary = fc.string({ minLength: 3, maxLength: 30 })
    .filter(s => s.trim().length >= 3 && /^[a-zA-Z0-9\u4e00-\u9fa5]/.test(s.trim()));

  /**
   * Generate an ItemValueObject (nested object with primitive values)
   */
  function createItemValueObjectArbitrary(depth: number = 0): fc.Arbitrary<ItemValueObject> {
    if (depth >= 2) {
      return fc.dictionary(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
        primitiveValueArbitrary
      ).filter(obj => Object.keys(obj).length > 0);
    }
    
    const nestedArbitrary = createItemValueObjectArbitrary(depth + 1);
    
    return fc.dictionary(
      fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
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
  const itemValueArrayArbitrary = fc.array(itemValueArbitrary, { minLength: 1, maxLength: 3 });

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

  /**
   * Generate ChecklistData with known structure matching the actual checklist
   * This ensures we test with data that matches the real structure
   */
  const realStructureChecklistDataArbitrary: fc.Arbitrary<ChecklistData> = fc.record({
    version: versionArbitrary,
    lastModified: isoTimestampArbitrary,
    sections: fc.record({
      'emergency-contacts': fc.record({
        categories: fc.record({
          'contact-list': fc.record({
            items: fc.record({
              'contact': fc.array(
                fc.record({
                  platform: fc.constantFrom('whatsapp', 'imessage', 'facebook', 'email'),
                  names: nonEmptyStringArbitrary,
                  notes: fc.string({ minLength: 0, maxLength: 50 })
                }),
                { minLength: 1, maxLength: 3 }
              )
            })
          })
        })
      }),
      'tech': fc.record({
        categories: fc.record({
          'emails': fc.record({
            items: fc.record({
              'email-account': fc.array(
                fc.record({
                  email: fc.emailAddress(),
                  'password-location': nonEmptyStringArbitrary,
                  notes: fc.string({ minLength: 0, maxLength: 50 })
                }),
                { minLength: 1, maxLength: 2 }
              ),
              'email-tips': fc.string({ minLength: 0, maxLength: 100 })
            })
          }),
          'password-managers': fc.record({
            items: fc.record({
              'password-manager': fc.array(
                fc.record({
                  name: nonEmptyStringArbitrary,
                  'master-password': fc.string({ minLength: 5, maxLength: 20 }), // sensitive
                  location: nonEmptyStringArbitrary
                }),
                { minLength: 1, maxLength: 2 }
              )
            })
          })
        })
      }),
      'input': fc.record({
        categories: fc.record({
          'bank-accounts': fc.record({
            items: fc.record({
              'bank-account': fc.array(
                fc.record({
                  'bank-name': nonEmptyStringArbitrary,
                  'account-type': fc.constantFrom('checking', 'savings', 'both'),
                  pin: fc.string({ minLength: 4, maxLength: 6 }).filter(s => /^\d+$/.test(s)), // sensitive
                  features: fc.string({ minLength: 0, maxLength: 100 })
                }),
                { minLength: 1, maxLength: 2 }
              )
            })
          })
        })
      })
    })
  });

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Keys that contain select values which get converted to labels in exports
   * These should not be checked for literal value presence
   */
  const selectKeys = new Set(['platform', 'action', 'account-type', 'device-type']);

  /**
   * Keys that contain sensitive values that should be masked
   */
  const sensitiveKeys = new Set(['master-password', 'pin', 'wifi-password', 'seed-phrase-location']);

  /**
   * Extract all non-empty string values from a nested object
   * Returns only non-sensitive values that should appear in exports
   * Excludes select field values since they get converted to labels
   */
  function extractNonSensitiveStringValues(obj: unknown): string[] {
    const values: string[] = [];
    
    function traverse(current: unknown, currentKey: string = ''): void {
      if (current === null || current === undefined) {
        return;
      }
      
      if (typeof current === 'string') {
        const trimmed = current.trim();
        // Only include non-empty strings that are:
        // - not sensitive
        // - not select field values (they get converted to labels)
        if (trimmed.length > 0 && !sensitiveKeys.has(currentKey) && !selectKeys.has(currentKey)) {
          values.push(trimmed);
        }
      } else if (typeof current === 'number') {
        values.push(String(current));
      } else if (typeof current === 'boolean') {
        // Booleans are rendered as checkmarks or specific text
        // We don't need to check for literal "true"/"false"
      } else if (Array.isArray(current)) {
        current.forEach(item => traverse(item, currentKey));
      } else if (typeof current === 'object') {
        for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
          traverse(value, key);
        }
      }
    }
    
    traverse(obj);
    return values;
  }

  /**
   * Check if export contains a timestamp indicator
   */
  function containsTimestamp(content: string): boolean {
    // Check for timestamp label and a date pattern
    const hasTimestampLabel = content.includes('导出时间') || content.includes('Export');
    // eslint-disable-next-line no-useless-escape
    const hasDatePattern = /\d{4}[\/\-]\d{2}[\/\-]\d{2}/.test(content);
    
    return hasTimestampLabel && hasDatePattern;
  }

  // ============================================================================
  // Property Tests: Markdown Export Content Completeness
  // ============================================================================

  describe('Markdown Export Content Completeness', () => {
    it('exported Markdown contains all non-sensitive filled string values', () => {
      /**
       * **Validates: Requirements 4.3, 4.4**
       * 
       * Property: For any ChecklistData, the exported Markdown should contain
       * all filled non-sensitive string values.
       */
      fc.assert(
        fc.property(realStructureChecklistDataArbitrary, (data) => {
          const markdown = service.toMarkdown(data);
          
          // Extract all non-sensitive string values from the data
          const nonSensitiveValues = extractNonSensitiveStringValues(data.sections);
          
          // Filter to only check values that are long enough to be meaningful
          // and don't contain special characters that might be escaped
          const checkableValues = nonSensitiveValues.filter(v => 
            v.length >= 3 && 
            /^[a-zA-Z0-9@.\u4e00-\u9fa5\s]+$/.test(v)
          );
          
          // Verify each non-sensitive value appears in the markdown
          for (const value of checkableValues) {
            if (!markdown.includes(value)) {
              throw new Error(
                `Non-sensitive value "${value}" not found in Markdown export.\n` +
                `Markdown (first 500 chars): ${markdown.substring(0, 500)}`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('exported Markdown includes valid timestamp', () => {
      /**
       * **Validates: Requirements 4.4**
       * 
       * Property: The exported Markdown should include a valid timestamp.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (data) => {
          const markdown = service.toMarkdown(data);
          
          if (!containsTimestamp(markdown)) {
            throw new Error(
              `Markdown export does not contain a valid timestamp.\n` +
              `Markdown (first 300 chars): ${markdown.substring(0, 300)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('exported Markdown masks sensitive values', () => {
      /**
       * **Validates: Requirements 4.3**
       * 
       * Property: Sensitive values (passwords, PINs) should be masked in the export.
       */
      fc.assert(
        fc.property(realStructureChecklistDataArbitrary, (data) => {
          const markdown = service.toMarkdown(data);
          
          // Check that sensitive values are not exposed
          const sensitiveValues: string[] = [];
          
          // Extract master passwords
          const passwordManagers = data.sections['tech']?.categories['password-managers']?.items['password-manager'];
          if (Array.isArray(passwordManagers)) {
            for (const pm of passwordManagers) {
              if (typeof pm === 'object' && pm !== null && 'master-password' in pm) {
                const pwd = (pm as Record<string, unknown>)['master-password'];
                if (typeof pwd === 'string' && pwd.length > 0) {
                  sensitiveValues.push(pwd);
                }
              }
            }
          }
          
          // Extract PINs
          const bankAccounts = data.sections['input']?.categories['bank-accounts']?.items['bank-account'];
          if (Array.isArray(bankAccounts)) {
            for (const account of bankAccounts) {
              if (typeof account === 'object' && account !== null && 'pin' in account) {
                const pin = (account as Record<string, unknown>)['pin'];
                if (typeof pin === 'string' && pin.length > 0) {
                  sensitiveValues.push(pin);
                }
              }
            }
          }
          
          // Verify sensitive values are not in the markdown (they should be masked)
          for (const sensitiveValue of sensitiveValues) {
            if (sensitiveValue.length >= 4 && markdown.includes(sensitiveValue)) {
              throw new Error(
                `Sensitive value "${sensitiveValue}" found unmasked in Markdown export.`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('exported Markdown contains header', () => {
      /**
       * **Validates: Requirements 4.3**
       * 
       * Property: The exported Markdown should contain the checklist header.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (data) => {
          const markdown = service.toMarkdown(data);
          
          if (!markdown.includes('# End-of-life Disaster Response Checklist')) {
            throw new Error('Markdown export missing header');
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Property Tests: HTML Export Content Completeness
  // ============================================================================

  describe('HTML Export Content Completeness', () => {
    it('exported HTML contains all non-sensitive filled string values', () => {
      /**
       * **Validates: Requirements 4.3, 4.4**
       * 
       * Property: For any ChecklistData, the exported HTML should contain
       * all filled non-sensitive string values.
       */
      fc.assert(
        fc.property(realStructureChecklistDataArbitrary, (data) => {
          const html = service.toHTML(data);
          
          // Extract all non-sensitive string values from the data
          const nonSensitiveValues = extractNonSensitiveStringValues(data.sections);
          
          // Filter to only check values that are long enough to be meaningful
          // and don't contain special characters that might be HTML-escaped
          const checkableValues = nonSensitiveValues.filter(v => 
            v.length >= 3 && 
            /^[a-zA-Z0-9@.\u4e00-\u9fa5\s]+$/.test(v)
          );
          
          // Verify each non-sensitive value appears in the HTML
          for (const value of checkableValues) {
            if (!html.includes(value)) {
              throw new Error(
                `Non-sensitive value "${value}" not found in HTML export.\n` +
                `HTML (first 500 chars): ${html.substring(0, 500)}`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('exported HTML includes valid timestamp', () => {
      /**
       * **Validates: Requirements 4.4**
       * 
       * Property: The exported HTML should include a valid timestamp.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (data) => {
          const html = service.toHTML(data);
          
          if (!containsTimestamp(html)) {
            throw new Error(
              `HTML export does not contain a valid timestamp.\n` +
              `HTML (first 300 chars): ${html.substring(0, 300)}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('exported HTML masks sensitive values', () => {
      /**
       * **Validates: Requirements 4.3**
       * 
       * Property: Sensitive values (passwords, PINs) should be masked in the HTML export.
       */
      fc.assert(
        fc.property(realStructureChecklistDataArbitrary, (data) => {
          const html = service.toHTML(data);
          
          // Check that sensitive values are not exposed
          const sensitiveValues: string[] = [];
          
          // Extract master passwords
          const passwordManagers = data.sections['tech']?.categories['password-managers']?.items['password-manager'];
          if (Array.isArray(passwordManagers)) {
            for (const pm of passwordManagers) {
              if (typeof pm === 'object' && pm !== null && 'master-password' in pm) {
                const pwd = (pm as Record<string, unknown>)['master-password'];
                if (typeof pwd === 'string' && pwd.length > 0) {
                  sensitiveValues.push(pwd);
                }
              }
            }
          }
          
          // Extract PINs
          const bankAccounts = data.sections['input']?.categories['bank-accounts']?.items['bank-account'];
          if (Array.isArray(bankAccounts)) {
            for (const account of bankAccounts) {
              if (typeof account === 'object' && account !== null && 'pin' in account) {
                const pin = (account as Record<string, unknown>)['pin'];
                if (typeof pin === 'string' && pin.length > 0) {
                  sensitiveValues.push(pin);
                }
              }
            }
          }
          
          // Verify sensitive values are not in the HTML (they should be masked)
          for (const sensitiveValue of sensitiveValues) {
            if (sensitiveValue.length >= 4 && html.includes(sensitiveValue)) {
              throw new Error(
                `Sensitive value "${sensitiveValue}" found unmasked in HTML export.`
              );
            }
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('exported HTML is valid HTML document', () => {
      /**
       * **Validates: Requirements 4.3**
       * 
       * Property: The exported HTML should be a valid HTML document.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (data) => {
          const html = service.toHTML(data);
          
          // Check for essential HTML structure
          if (!html.includes('<!DOCTYPE html>')) {
            throw new Error('HTML export missing DOCTYPE');
          }
          if (!html.includes('<html')) {
            throw new Error('HTML export missing <html> tag');
          }
          if (!html.includes('</html>')) {
            throw new Error('HTML export missing closing </html> tag');
          }
          if (!html.includes('<head>')) {
            throw new Error('HTML export missing <head> tag');
          }
          if (!html.includes('<body>')) {
            throw new Error('HTML export missing <body> tag');
          }
          if (!html.includes('<title>')) {
            throw new Error('HTML export missing <title> tag');
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('exported HTML contains print-friendly styles', () => {
      /**
       * **Validates: Requirements 4.3**
       * 
       * Property: The exported HTML should include print-friendly styles.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (data) => {
          const html = service.toHTML(data);
          
          if (!html.includes('@media print')) {
            throw new Error('HTML export missing print media query');
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // ============================================================================
  // Property Tests: JSON Export Content Completeness
  // ============================================================================

  describe('JSON Export Content Completeness', () => {
    it('exported JSON contains all original data', () => {
      /**
       * **Validates: Requirements 4.3, 4.4**
       * 
       * Property: The exported JSON should contain all original data.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (data) => {
          const json = service.toJSON(data);
          const parsed = JSON.parse(json);
          
          // Verify the data is preserved
          if (JSON.stringify(parsed.data.sections) !== JSON.stringify(data.sections)) {
            throw new Error('JSON export does not preserve all data');
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('exported JSON includes valid export timestamp in metadata', () => {
      /**
       * **Validates: Requirements 4.4**
       * 
       * Property: The exported JSON should include a valid timestamp in metadata.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (data) => {
          const beforeExport = new Date();
          const json = service.toJSON(data);
          const afterExport = new Date();
          
          const parsed = JSON.parse(json);
          
          // Verify metadata exists
          if (!parsed.metadata) {
            throw new Error('JSON export missing metadata');
          }
          
          // Verify exportedAt timestamp exists and is valid
          if (!parsed.metadata.exportedAt) {
            throw new Error('JSON export missing exportedAt timestamp');
          }
          
          const exportedAt = new Date(parsed.metadata.exportedAt);
          
          // Verify timestamp is within the export window
          if (exportedAt < beforeExport || exportedAt > afterExport) {
            throw new Error(
              `Export timestamp ${exportedAt.toISOString()} is outside expected range ` +
              `[${beforeExport.toISOString()}, ${afterExport.toISOString()}]`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('exported JSON includes version information', () => {
      /**
       * **Validates: Requirements 4.4**
       * 
       * Property: The exported JSON should include version information.
       */
      fc.assert(
        fc.property(checklistDataArbitrary, (data) => {
          const json = service.toJSON(data);
          const parsed = JSON.parse(json);
          
          if (!parsed.metadata.version) {
            throw new Error('JSON export missing version in metadata');
          }
          
          if (!parsed.metadata.appVersion) {
            throw new Error('JSON export missing appVersion in metadata');
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
    it('empty ChecklistData produces valid exports with timestamp', () => {
      /**
       * **Validates: Requirements 4.3, 4.4**
       * 
       * Property: Even empty ChecklistData should produce valid exports with timestamps.
       */
      const emptyDataArbitrary = fc.record({
        version: versionArbitrary,
        lastModified: isoTimestampArbitrary,
        sections: fc.constant({})
      });

      fc.assert(
        fc.property(emptyDataArbitrary, (data) => {
          const markdown = service.toMarkdown(data);
          const html = service.toHTML(data);
          const json = service.toJSON(data);
          
          // All exports should contain timestamps
          if (!containsTimestamp(markdown)) {
            throw new Error('Empty data Markdown export missing timestamp');
          }
          
          if (!containsTimestamp(html)) {
            throw new Error('Empty data HTML export missing timestamp');
          }
          
          const parsedJson = JSON.parse(json);
          if (!parsedJson.metadata.exportedAt) {
            throw new Error('Empty data JSON export missing timestamp');
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('special characters in values are handled correctly', () => {
      /**
       * **Validates: Requirements 4.3**
       * 
       * Property: Special characters should be properly escaped in HTML exports.
       */
      const specialCharsArbitrary = fc.constantFrom(
        '<script>alert("xss")</script>',
        '& ampersand',
        '"quotes"',
        "'apostrophe'",
        'normal text'
      );

      const dataWithSpecialCharsArbitrary = fc.record({
        version: versionArbitrary,
        lastModified: isoTimestampArbitrary,
        sections: fc.record({
          'tech': fc.record({
            categories: fc.record({
              'emails': fc.record({
                items: fc.record({
                  'email-tips': specialCharsArbitrary
                })
              })
            })
          })
        })
      });

      fc.assert(
        fc.property(dataWithSpecialCharsArbitrary, (data) => {
          const html = service.toHTML(data);
          
          // Verify no unescaped script tags
          if (html.includes('<script>') && !html.includes('&lt;script&gt;')) {
            throw new Error('HTML export contains unescaped script tag');
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('numeric values are included in exports', () => {
      /**
       * **Validates: Requirements 4.3**
       * 
       * Property: Numeric values should be converted to strings and included in exports.
       */
      const dataWithNumbersArbitrary = fc.record({
        version: versionArbitrary,
        lastModified: isoTimestampArbitrary,
        sections: fc.record({
          'test-section': fc.record({
            categories: fc.record({
              'test-category': fc.record({
                items: fc.record({
                  'numeric-item': fc.integer({ min: 1000, max: 9999 })
                })
              })
            })
          })
        })
      });

      fc.assert(
        fc.property(dataWithNumbersArbitrary, (data) => {
          const json = service.toJSON(data);
          const parsed = JSON.parse(json);
          
          const originalValue = data.sections['test-section']?.categories['test-category']?.items['numeric-item'];
          const exportedValue = parsed.data.sections['test-section']?.categories['test-category']?.items['numeric-item'];
          
          if (originalValue !== exportedValue) {
            throw new Error(
              `Numeric value not preserved. Original: ${originalValue}, Exported: ${exportedValue}`
            );
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
