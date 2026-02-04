/**
 * PreviewService
 * Service for generating preview documents from checklist data
 * 
 * Requirements: 5.1-5.6
 * - 以可读的文档格式展示所有填写内容
 * - 敏感信息默认隐藏，可点击显示
 * - 支持直接打印（打印友好样式）
 * - 可从预览页面直接导出为各种格式
 * - 可随时返回编辑模式
 */

import type { ChecklistData, ItemValue, ItemValueObject } from '../types/checklist-data';
import type { ChecklistStructure, Section, Category, ItemDefinition } from '../types/checklist-structure';
import { checklistStructure } from '../data/checklistStructure';

/**
 * Preview document structure
 */
export interface PreviewDocument {
  title: string;
  generatedAt: string;
  sections: PreviewSection[];
}

/**
 * Preview section structure
 */
export interface PreviewSection {
  name: string;
  description?: string;
  categories: PreviewCategory[];
}

/**
 * Preview category structure
 */
export interface PreviewCategory {
  name: string;
  description?: string;
  items: PreviewItem[];
}

/**
 * Preview item structure
 */
export interface PreviewItem {
  label: string;
  value: string | string[];
  sensitive?: boolean;
}

/**
 * Interface for PreviewService
 */
export interface IPreviewService {
  generatePreview(data: ChecklistData): PreviewDocument;
  renderToHTML(preview: PreviewDocument): string;
}

/**
 * Format a date to a readable string
 */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Check if a value is filled (non-empty)
 */
function isValueFilled(value: ItemValue | undefined | null): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (typeof value === 'number') {
    return true;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'object') {
    return Object.values(value).some(v => isValueFilled(v as ItemValue));
  }
  return false;
}

/**
 * Mask sensitive values for display
 */
function maskSensitiveValue(value: string): string {
  if (!value || value.length === 0) {
    return '';
  }
  return '*'.repeat(Math.min(value.length, 10));
}

/**
 * Get label for a select option value
 */
