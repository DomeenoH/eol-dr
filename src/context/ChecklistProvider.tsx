/**
 * ChecklistProvider Component
 * Manages checklist state and storage operations.
 */

import { useReducer, useEffect, useCallback, useMemo } from 'react';
import type { ChecklistData, ItemValue } from '../types/checklist-data';
import type { ProgressState, AppMode, CurrentPosition } from '../types/progress';
import { storageService, StorageError } from '../services/StorageService';
import { checklistDataService } from '../services/ChecklistDataService';
import { 
  ChecklistContext,
  type ChecklistState, 
  type ChecklistAction, 
  type ChecklistContextValue,
  type ChecklistProviderProps,
  type DirtyItemKey
} from './ChecklistContext';

// ============================================================================
// Initial State Helpers
// ============================================================================

/**
 * Create initial empty checklist data
 */
function createEmptyChecklistData(): ChecklistData {
  return {
    version: '1.0.0',
    lastModified: new Date().toISOString(),
    sections: {},
  };
}

/**
 * Create initial progress state
 */
function createInitialProgressState(): ProgressState {
  return {
    overall: 0,
    sections: {},
    currentPosition: { sectionId: '', categoryId: '' },
    mode: 'free', // 默认自由模式，用户选择引导模式时会覆盖
    lastVisited: new Date().toISOString(),
  };
}

/**
 * Initial state for the context
 */
const initialState: ChecklistState = {
  checklistData: createEmptyChecklistData(),
  progressState: createInitialProgressState(),
  saveStatus: 'saved',
  lastSaved: null,
  saveError: null,
  storageAvailable: true,
  isLoaded: false,
  dirtyItems: new Set<DirtyItemKey>(),
};

// ============================================================================
// Reducer
// ============================================================================

/**
 * Ensure section and category data structures exist
 */
function ensureDataStructure(
  data: ChecklistData,
  sectionId: string,
  categoryId: string
): ChecklistData {
  const newData = { ...data };
  
  // Always create a new sections object to ensure React detects the change
  newData.sections = { ...newData.sections };
  
  if (!newData.sections[sectionId]) {
    newData.sections[sectionId] = { categories: {} };
  } else {
    newData.sections[sectionId] = { ...newData.sections[sectionId] };
  }
  
  if (!newData.sections[sectionId].categories) {
    newData.sections[sectionId].categories = {};
  } else {
    newData.sections[sectionId].categories = { ...newData.sections[sectionId].categories };
  }
  
  if (!newData.sections[sectionId].categories[categoryId]) {
    newData.sections[sectionId].categories[categoryId] = { items: {} };
  } else {
    newData.sections[sectionId].categories[categoryId] = {
      ...newData.sections[sectionId].categories[categoryId],
      items: { ...newData.sections[sectionId].categories[categoryId].items },
    };
  }
  
  return newData;
}

/**
 * Reducer function for checklist state
 */
