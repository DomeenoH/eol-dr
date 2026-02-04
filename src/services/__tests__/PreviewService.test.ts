/**
 * PreviewService Unit Tests
 * 
 * Tests for generating preview documents and rendering to HTML
 * Requirements: 5.1-5.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PreviewService, PreviewDocument } from '../PreviewService';
import type { ChecklistData } from '../../types/checklist-data';

describe('PreviewService', () => {
  let service: PreviewService;

  beforeEach(() => {
    service = new PreviewService();
  });

  describe('generatePreview', () => {
    it('should generate a preview document with title and timestamp', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {},
      };

      const preview = service.generatePreview(data);

      expect(preview.title).toBe('End-of-life Disaster Response Checklist');
      expect(preview.generatedAt).toBeDefined();
      expect(new Date(preview.generatedAt).getTime()).not.toBeNaN();
    });

    it('should return empty sections array for empty data', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {},
      };

      const preview = service.generatePreview(data);

      expect(preview.sections).toEqual([]);
    });

    it('should include sections with filled data', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'contact-list': {
                items: {
                  'contact': [
                    {
                      platform: 'whatsapp',
                      names: 'John, Jane',
                      notes: 'Family members',
                    },
                  ],
                },
              },
            },
          },
        },
      };

      const preview = service.generatePreview(data);

      expect(preview.sections.length).toBeGreaterThan(0);
      expect(preview.sections[0].name).toBe('紧急联系人');
    });

    it('should exclude sections without filled data', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'contact-list': {
                items: {
                  'contact': [],
                },
              },
            },
          },
        },
      };

      const preview = service.generatePreview(data);

      // Should not include empty sections
      const emergencySection = preview.sections.find(s => s.name === '紧急联系人');
      expect(emergencySection).toBeUndefined();
    });

    it('should generate preview items for repeatable group fields', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'tech': {
            categories: {
              'emails': {
                items: {
                  'email-account': [
                    {
                      email: 'test@example.com',
                      'password-location': 'KeePass',
                      notes: 'Primary email',
                      'is-primary': true,
                    },
                    {
                      email: 'backup@example.com',
                      'password-location': 'KeePass',
                    },
                  ],
                },
              },
            },
          },
        },
      };

      const preview = service.generatePreview(data);

      const techSection = preview.sections.find(s => s.name === 'Tech 技术');
      expect(techSection).toBeDefined();
      
      const emailsCategory = techSection?.categories.find(c => c.name === 'Emails 邮箱');
      expect(emailsCategory).toBeDefined();
      expect(emailsCategory?.items.length).toBe(2);
      expect(emailsCategory?.items[0].label).toBe('邮箱账户 1');
      expect(emailsCategory?.items[1].label).toBe('邮箱账户 2');
    });

    it('should generate preview items for simple text fields', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'tech': {
            categories: {
              'wireless-network': {
                items: {
                  'wifi-name': 'MyNetwork',
                },
              },
            },
          },
        },
      };

      const preview = service.generatePreview(data);

      const techSection = preview.sections.find(s => s.name === 'Tech 技术');
      const networkCategory = techSection?.categories.find(c => c.name === 'Wireless Network 无线网络');
      
      expect(networkCategory).toBeDefined();
      const wifiItem = networkCategory?.items.find(i => i.label === 'WiFi 名称 (SSID)');
      expect(wifiItem).toBeDefined();
      expect(wifiItem?.value).toBe('MyNetwork');
    });

    it('should mark sensitive fields appropriately', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'tech': {
            categories: {
              'wireless-network': {
                items: {
                  'wifi-password': 'secretpassword123',
                },
              },
            },
          },
        },
      };

      const preview = service.generatePreview(data);

      const techSection = preview.sections.find(s => s.name === 'Tech 技术');
      const networkCategory = techSection?.categories.find(c => c.name === 'Wireless Network 无线网络');
      const passwordItem = networkCategory?.items.find(i => i.label === 'WiFi 密码');
      
      expect(passwordItem).toBeDefined();
      expect(passwordItem?.sensitive).toBe(true);
    });

    it('should handle select field values with labels', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'contact-list': {
                items: {
                  'contact': [
                    {
                      platform: 'whatsapp',
                      names: 'John',
                    },
                  ],
                },
              },
            },
          },
        },
      };

      const preview = service.generatePreview(data);

      const section = preview.sections.find(s => s.name === '紧急联系人');
      const category = section?.categories.find(c => c.name === '联系人列表');
      const contactItem = category?.items[0];
      
      expect(contactItem).toBeDefined();
      // The value should be an array of formatted field values
      expect(Array.isArray(contactItem?.value)).toBe(true);
      // Should contain the platform label "WhatsApp" not the value "whatsapp"
      const valueArray = contactItem?.value as string[];
      expect(valueArray.some(v => v.includes('WhatsApp'))).toBe(true);
    });

    it('should skip empty values in group fields', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'contact-list': {
                items: {
                  'contact': [
                    {
                      platform: 'whatsapp',
                      names: 'John',
                      notes: '', // Empty notes should be skipped
                    },
                  ],
                },
              },
            },
          },
        },
      };

      const preview = service.generatePreview(data);

      const section = preview.sections.find(s => s.name === '紧急联系人');
      const category = section?.categories.find(c => c.name === '联系人列表');
      const contactItem = category?.items[0];
      
      const valueArray = contactItem?.value as string[];
      // Should not include empty notes
      expect(valueArray.some(v => v.includes('备注'))).toBe(false);
    });
  });

  describe('renderToHTML', () => {
    it('should render a valid HTML document', () => {
      const preview: PreviewDocument = {
        title: 'Test Checklist',
        generatedAt: new Date().toISOString(),
        sections: [],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="zh-CN">');
      expect(html).toContain('</html>');
    });

    it('should include the title in the HTML', () => {
      const preview: PreviewDocument = {
        title: 'My Test Checklist',
        generatedAt: new Date().toISOString(),
        sections: [],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('My Test Checklist');
      expect(html).toContain('<title>My Test Checklist</title>');
    });

    it('should include the generated timestamp', () => {
      const timestamp = '2024-01-15T10:30:00.000Z';
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: timestamp,
        sections: [],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('生成时间:');
    });

    it('should render sections with names', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [
          {
            name: 'Test Section',
            categories: [],
          },
        ],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('Test Section');
      expect(html).toContain('<h2>');
    });

    it('should render section descriptions', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [
          {
            name: 'Test Section',
            description: 'This is a test description',
            categories: [],
          },
        ],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('This is a test description');
      expect(html).toContain('section-description');
    });

    it('should render categories with names', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [
          {
            name: 'Test Section',
            categories: [
              {
                name: 'Test Category',
                items: [],
              },
            ],
          },
        ],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('Test Category');
      expect(html).toContain('<h3>');
    });

    it('should render items with labels and values', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [
          {
            name: 'Test Section',
            categories: [
              {
                name: 'Test Category',
                items: [
                  {
                    label: 'Test Item',
                    value: 'Test Value',
                  },
                ],
              },
            ],
          },
        ],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('Test Item');
      expect(html).toContain('Test Value');
    });

    it('should render array values as lists', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [
          {
            name: 'Test Section',
            categories: [
              {
                name: 'Test Category',
                items: [
                  {
                    label: 'Test Item',
                    value: ['Value 1', 'Value 2', 'Value 3'],
                  },
                ],
              },
            ],
          },
        ],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('<ul');
      expect(html).toContain('<li>Value 1</li>');
      expect(html).toContain('<li>Value 2</li>');
      expect(html).toContain('<li>Value 3</li>');
    });

    it('should mask sensitive values by default', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [
          {
            name: 'Test Section',
            categories: [
              {
                name: 'Test Category',
                items: [
                  {
                    label: 'Password',
                    value: 'secretpassword',
                    sensitive: true,
                  },
                ],
              },
            ],
          },
        ],
      };

      const html = service.renderToHTML(preview);

      // Should contain masked value (asterisks)
      expect(html).toContain('**********');
      // Should have data attributes for toggle functionality
      expect(html).toContain('data-original="secretpassword"');
      expect(html).toContain('data-masked="**********"');
    });

    it('should include sensitive indicator for sensitive items', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [
          {
            name: 'Test Section',
            categories: [
              {
                name: 'Test Category',
                items: [
                  {
                    label: 'Password',
                    value: 'secret',
                    sensitive: true,
                  },
                ],
              },
            ],
          },
        ],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('🔒');
      expect(html).toContain('sensitive-indicator');
    });

    it('should include print button', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('window.print()');
      expect(html).toContain('🖨️ 打印');
    });

    it('should include toggle sensitive button', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('toggleAllSensitive');
      expect(html).toContain('显示/隐藏敏感信息');
    });

    it('should include print-friendly styles', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('@media print');
    });

    it('should include responsive styles', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('@media (max-width: 600px)');
    });

    it('should show empty state when no sections', () => {
      const preview: PreviewDocument = {
        title: 'Test',
        generatedAt: new Date().toISOString(),
        sections: [],
      };

      const html = service.renderToHTML(preview);

      expect(html).toContain('暂无填写内容');
      expect(html).toContain('empty-state');
    });

    it('should escape HTML special characters', () => {
      const preview: PreviewDocument = {
        title: 'Test <script>alert("xss")</script>',
        generatedAt: new Date().toISOString(),
        sections: [
          {
            name: 'Section <b>bold</b>',
            categories: [
              {
                name: 'Category & Special',
                items: [
                  {
                    label: 'Item "quoted"',
                    value: 'Value <tag>',
                  },
                ],
              },
            ],
          },
        ],
      };

      const html = service.renderToHTML(preview);

      // Should escape HTML entities
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&lt;b&gt;');
      expect(html).toContain('&amp;');
      expect(html).toContain('&quot;');
      expect(html).toContain('&lt;tag&gt;');
      // Should not contain unescaped tags
      expect(html).not.toContain('<script>alert');
    });
  });

  describe('integration: generatePreview + renderToHTML', () => {
    it('should generate and render a complete preview', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'contact-list': {
                items: {
                  'contact': [
                    {
                      platform: 'whatsapp',
                      names: 'John Doe',
                      notes: 'Call first',
                    },
                  ],
                },
              },
            },
          },
          'tech': {
            categories: {
              'wireless-network': {
                items: {
                  'wifi-name': 'HomeNetwork',
                  'wifi-password': 'supersecret',
                },
              },
            },
          },
        },
      };

      const preview = service.generatePreview(data);
      const html = service.renderToHTML(preview);

      // Should contain all the data
      expect(html).toContain('紧急联系人');
      expect(html).toContain('John Doe');
      expect(html).toContain('Tech 技术');
      expect(html).toContain('HomeNetwork');
      // Sensitive data should be masked
      expect(html).toContain('data-original="supersecret"');
    });
  });
});