function getSelectLabel(item: ItemDefinition, value: string): string {
  if (item.type === 'select' && item.options) {
    const option = item.options.find(opt => opt.value === value);
    return option ? option.label : value;
  }
  return value;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format a single field value for preview
 * Note: Sensitive values are NOT masked here - masking happens in renderToHTML
 */
function formatFieldValue(
  field: ItemDefinition,
  value: ItemValue | undefined
): string {
  if (!isValueFilled(value)) {
    return '';
  }

  if (typeof value === 'string') {
    if (field.type === 'select') {
      return getSelectLabel(field, value);
    }
    // Don't mask sensitive values here - let renderToHTML handle masking
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }

  return '';
}

/**
 * Format a group item value for preview
 * Note: Sensitive values are NOT masked here - masking happens in renderToHTML
 */
function formatGroupValue(
  fields: ItemDefinition[],
  value: ItemValueObject
): string[] {
  const lines: string[] = [];
  
  for (const field of fields) {
    const fieldValue = value[field.id];
    if (!isValueFilled(fieldValue as ItemValue)) {
      continue;
    }

    let displayValue: string;
    if (field.type === 'checkbox') {
      displayValue = fieldValue ? '✅' : '❌';
    } else {
      displayValue = formatFieldValue(field, fieldValue as ItemValue);
    }

    if (displayValue) {
      lines.push(`${field.label}: ${displayValue}`);
    }
  }

  return lines;
}

/**
 * Check if any field in a group is sensitive
 */
function hasAnySensitiveField(fields: ItemDefinition[]): boolean {
  return fields.some(field => field.sensitive);
}

/**
 * PreviewService implementation
 */
class PreviewService implements IPreviewService {
  private structure: ChecklistStructure;

  constructor() {
    this.structure = checklistStructure;
  }

  /**
   * Generate a preview document from checklist data
   * @param data - ChecklistData to generate preview from
   * @returns PreviewDocument
   */
  generatePreview(data: ChecklistData): PreviewDocument {
    const sections: PreviewSection[] = [];

    for (const section of this.structure.sections) {
      const sectionData = data.sections?.[section.id];
      const previewSection = this.generatePreviewSection(section, sectionData);
      
      // Only include sections that have content
      if (previewSection.categories.length > 0) {
        sections.push(previewSection);
      }
    }

    return {
      title: 'End-of-life Disaster Response Checklist',
      generatedAt: new Date().toISOString(),
      sections,
    };
  }

  /**
   * Generate a preview section
   */
  private generatePreviewSection(
    section: Section,
    sectionData: { categories: Record<string, { items: Record<string, ItemValue | ItemValue[]> }> } | undefined
  ): PreviewSection {
    const categories: PreviewCategory[] = [];

    for (const category of section.categories) {
      const categoryData = sectionData?.categories?.[category.id];
      const previewCategory = this.generatePreviewCategory(category, categoryData);
      
      // Only include categories that have content
      if (previewCategory.items.length > 0) {
        categories.push(previewCategory);
      }
    }

    return {
      name: section.name,
      description: section.description,
      categories,
    };
  }

  /**
   * Generate a preview category
   */
  private generatePreviewCategory(
    category: Category,
    categoryData: { items: Record<string, ItemValue | ItemValue[]> } | undefined
  ): PreviewCategory {
    const items: PreviewItem[] = [];

    for (const item of category.items) {
      const itemValue = categoryData?.items?.[item.id];
      const previewItems = this.generatePreviewItems(item, itemValue);
      items.push(...previewItems);
    }

    return {
      name: category.name,
      description: category.description,
      items,
    };
  }

  /**
   * Generate preview items from an item definition and value
   */
  private generatePreviewItems(
    item: ItemDefinition,
    value: ItemValue | ItemValue[] | undefined
  ): PreviewItem[] {
    if (!value) {
      return [];
    }

    const items: PreviewItem[] = [];

    if (item.repeatable && Array.isArray(value)) {
      // Handle repeatable items
      const filledValues = value.filter(v => isValueFilled(v));
      
      for (let i = 0; i < filledValues.length; i++) {
        const v = filledValues[i];
        
        if (item.type === 'group' && item.fields) {
          const groupLines = formatGroupValue(item.fields, v as ItemValueObject);
          if (groupLines.length > 0) {
            items.push({
              label: `${item.label} ${i + 1}`,
              value: groupLines,
              sensitive: hasAnySensitiveField(item.fields),
            });
          }
        } else {
          const displayValue = formatFieldValue(item, v);
          if (displayValue) {
            items.push({
              label: `${item.label} ${i + 1}`,
              value: displayValue,
              sensitive: item.sensitive,
            });
          }
        }
      }
    } else if (item.type === 'group' && item.fields) {
      // Handle single group item
      if (!isValueFilled(value as ItemValue)) {
        return [];
      }
      const groupLines = formatGroupValue(item.fields, value as ItemValueObject);
      if (groupLines.length > 0) {
        items.push({
          label: item.label,
          value: groupLines,
          sensitive: hasAnySensitiveField(item.fields),
        });
      }
    } else {
      // Handle simple items
      const displayValue = formatFieldValue(item, value as ItemValue);
      if (displayValue) {
        items.push({
          label: item.label,
          value: displayValue,
          sensitive: item.sensitive,
        });
      }
    }

    return items;
  }

  /**
   * Render a preview document to HTML
   * @param preview - PreviewDocument to render
   * @returns HTML string
   */
  renderToHTML(preview: PreviewDocument): string {
    const formattedDate = formatDate(preview.generatedAt);
    
    const sectionsHTML = preview.sections.map(section => 
      this.renderSectionToHTML(section)
    ).join('\n');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(preview.title)}</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      background: #fff;
    }
    .header {
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    h1 {
      color: #1a1a1a;
      margin: 0 0 10px 0;
      font-size: 1.8em;
    }
    .generated-at {
      color: #666;
      font-size: 0.9em;
    }
    .toolbar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 15px;
    }
    .toolbar button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background: #f8f9fa;
      cursor: pointer;
      font-size: 0.9em;
      transition: background 0.2s;
    }
    .toolbar button:hover {
      background: #e9ecef;
    }
    h2 {
      color: #2c3e50;
      margin-top: 30px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      font-size: 1.4em;
    }
    .section-description {
      font-style: italic;
      color: #666;
      margin-bottom: 15px;
      padding: 10px;
      background: #f5f5f5;
      border-left: 3px solid #3498db;
      font-size: 0.95em;
    }
    h3 {
      color: #34495e;
      margin-top: 20px;
      font-size: 1.2em;
    }
    .category-description {
      font-style: italic;
      color: #777;
      font-size: 0.9em;
      margin-bottom: 10px;
    }
    .item {
      margin-bottom: 15px;
      padding: 12px;
      background: #fafafa;
      border-radius: 5px;
      border: 1px solid #eee;
    }
    .item-label {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 5px;
    }
    .item-value {
      color: #333;
    }
    .item-value-list {
      margin: 5px 0 0 0;
      padding-left: 20px;
    }
    .item-value-list li {
      margin: 3px 0;
    }
    .sensitive-value {
      font-family: monospace;
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
      color: #666;
    }
    .sensitive-toggle {
      margin-left: 8px;
      padding: 2px 8px;
      font-size: 0.8em;
      border: 1px solid #ddd;
      border-radius: 3px;
      background: #fff;
      cursor: pointer;
    }
    .sensitive-toggle:hover {
      background: #f0f0f0;
    }
    .sensitive-indicator {
      display: inline-block;
      margin-left: 5px;
      font-size: 0.8em;
      color: #e74c3c;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    @media print {
      body {
        max-width: none;
        padding: 0;
      }
      .toolbar {
        display: none;
      }
      .section {
        page-break-inside: avoid;
      }
      h2 {
        page-break-after: avoid;
      }
      .sensitive-toggle {
        display: none;
      }
    }
    @media (max-width: 600px) {
      body {
        padding: 15px;
      }
      h1 {
        font-size: 1.5em;
      }
      .toolbar {
        flex-direction: column;
      }
      .toolbar button {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 ${escapeHTML(preview.title)}</h1>
    <div class="generated-at">生成时间: ${escapeHTML(formattedDate)}</div>
    <div class="toolbar">
      <button onclick="window.print()">🖨️ 打印</button>
      <button onclick="toggleAllSensitive()">👁️ 显示/隐藏敏感信息</button>
    </div>
  </div>
  ${sectionsHTML.length > 0 ? sectionsHTML : '<div class="empty-state">暂无填写内容</div>'}
  <script>
    let showSensitive = false;
    function toggleAllSensitive() {
      showSensitive = !showSensitive;
      const sensitiveElements = document.querySelectorAll('.sensitive-value');
      sensitiveElements.forEach(el => {
        const originalValue = el.getAttribute('data-original');
        const maskedValue = el.getAttribute('data-masked');
        el.textContent = showSensitive ? originalValue : maskedValue;
      });
    }
    function toggleSensitive(id) {
      const el = document.getElementById(id);
      if (el) {
        const originalValue = el.getAttribute('data-original');
        const maskedValue = el.getAttribute('data-masked');
        const isShowing = el.textContent === originalValue;
        el.textContent = isShowing ? maskedValue : originalValue;
      }
    }
  </script>
</body>
</html>`;
  }

  /**
   * Render a section to HTML
   */
  private renderSectionToHTML(section: PreviewSection): string {
    const categoriesHTML = section.categories.map(category => 
      this.renderCategoryToHTML(category)
    ).join('\n');

    const descriptionHTML = section.description 
      ? `<div class="section-description">${escapeHTML(section.description)}</div>`
      : '';

    return `
  <div class="section">
    <h2>${escapeHTML(section.name)}</h2>
    ${descriptionHTML}
    ${categoriesHTML}
  </div>`;
  }

  /**
   * Render a category to HTML
   */
  private renderCategoryToHTML(category: PreviewCategory): string {
    const itemsHTML = category.items.map((item, index) => 
      this.renderItemToHTML(item, index)
    ).join('\n');

    const descriptionHTML = category.description
      ? `<div class="category-description">${escapeHTML(category.description)}</div>`
      : '';

    return `
    <div class="category">
      <h3>${escapeHTML(category.name)}</h3>
      ${descriptionHTML}
      ${itemsHTML}
    </div>`;
  }

  /**
   * Render an item to HTML
   */
  private renderItemToHTML(item: PreviewItem, index: number): string {
    const sensitiveIndicator = item.sensitive 
      ? '<span class="sensitive-indicator">🔒</span>' 
      : '';

    if (Array.isArray(item.value)) {
      // Render as list
      const listItems = item.value.map(v => `<li>${escapeHTML(v)}</li>`).join('\n');
      return `
      <div class="item">
        <div class="item-label">${escapeHTML(item.label)}${sensitiveIndicator}</div>
        <ul class="item-value-list">
          ${listItems}
        </ul>
      </div>`;
    } else {
      // Render as single value
      const valueHTML = item.sensitive
        ? `<span class="sensitive-value" id="sensitive-${index}" data-original="${escapeHTML(item.value)}" data-masked="${maskSensitiveValue(item.value)}">${maskSensitiveValue(item.value)}</span><button class="sensitive-toggle" onclick="toggleSensitive('sensitive-${index}')">👁️ 显示</button>`
        : escapeHTML(item.value);

      return `
      <div class="item">
        <div class="item-label">${escapeHTML(item.label)}${sensitiveIndicator}</div>
        <div class="item-value">${valueHTML}</div>
      </div>`;
    }
  }
}

// Export singleton instance
export const previewService = new PreviewService();

// Export class for testing
export { PreviewService };