function checklistReducer(state: ChecklistState, action: ChecklistAction): ChecklistState {
  switch (action.type) {
    case 'SET_DATA': {
      const newProgressState = checklistDataService.calculateProgress(action.payload);
      return {
        ...state,
        checklistData: action.payload,
        progressState: {
          ...newProgressState,
          mode: state.progressState.mode, // Preserve current mode
        },
      };
    }
    
    case 'UPDATE_ITEM': {
      const { sectionId, categoryId, itemId, value } = action.payload;
      
      // Ensure data structure exists
      const newData = ensureDataStructure(state.checklistData, sectionId, categoryId);
      
      // Update the item value
      newData.sections[sectionId].categories[categoryId].items[itemId] = value;
      newData.lastModified = new Date().toISOString();
      
      // Recalculate progress
      const newProgressState = checklistDataService.calculateProgress(newData);
      
      return {
        ...state,
        checklistData: newData,
        progressState: {
          ...newProgressState,
          mode: state.progressState.mode,
          currentPosition: state.progressState.currentPosition,
        },
      };
    }
    
    case 'SET_MODE': {
      return {
        ...state,
        progressState: {
          ...state.progressState,
          mode: action.payload,
        },
      };
    }
    
    case 'SET_CURRENT_CATEGORY': {
      return {
        ...state,
        progressState: {
          ...state.progressState,
          currentPosition: action.payload,
        },
      };
    }
    
    case 'SET_SAVE_STATUS': {
      return {
        ...state,
        saveStatus: action.payload.status,
        saveError: action.payload.error ?? null,
      };
    }
    
    case 'SET_LAST_SAVED': {
      return {
        ...state,
        lastSaved: action.payload,
      };
    }
    
    case 'SET_STORAGE_AVAILABLE': {
      return {
        ...state,
        storageAvailable: action.payload,
      };
    }
    
    case 'SET_LOADED': {
      return {
        ...state,
        isLoaded: action.payload,
      };
    }
    
    case 'CLEAR_DATA': {
      const emptyData = createEmptyChecklistData();
      const emptyProgress = createInitialProgressState();
      return {
        ...state,
        checklistData: emptyData,
        progressState: emptyProgress,
        lastSaved: null,
        saveError: null,
      };
    }
    
    case 'IMPORT_DATA': {
      const { data, progress } = action.payload;
      const calculatedProgress = checklistDataService.calculateProgress(data);
      
      return {
        ...state,
        checklistData: data,
        progressState: progress ? {
          ...calculatedProgress,
          mode: progress.mode,
          currentPosition: progress.currentPosition,
        } : calculatedProgress,
        dirtyItems: new Set<DirtyItemKey>(), // 导入后清除脏数据
      };
    }
    
    case 'MARK_DIRTY': {
      const { sectionId, categoryId, itemId } = action.payload;
      const key = `${sectionId}/${categoryId}/${itemId}`;
      const newDirtyItems = new Set(state.dirtyItems);
      newDirtyItems.add(key);
      return {
        ...state,
        dirtyItems: newDirtyItems,
        saveStatus: 'unsaved',
      };
    }
    
    case 'CLEAR_DIRTY': {
      return {
        ...state,
        dirtyItems: new Set<DirtyItemKey>(),
        saveStatus: 'saved',
      };
    }
    
    default:
      return state;
  }
}

// ============================================================================
// Provider
// ============================================================================

/**
 * ChecklistProvider component
 * Provides checklist state and actions to the application
 * 
 * 使用手动保存模式：用户需要点击保存按钮才会持久化数据
 * 未保存的项目会被标记为 dirty 状态
 */
