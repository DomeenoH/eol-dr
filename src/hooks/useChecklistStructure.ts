/**
 * useChecklistStructure Hook
 * 
 * 根据当前语言返回翻译后的 checklist 结构
 * 支持语言特定的选项列表（如中文版的微信、微博等）
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  ChecklistStructure,
  Section,
  Category,
  ItemDefinition,
  SelectOption,
} from '../types/checklist-structure';
import { checklistStructure as baseStructure } from '../data/checklistStructure';

/**
 * 获取翻译后的选项列表
 * 根据当前语言返回对应的选项
 */
function getTranslatedOptions(
  t: (key: string, options?: Record<string, unknown>) => string,
  optionGroupId: string
): SelectOption[] {
  // 获取当前语言的选项列表
  const optionList = t(`checklist.optionLists.${optionGroupId}`, {
    returnObjects: true,
    defaultValue: null,
  });

  // 如果没有定义选项列表，返回空数组
  if (!optionList || !Array.isArray(optionList)) {
    return [];
  }

  // 翻译每个选项
  return optionList.map((value: string) => ({
    value,
    label: t(`checklist.options.${optionGroupId}.${value}`, {
      defaultValue: value,
    }),
  }));
}

/**
 * 翻译单个字段
 */
function translateItem(
  item: ItemDefinition,
  t: (key: string, options?: Record<string, unknown>) => string,
  categoryId: string
): ItemDefinition {
  const translatedItem: ItemDefinition = {
    ...item,
  };

  // 翻译 label（从原始结构获取或使用翻译文件）
  // 目前保持原有的结构不变，后续可以扩展为从翻译文件获取

  // 处理选项（如果有 options 且是 select 类型）
  if (item.type === 'select' && item.options) {
    // 检查是否有对应的选项组定义
    const optionGroupId = getOptionGroupIdForItem(item.id, categoryId);
    if (optionGroupId) {
      const translatedOptions = getTranslatedOptions(t, optionGroupId);
      if (translatedOptions.length > 0) {
        translatedItem.options = translatedOptions;
      }
    }
  }

  // 递归处理子字段（group 类型）
  if (item.fields) {
    translatedItem.fields = item.fields.map((field) =>
      translateItem(field, t, categoryId)
    );
  }

  return translatedItem;
}

/**
 * 根据字段 ID 和分类 ID 获取对应的选项组 ID
 */
function getOptionGroupIdForItem(
  itemId: string,
  categoryId: string
): string | null {
  // 通讯平台选项
  if (itemId === 'platform' && categoryId === 'contact-list') {
    return 'messaging-platforms';
  }

  // 社交媒体平台选项
  if (itemId === 'platform' && categoryId === 'social-media') {
    return 'social-platforms';
  }
  if (itemId === 'platform' && categoryId === 'social-announcement') {
    return 'social-platforms';
  }

  // 社交媒体操作选项
  if (itemId === 'action' && categoryId === 'social-media') {
    return 'social-actions';
  }

  // 域名操作选项
  if (itemId === 'action' && categoryId === 'domains-blogs') {
    return 'domain-actions';
  }

  // 订阅服务操作选项
  if (itemId === 'action' && categoryId === 'subscriptions') {
    return 'subscription-actions';
  }

  // 设备类型选项
  if (itemId === 'type' && categoryId === 'homelabs') {
    return 'device-types';
  }

  // IoT 设备类型选项
  if (itemId === 'type' && categoryId === 'home-automation') {
    return 'iot-device-types';
  }

  // 云服务操作选项
  if (itemId === 'action' && categoryId === 'cloud-subscriptions') {
    return 'cloud-actions';
  }

  // 银行账户类型选项
  if (itemId === 'accountType' && categoryId === 'bank-accounts') {
    return 'bank-account-types';
  }

  // 银行账户操作选项
  if (itemId === 'action' && categoryId === 'bank-accounts') {
    return 'bank-actions';
  }

  // 服务类型选项
  if (itemId === 'serviceType' && categoryId === 'cell-phone-internet') {
    return 'service-types';
  }

  // 支付类型选项
  if (itemId === 'paymentType' && categoryId === 'bill-auto-pay') {
    return 'payment-types';
  }

  // 安全问题选项
  if (itemId === 'question' && categoryId === 'security-questions') {
    return 'security-questions';
  }

  // 密码类型选项
  if (itemId === 'codeType' && categoryId === 'physical-security') {
    return 'code-types';
  }

  // 网站操作选项
  if (itemId === 'action' && categoryId === 'websites') {
    return 'website-actions';
  }

  return null;
}

/**
 * 翻译分类
 */
function translateCategory(
  category: Category,
  t: (key: string, options?: Record<string, unknown>) => string
): Category {
  const categoryKey = `checklist.categories.${category.id}`;

  return {
    ...category,
    name: t(`${categoryKey}.name`, { defaultValue: category.name }),
    description: t(`${categoryKey}.description`, {
      defaultValue: category.description ?? '',
    }),
    helpText: t(`${categoryKey}.helpText`, {
      defaultValue: category.helpText ?? '',
    }),
    items: category.items.map((item) =>
      translateItem(item, t, category.id)
    ),
  };
}

/**
 * 翻译部分
 */
function translateSection(
  section: Section,
  t: (key: string, options?: Record<string, unknown>) => string
): Section {
  const sectionKey = `checklist.sections.${section.id}`;

  return {
    ...section,
    name: t(`${sectionKey}.name`, { defaultValue: section.name }),
    description: t(`${sectionKey}.description`, {
      defaultValue: section.description ?? '',
    }),
    categories: section.categories.map((category) =>
      translateCategory(category, t)
    ),
  };
}

/**
 * Hook: useChecklistStructure
 * 
 * 返回根据当前语言翻译后的 checklist 结构
 * 包含语言特定的选项列表
 * 
 * @example
 * ```tsx
 * const { structure, t } = useChecklistStructure();
 * 
 * // structure 包含翻译后的结构
 * // 选项列表会根据语言自动调整（如中文版显示微信等）
 * ```
 */
export function useChecklistStructure(): {
  structure: ChecklistStructure;
  isLoading: boolean;
} {
  const { t, ready } = useTranslation();

  const structure = useMemo(() => {
    if (!ready) {
      return baseStructure;
    }

    return {
      sections: baseStructure.sections.map((section) =>
        translateSection(section, t)
      ),
    };
  }, [t, ready]);

  return {
    structure,
    isLoading: !ready,
  };
}

export default useChecklistStructure;
