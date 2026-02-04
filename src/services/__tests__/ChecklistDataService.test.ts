/**
 * Unit Tests for ChecklistDataService
 * Tests for getStructure(), getNextCategory(), getPrevCategory(), and calculateProgress()
 * 
 * Requirements: 1.2, 2.4, 10.1-10.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChecklistDataService } from '../ChecklistDataService';
import type { ChecklistData } from '../../types/checklist-data';
import type { ItemDefinition } from '../../types/checklist-structure';

describe('ChecklistDataService', () => {
  let service: ChecklistDataService;
  
  beforeEach(() => {
    service = new ChecklistDataService();
  });
  
  describe('getStructure()', () => {
    it('should return the complete checklist structure', () => {
      const structure = service.getStructure();
      
      expect(structure).toBeDefined();
      expect(structure.sections).toBeDefined();
      expect(Array.isArray(structure.sections)).toBe(true);
      expect(structure.sections.length).toBeGreaterThan(0);
    });
    
    it('should contain all required sections', () => {
      const structure = service.getStructure();
      const sectionIds = structure.sections.map(s => s.id);
      
      expect(sectionIds).toContain('emergency-contacts');
      expect(sectionIds).toContain('tech');
      expect(sectionIds).toContain('input');
      expect(sectionIds).toContain('output');
      expect(sectionIds).toContain('misc');
    });
    
    it('should have categories in each section', () => {
      const structure = service.getStructure();
      
      for (const section of structure.sections) {
        expect(section.categories).toBeDefined();
        expect(Array.isArray(section.categories)).toBe(true);
        expect(section.categories.length).toBeGreaterThan(0);
      }
    });
  });
  
  describe('getNextCategory()', () => {
    it('should return the next category in order', () => {
      // First category in emergency-contacts section
      const next = service.getNextCategory('emergency-contacts/contact-list');
      
      expect(next).toBe('emergency-contacts/social-announcement');
    });
    
    it('should navigate across sections', () => {
      // Last category in emergency-contacts should go to first in tech
      const next = service.getNextCategory('emergency-contacts/social-announcement');
      
      expect(next).toBe('tech/emails');
    });
    
    it('should return null at the end of the checklist', () => {
      // Last category in misc section
      const next = service.getNextCategory('misc/physical-security');
      
      expect(next).toBeNull();
    });
    
    it('should return null for invalid path', () => {
      const next = service.getNextCategory('invalid/path');
      
      expect(next).toBeNull();
    });
    
    it('should return null for malformed path', () => {
      const next = service.getNextCategory('no-slash');
      
      expect(next).toBeNull();
    });
  });
  
  describe('getPrevCategory()', () => {
    it('should return the previous category in order', () => {
      const prev = service.getPrevCategory('emergency-contacts/social-announcement');
      
      expect(prev).toBe('emergency-contacts/contact-list');
    });
    
    it('should navigate across sections backwards', () => {
      // First category in tech should go back to last in emergency-contacts
      const prev = service.getPrevCategory('tech/emails');
      
      expect(prev).toBe('emergency-contacts/social-announcement');
    });
    
    it('should return null at the beginning of the checklist', () => {
      // First category
      const prev = service.getPrevCategory('emergency-contacts/contact-list');
      
      expect(prev).toBeNull();
    });
    
    it('should return null for invalid path', () => {
      const prev = service.getPrevCategory('invalid/path');
      
      expect(prev).toBeNull();
    });
  });
  
  describe('calculateProgress()', () => {
    it('should return 0% progress for empty data', () => {
      const emptyData: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {}
      };
      
      const progress = service.calculateProgress(emptyData);
      
      expect(progress.overall).toBe(0);
      expect(progress.sections).toBeDefined();
    });
    
    it('should mark category as not_started when no items are filled', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'contact-list': {
                items: {}
              }
            }
          }
        }
      };
      
      const progress = service.calculateProgress(data);
      const categoryProgress = progress.sections['emergency-contacts']?.categories['contact-list'];
      
      expect(categoryProgress?.status).toBe('not_started');
      expect(categoryProgress?.filledItems).toBe(0);
    });
    
    it('should mark category as in_progress when some items are filled', () => {
      // Use tech/emails category which has 2 items: email-account and email-tips
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'tech': {
            categories: {
              'emails': {
                items: {
                  // Only fill one of the two items
                  'email-account': [{ email: 'test@example.com' }]
                  // email-tips is not filled
                }
              }
            }
          }
        }
      };
      
      const progress = service.calculateProgress(data);
      const categoryProgress = progress.sections['tech']?.categories['emails'];
      
      expect(categoryProgress?.status).toBe('in_progress');
      expect(categoryProgress?.filledItems).toBeGreaterThan(0);
    });
    
    it('should mark category as completed when all items are filled', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'social-announcement': {
                items: {
                  'platforms-to-announce': 'Twitter, Facebook'
                }
              }
            }
          }
        }
      };
      
      const progress = service.calculateProgress(data);
      const categoryProgress = progress.sections['emergency-contacts']?.categories['social-announcement'];
      
      expect(categoryProgress?.status).toBe('completed');
      expect(categoryProgress?.progress).toBe(100);
    });
    
    it('should calculate section progress as average of category progresses', () => {
      // social-announcement has 1 item, fill it completely
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'contact-list': {
                items: {} // 0% - not filled
              },
              'social-announcement': {
                items: {
                  'platforms-to-announce': 'Twitter' // 100% - filled
                }
              }
            }
          }
        }
      };
      
      const progress = service.calculateProgress(data);
      const sectionProgress = progress.sections['emergency-contacts'];
      
      // Average of 0% and 100% = 50%
      expect(sectionProgress?.progress).toBe(50);
    });
    
    it('should calculate overall progress as average of section progresses', () => {
      const progress = service.calculateProgress({
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {}
      });
      
      // All sections should be 0%, so overall should be 0%
      expect(progress.overall).toBe(0);
    });
    
    it('should set currentPosition to first incomplete category', () => {
      // Fill only the first category completely, leave second incomplete
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'contact-list': {
                items: {
                  'contact': [{ platform: 'whatsapp', names: 'John' }]
                }
              },
              'social-announcement': {
                items: {
                  // Leave this empty - not filled
                }
              }
            }
          }
        }
      };
      
      const progress = service.calculateProgress(data);
      
      // social-announcement is not_started, so it should be the current position
      expect(progress.currentPosition.sectionId).toBe('emergency-contacts');
      expect(progress.currentPosition.categoryId).toBe('social-announcement');
    });
    
    it('should handle repeatable items correctly', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'contact-list': {
                items: {
                  'contact': [
                    { platform: 'whatsapp', names: 'John' },
                    { platform: 'email', names: 'Jane' }
                  ]
                }
              }
            }
          }
        }
      };
      
      const progress = service.calculateProgress(data);
      const categoryProgress = progress.sections['emergency-contacts']?.categories['contact-list'];
      
      // The contact item is repeatable and has values, so it should count as filled
      expect(categoryProgress?.filledItems).toBeGreaterThan(0);
    });
    
    it('should not count empty strings as filled', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'social-announcement': {
                items: {
                  'platforms-to-announce': ''
                }
              }
            }
          }
        }
      };
      
      const progress = service.calculateProgress(data);
      const categoryProgress = progress.sections['emergency-contacts']?.categories['social-announcement'];
      
      expect(categoryProgress?.status).toBe('not_started');
      expect(categoryProgress?.filledItems).toBe(0);
    });
    
    it('should not count whitespace-only strings as filled', () => {
      const data: ChecklistData = {
        version: '1.0.0',
        lastModified: new Date().toISOString(),
        sections: {
          'emergency-contacts': {
            categories: {
              'social-announcement': {
                items: {
                  'platforms-to-announce': '   '
                }
              }
            }
          }
        }
      };
      
      const progress = service.calculateProgress(data);
      const categoryProgress = progress.sections['emergency-contacts']?.categories['social-announcement'];
      
      expect(categoryProgress?.status).toBe('not_started');
    });
  });
  
  describe('validateItem()', () => {
    it('should pass validation for valid email', () => {
      const item: ItemDefinition = {
        id: 'email',
        label: 'Email',
        type: 'email'
      };
      
      const result = service.validateItem(item, 'test@example.com');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should fail validation for invalid email', () => {
      const item: ItemDefinition = {
        id: 'email',
        label: 'Email',
        type: 'email'
      };
      
      const result = service.validateItem(item, 'invalid-email');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should pass validation for valid URL', () => {
      const item: ItemDefinition = {
        id: 'website',
        label: 'Website',
        type: 'url'
      };
      
      const result = service.validateItem(item, 'https://example.com');
      
      expect(result.valid).toBe(true);
    });
    
    it('should pass validation for domain-only URL', () => {
      const item: ItemDefinition = {
        id: 'website',
        label: 'Website',
        type: 'url'
      };
      
      const result = service.validateItem(item, 'example.com');
      
      expect(result.valid).toBe(true);
    });
    
    it('should fail validation for required empty field', () => {
      const item: ItemDefinition = {
        id: 'name',
        label: 'Name',
        type: 'text',
        required: true
      };
      
      const result = service.validateItem(item, '');
      
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('required');
    });
    
    it('should pass validation for non-required empty field', () => {
      const item: ItemDefinition = {
        id: 'name',
        label: 'Name',
        type: 'text',
        required: false
      };
      
      const result = service.validateItem(item, '');
      
      expect(result.valid).toBe(true);
    });
    
    it('should pass validation for valid phone number', () => {
      const item: ItemDefinition = {
        id: 'phone',
        label: 'Phone',
        type: 'tel'
      };
      
      const result = service.validateItem(item, '+1-555-123-4567');
      
      expect(result.valid).toBe(true);
    });
    
    it('should fail validation for invalid phone number', () => {
      const item: ItemDefinition = {
        id: 'phone',
        label: 'Phone',
        type: 'tel'
      };
      
      const result = service.validateItem(item, 'abc');
      
      expect(result.valid).toBe(false);
    });
  });
});