export function ChecklistProvider({
  children,
  initialData,
  initialProgress,
  storageServiceOverride,
}: ChecklistProviderProps) {
  const storage = storageServiceOverride ?? storageService;
  
  // Initialize state with optional initial data
  const getInitialState = (): ChecklistState => {
    if (initialData) {
      const progress = initialProgress ?? checklistDataService.calculateProgress(initialData);
      return {
        ...initialState,
        checklistData: initialData,
        progressState: progress,
        isLoaded: true,
      };
    }
    return initialState;
  };
  
  const [state, dispatch] = useReducer(checklistReducer, undefined, getInitialState);
  
  // ============================================================================
  // Storage Operations
  // ============================================================================
  
  /**
   * Save data to storage（手动保存）
   */
  const saveToStorage = useCallback((data: ChecklistData, progress: ProgressState) => {
    dispatch({ type: 'SET_SAVE_STATUS', payload: { status: 'saving' } });
    
    try {
      storage.save(data);
      storage.saveProgress(progress);
      dispatch({ type: 'CLEAR_DIRTY' }); // 保存成功后清除脏数据
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
    } catch (error) {
      const errorMessage = error instanceof StorageError 
        ? error.message 
        : 'Failed to save data';
      dispatch({ type: 'SET_SAVE_STATUS', payload: { status: 'error', error: errorMessage } });
    }
  }, [storage]);
  
  // ============================================================================
  // Load Data on Mount
  // ============================================================================
  
  useEffect(() => {
    // Skip if initial data was provided (for testing)
    if (initialData) {
      return;
    }
    
    // Check storage availability
    const isAvailable = storage.isAvailable();
    dispatch({ type: 'SET_STORAGE_AVAILABLE', payload: isAvailable });
    
    if (!isAvailable) {
      dispatch({ type: 'SET_LOADED', payload: true });
      return;
    }
    
    // Load saved data
    try {
      const savedData = storage.load();
      const savedProgress = storage.loadProgress();
      
      if (savedData) {
        dispatch({ type: 'SET_DATA', payload: savedData });
        
        if (savedProgress) {
          // 加载上次的 mode 和位置，用于"继续上次填写"功能
          // 用户选择新模式时会通过 setMode 覆盖
          dispatch({ type: 'SET_MODE', payload: savedProgress.mode });
          dispatch({ type: 'SET_CURRENT_CATEGORY', payload: savedProgress.currentPosition });
        }
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
      // Continue with empty state
    }
    
    dispatch({ type: 'SET_LOADED', payload: true });
  }, [storage, initialData]);
  
  // ============================================================================
  // Action Handlers
  // ============================================================================
  
  const setData = useCallback((data: ChecklistData) => {
    dispatch({ type: 'SET_DATA', payload: data });
  }, []);
  
  /**
   * 更新单个 item，同时标记为 dirty
   */
  const updateItem = useCallback((
    sectionId: string,
    categoryId: string,
    itemId: string,
    value: ItemValue | ItemValue[]
  ) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { sectionId, categoryId, itemId, value } });
    dispatch({ type: 'MARK_DIRTY', payload: { sectionId, categoryId, itemId } });
  }, []);
  
  const setMode = useCallback((mode: AppMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);
  
  const setCurrentCategory = useCallback((position: CurrentPosition) => {
    dispatch({ type: 'SET_CURRENT_CATEGORY', payload: position });
  }, []);
  
  const goToNextCategory = useCallback((): boolean => {
    const { currentPosition } = state.progressState;
    const currentPath = `${currentPosition.sectionId}/${currentPosition.categoryId}`;
    const nextPath = checklistDataService.getNextCategory(currentPath);
    
    if (nextPath) {
      const [sectionId, categoryId] = nextPath.split('/');
      dispatch({ type: 'SET_CURRENT_CATEGORY', payload: { sectionId, categoryId } });
      return true;
    }
    return false;
  }, [state.progressState]);
  
  const goToPrevCategory = useCallback((): boolean => {
    const { currentPosition } = state.progressState;
    const currentPath = `${currentPosition.sectionId}/${currentPosition.categoryId}`;
    const prevPath = checklistDataService.getPrevCategory(currentPath);
    
    if (prevPath) {
      const [sectionId, categoryId] = prevPath.split('/');
      dispatch({ type: 'SET_CURRENT_CATEGORY', payload: { sectionId, categoryId } });
      return true;
    }
    return false;
  }, [state.progressState]);
  
  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR_DATA' });
    dispatch({ type: 'CLEAR_DIRTY' });
    
    // Clear storage
    try {
      storage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }, [storage]);
  
  const importData = useCallback((data: ChecklistData, progress?: ProgressState) => {
    dispatch({ type: 'IMPORT_DATA', payload: { data, progress } });
  }, []);
  
  /**
   * 手动保存所有数据
   */
  const saveAll = useCallback(() => {
    saveToStorage(state.checklistData, state.progressState);
  }, [state.checklistData, state.progressState, saveToStorage]);
  
  /**
   * 检查某个 item 是否为脏数据（未保存）
   */
  const isItemDirty = useCallback((sectionId: string, categoryId: string, itemId: string): boolean => {
    const key = `${sectionId}/${categoryId}/${itemId}`;
    return state.dirtyItems.has(key);
  }, [state.dirtyItems]);
  
  /**
   * 检查某个 category 是否包含脏数据
   */
  const isCategoryDirty = useCallback((sectionId: string, categoryId: string): boolean => {
    const prefix = `${sectionId}/${categoryId}/`;
    for (const key of state.dirtyItems) {
      if (key.startsWith(prefix)) {
        return true;
      }
    }
    return false;
  }, [state.dirtyItems]);
  
  /**
   * 获取脏数据项目数量
   */
  const getDirtyItemsCount = useCallback((): number => {
    return state.dirtyItems.size;
  }, [state.dirtyItems]);
  
  // ============================================================================
  // Context Value
  // ============================================================================
  
  const contextValue = useMemo<ChecklistContextValue>(() => ({
    state,
    dispatch,
    setData,
    updateItem,
    setMode,
    setCurrentCategory,
    goToNextCategory,
    goToPrevCategory,
    clearData,
    importData,
    saveAll,
    isItemDirty,
    isCategoryDirty,
    getDirtyItemsCount,
  }), [
    state,
    setData,
    updateItem,
    setMode,
    setCurrentCategory,
    goToNextCategory,
    goToPrevCategory,
    clearData,
    importData,
    saveAll,
    isItemDirty,
    isCategoryDirty,
    getDirtyItemsCount,
  ]);
  
  return (
    <ChecklistContext.Provider value={contextValue}>
      {children}
    </ChecklistContext.Provider>
  );
}
