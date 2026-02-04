/**
 * Unit Tests for StorageService
 * Tests for save(), load(), saveProgress(), loadProgress(), clear(), isAvailable(), getUsedSpace()
 * 
 * Requirements: 3.1-3.5, 6.4-6.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageService, StorageError, STORAGE_KEYS } from '../StorageService';
import type { ChecklistData } from '../../types/checklist-data';
import type { ProgressState } from '../../types/progress';

/**
 * Create a mock localStorage implementation
 */
function createMockLocalStorage() {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    // Helper to access the store directly for testing
    _getStore: () => store,
    _setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
}

describe('StorageService', () => {
  let service: StorageService;
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;
  
  // Sample test data
  const sampleChecklistData: ChecklistData = {
    version: '1.0.0',
    lastModified: '2024-01-15T10:00:00.000Z',
    sections: {
      'emergency-contacts': {
        categories: {
          'contact-list': {
            items: {
              'contact': [{ platform: 'whatsapp', names: 'John Doe' }]
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
  
  beforeEach(() => {
    // Create fresh mock localStorage for each test
    mockLocalStorage = createMockLocalStorage();
    
    // Replace window.localStorage with our mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
    
    service = new StorageService();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('isAvailable()', () => {
    it('should return true when localStorage is available', () => {
      expect(service.isAvailable()).toBe(true);
    });
    
    it('should return false when localStorage throws on setItem', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage disabled');
      });
      
      expect(service.isAvailable()).toBe(false);
    });
    
    it('should return false when localStorage throws on removeItem', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage disabled');
      });
      
      expect(service.isAvailable()).toBe(false);
    });
    
    it('should return false when window.localStorage is undefined', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      expect(service.isAvailable()).toBe(false);
    });
  });
  
  describe('save()', () => {
    it('should save checklist data to localStorage', () => {
      service.save(sampleChecklistData);
      
      // Find the call that saved checklist data (not the test key from isAvailable)
      const checklistDataCall = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === STORAGE_KEYS.CHECKLIST_DATA
      );
      
      expect(checklistDataCall).toBeDefined();
      
      const savedData = JSON.parse(checklistDataCall![1]);
      expect(savedData.sections).toEqual(sampleChecklistData.sections);
    });
    
    it('should update lastModified timestamp when saving', () => {
      const beforeSave = new Date().toISOString();
      service.save(sampleChecklistData);
      const afterSave = new Date().toISOString();
      
      const checklistDataCall = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === STORAGE_KEYS.CHECKLIST_DATA
      );
      
      const savedData = JSON.parse(checklistDataCall![1]);
      
      expect(savedData.lastModified >= beforeSave).toBe(true);
      expect(savedData.lastModified <= afterSave).toBe(true);
    });
    
    it('should throw StorageError with QUOTA_EXCEEDED when storage is full', () => {
      // First let isAvailable pass, then fail on actual save
      let callCount = 0;
      mockLocalStorage.setItem.mockImplementation((key: string) => {
        callCount++;
        // Let the first call (isAvailable test) pass
        if (key === '__storage_test__') {
          return;
        }
        // Fail on actual data save
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });
      
      try {
        service.save(sampleChecklistData);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('QUOTA_EXCEEDED');
      }
    });
    
    it('should throw StorageError with NOT_AVAILABLE when localStorage is unavailable', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      expect(() => service.save(sampleChecklistData)).toThrow(StorageError);
      
      try {
        service.save(sampleChecklistData);
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('NOT_AVAILABLE');
      }
    });
    
    it('should set version to current version', () => {
      service.save(sampleChecklistData);
      
      const checklistDataCall = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === STORAGE_KEYS.CHECKLIST_DATA
      );
      
      const savedData = JSON.parse(checklistDataCall![1]);
      expect(savedData.version).toBe('1.0.0');
    });
  });
  
  describe('load()', () => {
    it('should load checklist data from localStorage', () => {
      // First save data
      service.save(sampleChecklistData);
      
      // Then load it
      const loaded = service.load();
      
      expect(loaded).not.toBeNull();
      expect(loaded!.sections).toEqual(sampleChecklistData.sections);
    });
    
    it('should return null when no data exists', () => {
      const loaded = service.load();
      expect(loaded).toBeNull();
    });
    
    it('should throw StorageError with PARSE_ERROR for corrupted JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json {{{');
      
      expect(() => service.load()).toThrow(StorageError);
      
      try {
        service.load();
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('PARSE_ERROR');
      }
    });
    
    it('should throw StorageError with PARSE_ERROR for non-object data', () => {
      mockLocalStorage.getItem.mockReturnValue('"just a string"');
      
      expect(() => service.load()).toThrow(StorageError);
      
      try {
        service.load();
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('PARSE_ERROR');
      }
    });
    
    it('should throw StorageError with NOT_AVAILABLE when localStorage is unavailable', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      expect(() => service.load()).toThrow(StorageError);
      
      try {
        service.load();
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('NOT_AVAILABLE');
      }
    });
  });
  
  describe('saveProgress()', () => {
    it('should save progress state to localStorage', () => {
      service.saveProgress(sampleProgressState);
      
      // Find the call that saved progress data (not the test key from isAvailable)
      const progressCall = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === STORAGE_KEYS.PROGRESS_STATE
      );
      
      expect(progressCall).toBeDefined();
      
      const savedProgress = JSON.parse(progressCall![1]);
      expect(savedProgress.overall).toBe(sampleProgressState.overall);
      expect(savedProgress.mode).toBe(sampleProgressState.mode);
    });
    
    it('should update lastVisited timestamp when saving', () => {
      const beforeSave = new Date().toISOString();
      service.saveProgress(sampleProgressState);
      const afterSave = new Date().toISOString();
      
      const progressCall = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === STORAGE_KEYS.PROGRESS_STATE
      );
      
      const savedProgress = JSON.parse(progressCall![1]);
      
      expect(savedProgress.lastVisited >= beforeSave).toBe(true);
      expect(savedProgress.lastVisited <= afterSave).toBe(true);
    });
    
    it('should throw StorageError with QUOTA_EXCEEDED when storage is full', () => {
      // First let isAvailable pass, then fail on actual save
      mockLocalStorage.setItem.mockImplementation((key: string) => {
        // Let the test key pass
        if (key === '__storage_test__') {
          return;
        }
        // Fail on actual data save
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });
      
      try {
        service.saveProgress(sampleProgressState);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('QUOTA_EXCEEDED');
      }
    });
    
    it('should throw StorageError with NOT_AVAILABLE when localStorage is unavailable', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      try {
        service.saveProgress(sampleProgressState);
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('NOT_AVAILABLE');
      }
    });
  });
  
  describe('loadProgress()', () => {
    it('should load progress state from localStorage', () => {
      // First save progress
      service.saveProgress(sampleProgressState);
      
      // Then load it
      const loaded = service.loadProgress();
      
      expect(loaded).not.toBeNull();
      expect(loaded!.overall).toBe(sampleProgressState.overall);
      expect(loaded!.mode).toBe(sampleProgressState.mode);
    });
    
    it('should return null when no progress exists', () => {
      const loaded = service.loadProgress();
      expect(loaded).toBeNull();
    });
    
    it('should throw StorageError with PARSE_ERROR for corrupted JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json {{{');
      
      expect(() => service.loadProgress()).toThrow(StorageError);
      
      try {
        service.loadProgress();
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('PARSE_ERROR');
      }
    });
    
    it('should throw StorageError with PARSE_ERROR for non-object data', () => {
      mockLocalStorage.getItem.mockReturnValue('12345');
      
      expect(() => service.loadProgress()).toThrow(StorageError);
      
      try {
        service.loadProgress();
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('PARSE_ERROR');
      }
    });
    
    it('should throw StorageError with NOT_AVAILABLE when localStorage is unavailable', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      try {
        service.loadProgress();
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError);
        expect((error as StorageError).code).toBe('NOT_AVAILABLE');
      }
    });
  });
  
  describe('clear()', () => {
    it('should remove all checklist data from localStorage', () => {
      // First save some data
      service.save(sampleChecklistData);
      service.saveProgress(sampleProgressState);
      
      // Clear data
      service.clear();
      
      // Verify removeItem was called for both keys
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.CHECKLIST_DATA);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.PROGRESS_STATE);
    });
    
    it('should not throw when localStorage is unavailable', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      // Should not throw
      expect(() => service.clear()).not.toThrow();
    });
    
    it('should not throw when removeItem fails', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed');
      });
      
      // Should not throw
      expect(() => service.clear()).not.toThrow();
    });
  });
  
  describe('getUsedSpace()', () => {
    it('should return 0 when no data is stored', () => {
      const usedSpace = service.getUsedSpace();
      expect(usedSpace).toBe(0);
    });
    
    it('should return approximate bytes used for stored data', () => {
      service.save(sampleChecklistData);
      
      const usedSpace = service.getUsedSpace();
      
      // Should be greater than 0
      expect(usedSpace).toBeGreaterThan(0);
    });
    
    it('should include both checklist data and progress in calculation', () => {
      service.save(sampleChecklistData);
      const sizeWithData = service.getUsedSpace();
      
      service.saveProgress(sampleProgressState);
      const sizeWithBoth = service.getUsedSpace();
      
      expect(sizeWithBoth).toBeGreaterThan(sizeWithData);
    });
    
    it('should return 0 when localStorage is unavailable', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      const usedSpace = service.getUsedSpace();
      expect(usedSpace).toBe(0);
    });
    
    it('should return 0 when getItem throws', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Get failed');
      });
      
      const usedSpace = service.getUsedSpace();
      expect(usedSpace).toBe(0);
    });
  });
  
  describe('Data Round-Trip', () => {
    it('should preserve data integrity through save and load cycle', () => {
      // Save data
      service.save(sampleChecklistData);
      
      // Load data
      const loaded = service.load();
      
      // Verify sections are preserved
      expect(loaded!.sections).toEqual(sampleChecklistData.sections);
      expect(loaded!.version).toBe('1.0.0');
    });
    
    it('should preserve progress integrity through save and load cycle', () => {
      // Save progress
      service.saveProgress(sampleProgressState);
      
      // Load progress
      const loaded = service.loadProgress();
      
      // Verify key fields are preserved
      expect(loaded!.overall).toBe(sampleProgressState.overall);
      expect(loaded!.mode).toBe(sampleProgressState.mode);
      expect(loaded!.currentPosition).toEqual(sampleProgressState.currentPosition);
      expect(loaded!.sections).toEqual(sampleProgressState.sections);
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
                    { email: 'test1@example.com', password: 'secret1', notes: 'Primary' },
                    { email: 'test2@example.com', password: 'secret2', notes: 'Secondary' }
                  ],
                  'email-tips': 'Forward all emails to primary'
                }
              },
              'password-managers': {
                items: {
                  'manager': [
                    { name: 'KeePass', masterPassword: 'master123', location: '/path/to/db' }
                  ]
                }
              }
            }
          }
        }
      };
      
      service.save(complexData);
      const loaded = service.load();
      
      expect(loaded!.sections).toEqual(complexData.sections);
    });
  });
  
  describe('StorageError', () => {
    it('should have correct name property', () => {
      const error = new StorageError('Test error', 'QUOTA_EXCEEDED');
      expect(error.name).toBe('StorageError');
    });
    
    it('should have correct code property', () => {
      const error = new StorageError('Test error', 'PARSE_ERROR');
      expect(error.code).toBe('PARSE_ERROR');
    });
    
    it('should have correct message', () => {
      const error = new StorageError('Custom message', 'NOT_AVAILABLE');
      expect(error.message).toBe('Custom message');
    });
    
    it('should be instanceof Error', () => {
      const error = new StorageError('Test', 'UNKNOWN');
      expect(error).toBeInstanceOf(Error);
    });
  });
});
