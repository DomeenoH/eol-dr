/**
 * Unit Tests for ExportService
 * Tests for toJSON(), fromJSON(), toMarkdown(), toHTML(), downloadFile()
 * 
 * Requirements: 4.1-4.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExportService, ExportError } from '../ExportService';
import type { ChecklistData, ExportedData } from '../../types/checklist-data';
import type { ProgressState } from '../../types/progress';

describe('ExportService', () => {
  let service: ExportService;

  // Sample test data
  const sampleChecklistData: ChecklistData = {
    version: '1.0.0',
    lastModified: '2024-01-15T10:00:00.000Z',
    sections: {
      'emergency-contacts': {
        categories: {
          'contact-list': {
            items: {
              'contact': [
                { platform: 'whatsapp', names: 'John Doe', notes: 'Best friend' },
                { platform: 'imessage', names: 'Jane Smith', notes: '' }
              ]
            }
          }
        }
      },
      'tech': {
        categories: {
          'emails': {
            items: {
              'email-account': [
                { email: 'test@example.com', 'password-location': 'KeePass', notes: 'Primary email' }
              ],
              'email-tips': 'Forward all emails to primary'
            }
          },
          'password-managers': {
            items: {
              'password-manager': [
                { name: 'KeePass', 'master-password': 'secret123', location: '/path/to/db' }
              ]
            }
          }
        }
      }
    }
  };

  const sampleProgressState: ProgressState = {
    overall: 25,
    sections: {
      'emergency-contacts': {
        progress: 50,
        status: 'in_progress',
        categories: {
          'contact-list': {
            progress: 100,
            status: 'completed',
            filledItems: 1,
            totalItems: 1
          }
        }
      }
    },
    currentPosition: {
      sectionId: 'emergency-contacts',
      categoryId: 'contact-list'
    },
    mode: 'guided',
    lastVisited: '2024-01-15T10:00:00.000Z'
  };

  const emptyChecklistData: ChecklistData = {
    version: '1.0.0',
    lastModified: '2024-01-15T10:00:00.000Z',
    sections: {}
  };

  beforeEach(() => {
    service = new ExportService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('toJSON()', () => {
    it('should export checklist data to valid JSON string', () => {
      const json = service.toJSON(sampleChecklistData);
      
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include metadata with export timestamp', () => {
      const beforeExport = new Date().toISOString();
      const json = service.toJSON(sampleChecklistData);
      const afterExport = new Date().toISOString();
      
      const parsed = JSON.parse(json) as ExportedData;
      
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.exportedAt).toBeDefined();
      expect(parsed.metadata.exportedAt >= beforeExport).toBe(true);
      expect(parsed.metadata.exportedAt <= afterExport).toBe(true);
    });

    it('should include version information in metadata', () => {
      const json = service.toJSON(sampleChecklistData);
      const parsed = JSON.parse(json) as ExportedData;
      
      expect(parsed.metadata.version).toBe('1.0.0');
      expect(parsed.metadata.appVersion).toBe('1.0.0');
    });

    it('should include the original data', () => {
      const json = service.toJSON(sampleChecklistData);
      const parsed = JSON.parse(json) as ExportedData;
      
      expect(parsed.data).toEqual(sampleChecklistData);
    });

    it('should include progress state when provided', () => {
      const json = service.toJSON(sampleChecklistData, sampleProgressState);
      const parsed = JSON.parse(json) as ExportedData;
      
      expect(parsed.progress).toEqual(sampleProgressState);
    });

    it('should include default progress state when not provided', () => {
      const json = service.toJSON(sampleChecklistData);
      const parsed = JSON.parse(json) as ExportedData;
      
      expect(parsed.progress).toBeDefined();
      expect(parsed.progress.overall).toBe(0);
      expect(parsed.progress.mode).toBe('guided');
    });

    it('should handle empty checklist data', () => {
      const json = service.toJSON(emptyChecklistData);
      const parsed = JSON.parse(json) as ExportedData;
      
      expect(parsed.data.sections).toEqual({});
    });

    it('should produce formatted JSON with indentation', () => {
      const json = service.toJSON(sampleChecklistData);
      
      // Formatted JSON should have newlines
      expect(json).toContain('\n');
      // And indentation
      expect(json).toContain('  ');
    });
  });

  describe('fromJSON()', () => {
    it('should parse valid ExportedData JSON', () => {
      const json = service.toJSON(sampleChecklistData, sampleProgressState);
      const result = service.fromJSON(json);
      
      expect(result.data).toEqual(sampleChecklistData);
      expect(result.progress).toEqual(sampleProgressState);
    });

    it('should parse legacy ChecklistData format', () => {
      const legacyJson = JSON.stringify(sampleChecklistData);
      const result = service.fromJSON(legacyJson);
      
      expect(result.data).toEqual(sampleChecklistData);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.version).toBe('1.0.0');
    });

    it('should throw ExportError for invalid JSON', () => {
      expect(() => service.fromJSON('invalid json {{{'))
        .toThrow(ExportError);
      
      try {
        service.fromJSON('invalid json');
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        expect((error as ExportError).code).toBe('INVALID_JSON');
      }
    });

    it('should throw ExportError for non-object JSON', () => {
      expect(() => service.fromJSON('"just a string"'))
        .toThrow(ExportError);
      
      try {
        service.fromJSON('"just a string"');
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        expect((error as ExportError).code).toBe('INVALID_STRUCTURE');
      }
    });

    it('should throw ExportError for null JSON', () => {
      expect(() => service.fromJSON('null'))
        .toThrow(ExportError);
      
      try {
        service.fromJSON('null');
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        expect((error as ExportError).code).toBe('INVALID_STRUCTURE');
      }
    });

    it('should throw ExportError for unrecognized structure', () => {
      const invalidStructure = JSON.stringify({ foo: 'bar' });
      
      expect(() => service.fromJSON(invalidStructure))
        .toThrow(ExportError);
      
      try {
        service.fromJSON(invalidStructure);
      } catch (error) {
        expect(error).toBeInstanceOf(ExportError);
        expect((error as ExportError).code).toBe('INVALID_STRUCTURE');
      }
    });

    it('should throw ExportError for invalid metadata', () => {
      const invalidMetadata = JSON.stringify({
        metadata: { foo: 'bar' },
        data: sampleChecklistData
      });
      
      expect(() => service.fromJSON(invalidMetadata))
        .toThrow(ExportError);
    });

    it('should preserve all data through round-trip', () => {
      const json = service.toJSON(sampleChecklistData, sampleProgressState);
      const result = service.fromJSON(json);
      
      expect(result.data.sections).toEqual(sampleChecklistData.sections);
      expect(result.progress.overall).toBe(sampleProgressState.overall);
      expect(result.progress.mode).toBe(sampleProgressState.mode);
    });
  });

  describe('toMarkdown()', () => {
    it('should generate valid Markdown with header', () => {
      const markdown = service.toMarkdown(sampleChecklistData);
      
      expect(markdown).toContain('# End-of-life Disaster Response Checklist');
    });

    it('should include export timestamp', () => {
      const markdown = service.toMarkdown(sampleChecklistData);
      
      expect(markdown).toContain('导出时间:');
    });

    it('should include section headers', () => {
      const markdown = service.toMarkdown(sampleChecklistData);
      
      expect(markdown).toContain('## 紧急联系人');
      expect(markdown).toContain('## Tech 技术');
    });

    it('should include category headers', () => {
      const markdown = service.toMarkdown(sampleChecklistData);
      
      expect(markdown).toContain('### 联系人列表');
      expect(markdown).toContain('### Emails 邮箱');
    });

    it('should include filled item values', () => {
      const markdown = service.toMarkdown(sampleChecklistData);
      
      expect(markdown).toContain('John Doe');
      expect(markdown).toContain('test@example.com');
    });

    it('should mask sensitive values', () => {
      const markdown = service.toMarkdown(sampleChecklistData);
      
      // The master password should be masked
      expect(markdown).not.toContain('secret123');
      expect(markdown).toContain('*');
    });

    it('should handle empty checklist data', () => {
      const markdown = service.toMarkdown(emptyChecklistData);
      
      expect(markdown).toContain('# End-of-life Disaster Response Checklist');
      // Should still have the header but minimal content
    });

    it('should include repeatable item indices', () => {
      const markdown = service.toMarkdown(sampleChecklistData);
      
      // Should have numbered items for repeatable groups
      expect(markdown).toContain('**1.**');
      expect(markdown).toContain('**2.**');
    });

    it('should include field labels', () => {
      const markdown = service.toMarkdown(sampleChecklistData);
      
      expect(markdown).toContain('**通讯平台**');
      expect(markdown).toContain('**联系人姓名**');
    });
  });

  describe('toHTML()', () => {
    it('should generate valid HTML document', () => {
      const html = service.toHTML(sampleChecklistData);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    it('should include proper head section', () => {
      const html = service.toHTML(sampleChecklistData);
      
      expect(html).toContain('<head>');
      expect(html).toContain('<meta charset="UTF-8">');
      expect(html).toContain('<title>End-of-life Disaster Response Checklist</title>');
      expect(html).toContain('<style>');
    });

    it('should include export timestamp', () => {
      const html = service.toHTML(sampleChecklistData);
      
      expect(html).toContain('导出时间:');
      expect(html).toContain('export-info');
    });

    it('should include section content', () => {
      const html = service.toHTML(sampleChecklistData);
      
      expect(html).toContain('紧急联系人');
      expect(html).toContain('Tech 技术');
    });

    it('should include category content', () => {
      const html = service.toHTML(sampleChecklistData);
      
      expect(html).toContain('联系人列表');
      expect(html).toContain('Emails 邮箱');
    });

    it('should include filled item values', () => {
      const html = service.toHTML(sampleChecklistData);
      
      expect(html).toContain('John Doe');
      expect(html).toContain('test@example.com');
    });

    it('should mask sensitive values with special styling', () => {
      const html = service.toHTML(sampleChecklistData);
      
      // Should not contain the actual password
      expect(html).not.toContain('secret123');
      // Should have sensitive class for masked values
      expect(html).toContain('class="sensitive"');
    });

    it('should escape HTML special characters', () => {
      const dataWithSpecialChars: ChecklistData = {
        version: '1.0.0',
        lastModified: '2024-01-15T10:00:00.000Z',
        sections: {
          'tech': {
            categories: {
              'emails': {
                items: {
                  'email-tips': '<script>alert("xss")</script>'
                }
              }
            }
          }
        }
      };
      
      const html = service.toHTML(dataWithSpecialChars);
      
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should include print-friendly styles', () => {
      const html = service.toHTML(sampleChecklistData);
      
      expect(html).toContain('@media print');
    });

    it('should handle empty checklist data', () => {
      const html = service.toHTML(emptyChecklistData);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('End-of-life Disaster Response Checklist');
    });
  });

  describe('downloadFile()', () => {
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
    let mockAppendChild: ReturnType<typeof vi.fn>;
    let mockRemoveChild: ReturnType<typeof vi.fn>;
    let mockClick: ReturnType<typeof vi.fn>;
    let createdLink: HTMLAnchorElement | null = null;

    beforeEach(() => {
      mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
      mockRevokeObjectURL = vi.fn();
      mockClick = vi.fn();
      mockAppendChild = vi.fn();
      mockRemoveChild = vi.fn();

      // Mock URL methods
      (globalThis as typeof globalThis & { URL: typeof URL }).URL.createObjectURL = mockCreateObjectURL;
      (globalThis as typeof globalThis & { URL: typeof URL }).URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock document.createElement to capture the created link
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          createdLink = element as HTMLAnchorElement;
          vi.spyOn(element, 'click').mockImplementation(mockClick);
        }
        return element;
      });

      // Mock document.body methods
      vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
    });

    afterEach(() => {
      createdLink = null;
    });

    it('should create a Blob with the content', () => {
      const content = 'test content';
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      service.downloadFile(content, filename, mimeType);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      const blob = mockCreateObjectURL.mock.calls[0][0];
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe(mimeType);
    });

    it('should set correct filename on the link', () => {
      const content = 'test content';
      const filename = 'my-export.json';
      const mimeType = 'application/json';

      service.downloadFile(content, filename, mimeType);

      expect(createdLink).not.toBeNull();
      expect(createdLink!.download).toBe(filename);
    });

    it('should set href to the blob URL', () => {
      const content = 'test content';
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      service.downloadFile(content, filename, mimeType);

      expect(createdLink).not.toBeNull();
      expect(createdLink!.href).toContain('blob:test-url');
    });

    it('should trigger click on the link', () => {
      const content = 'test content';
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      service.downloadFile(content, filename, mimeType);

      expect(mockClick).toHaveBeenCalled();
    });

    it('should append and remove the link from document body', () => {
      const content = 'test content';
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      service.downloadFile(content, filename, mimeType);

      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    it('should revoke the object URL after download', () => {
      const content = 'test content';
      const filename = 'test.txt';
      const mimeType = 'text/plain';

      service.downloadFile(content, filename, mimeType);

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should handle JSON content correctly', () => {
      const json = service.toJSON(sampleChecklistData);
      const filename = 'checklist-backup.json';
      const mimeType = 'application/json';

      service.downloadFile(json, filename, mimeType);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(createdLink!.download).toBe(filename);
    });

    it('should handle HTML content correctly', () => {
      const html = service.toHTML(sampleChecklistData);
      const filename = 'checklist.html';
      const mimeType = 'text/html';

      service.downloadFile(html, filename, mimeType);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(createdLink!.download).toBe(filename);
    });

    it('should handle Markdown content correctly', () => {
      const markdown = service.toMarkdown(sampleChecklistData);
      const filename = 'checklist.md';
      const mimeType = 'text/markdown';

      service.downloadFile(markdown, filename, mimeType);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(createdLink!.download).toBe(filename);
    });
  });

  describe('ExportError', () => {
    it('should have correct name property', () => {
      const error = new ExportError('Test error', 'INVALID_JSON');
      expect(error.name).toBe('ExportError');
    });

    it('should have correct code property', () => {
      const error = new ExportError('Test error', 'INVALID_STRUCTURE');
      expect(error.code).toBe('INVALID_STRUCTURE');
    });

    it('should have correct message', () => {
      const error = new ExportError('Custom message', 'VERSION_MISMATCH');
      expect(error.message).toBe('Custom message');
    });

    it('should be instanceof Error', () => {
      const error = new ExportError('Test', 'UNKNOWN');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Data Round-Trip', () => {
    it('should preserve all data through JSON export/import cycle', () => {
      const json = service.toJSON(sampleChecklistData, sampleProgressState);
      const imported = service.fromJSON(json);

      expect(imported.data.sections).toEqual(sampleChecklistData.sections);
      expect(imported.data.version).toBe(sampleChecklistData.version);
    });

    it('should handle complex nested data structures', () => {
      const complexData: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'tech': {
            categories: {
              'emails': {
                items: {
                  'email-account': [
                    { email: 'test1@example.com', 'password-location': 'KeePass', notes: 'Primary', 'is-primary': true },
                    { email: 'test2@example.com', 'password-location': 'Bitwarden', notes: 'Secondary', 'is-primary': false }
                  ],
                  'email-tips': 'Forward all emails to primary'
                }
              },
              'password-managers': {
                items: {
                  'password-manager': [
                    { name: 'KeePass', 'master-password': 'master123', location: '/path/to/db', notes: 'Main manager' }
                  ]
                }
              }
            }
          },
          'input': {
            categories: {
              'bank-accounts': {
                items: {
                  'bank-account': [
                    { 'bank-name': 'Test Bank', 'account-type': 'checking', pin: '1234', features: 'Main account' }
                  ]
                }
              }
            }
          }
        }
      };

      const json = service.toJSON(complexData);
      const imported = service.fromJSON(json);

      expect(imported.data.sections).toEqual(complexData.sections);
    });

    it('should handle empty arrays in repeatable items', () => {
      const dataWithEmptyArrays: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'tech': {
            categories: {
              'emails': {
                items: {
                  'email-account': []
                }
              }
            }
          }
        }
      };

      const json = service.toJSON(dataWithEmptyArrays);
      const imported = service.fromJSON(json);

      expect(imported.data.sections.tech.categories.emails.items['email-account']).toEqual([]);
    });
  });
});
