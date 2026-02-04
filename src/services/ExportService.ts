/**
 * ExportService
 * Service for exporting and importing checklist data in various formats
 * 
 * Requirements: 4.1-4.5
 * - JSON format for data backup and cross-device migration
 * - Markdown format similar to original checklist.md structure
 * - HTML format for printing
 * - Include export timestamp in exported files
 */

import type { ChecklistData, ExportedData, ExportMetadata, ItemValue, ItemValueObject } from '../types/checklist-data';
import type { ProgressState } from '../types/progress';
import type { ChecklistStructure, Section, Category, ItemDefinition } from '../types/checklist-structure';
import { checklistStructure } from '../data/checklistStructure';

/**
 * Current application version
 */
const APP_VERSION = '1.0.0';

/**
 * Custom error class for export-related errors
 */
export class ExportError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_JSON' | 'INVALID_STRUCTURE' | 'VERSION_MISMATCH' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

/**
 * Interface for ExportService
 */
export interface IExportService {
  toJSON(data: ChecklistData, progress?: ProgressState): string;
  fromJSON(json: string): ExportedData;
  toMarkdown(data: ChecklistData): string;
  toHTML(data: ChecklistData): string;
  downloadFile(content: string, filename: string, mimeType: string): void;
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
 * Get display value for an item
 */
function getDisplayValue(
  item: ItemDefinition,
  value: ItemValue | undefined,
  maskSensitive: boolean = true
): string {
  if (!isValueFilled(value)) {
    return '';
  }

  if (typeof value === 'string') {
    if (item.sensitive && maskSensitive) {
      return maskSensitiveValue(value);
    }
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
 * Render a group item value to markdown
 */
function renderGroupToMarkdown(
  fields: ItemDefinition[],
  value: ItemValueObject,
  indent: string = ''
): string {
  const lines: string[] = [];
  
  for (const field of fields) {
    const fieldValue = value[field.id];
    if (!isValueFilled(fieldValue as ItemValue)) {
      continue;
    }

    let displayValue: string;
    if (field.type === 'select') {
      displayValue = getSelectLabel(field, fieldValue as string);
    } else if (field.type === 'checkbox') {
      displayValue = fieldValue ? '✅' : '❌';
    } else if (field.sensitive) {
      displayValue = maskSensitiveValue(fieldValue as string);
    } else {
      displayValue = String(fieldValue);
    }

    lines.push(`${indent}- **${field.label}**: ${displayValue}`);
  }

  return lines.join('\n');
}

/**
 * Render a group item value to HTML
 */
function renderGroupToHTML(
  fields: ItemDefinition[],
  value: ItemValueObject
): string {
  const rows: string[] = [];
  
  for (const field of fields) {
    const fieldValue = value[field.id];
    if (!isValueFilled(fieldValue as ItemValue)) {
      continue;
    }

    let displayValue: string;
    if (field.type === 'select') {
      displayValue = getSelectLabel(field, fieldValue as string);
    } else if (field.type === 'checkbox') {
      displayValue = fieldValue ? '✅' : '❌';
    } else if (field.sensitive) {
      displayValue = `<span class="sensitive">${maskSensitiveValue(fieldValue as string)}</span>`;
    } else {
      displayValue = escapeHTML(String(fieldValue));
    }

    rows.push(`<div class="field"><span class="field-label">${escapeHTML(field.label)}:</span> <span class="field-value">${displayValue}</span></div>`);
  }

  return rows.join('\n');
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
 * ExportService implementation
 */
class ExportService implements IExportService {
  private structure: ChecklistStructure;

  constructor() {
    this.structure = checklistStructure;
  }

  /**
   * Export checklist data to JSON format
   * @param data - ChecklistData to export
   * @param progress - Optional ProgressState to include
   * @returns JSON string with metadata
   */
  toJSON(data: ChecklistData, progress?: ProgressState): string {
    const metadata: ExportMetadata = {
      exportedAt: new Date().toISOString(),
      version: data.version || '1.0.0',
      appVersion: APP_VERSION,
    };

    const exportedData: ExportedData = {
      metadata,
      data,
      progress: progress || {
        overall: 0,
        sections: {},
        currentPosition: { sectionId: '', categoryId: '' },
        mode: 'guided',
        lastVisited: new Date().toISOString(),
      },
    };

    return JSON.stringify(exportedData, null, 2);
  }

  /**
   * Import checklist data from JSON format
   * @param json - JSON string to parse
   * @returns ExportedData object
   * @throws ExportError if JSON is invalid or structure is incorrect
   */
  fromJSON(json: string): ExportedData {
    let parsed: unknown;
    
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new ExportError(
        'Invalid JSON format. Please check the file content.',
        'INVALID_JSON'
      );
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new ExportError(
        'Invalid data structure. Expected an object.',
        'INVALID_STRUCTURE'
      );
    }

    const obj = parsed as Record<string, unknown>;

    // Check if it's the new ExportedData format with metadata
    if (obj.metadata && obj.data) {
      const exportedData = obj as unknown as ExportedData;
      
      // Validate metadata
      if (!exportedData.metadata.exportedAt || !exportedData.metadata.version) {
        throw new ExportError(
          'Invalid metadata structure.',
          'INVALID_STRUCTURE'
        );
      }

      // Validate data
      if (!exportedData.data || typeof exportedData.data !== 'object') {
        throw new ExportError(
          'Invalid data structure.',
          'INVALID_STRUCTURE'
        );
      }

      return exportedData;
    }

    // Handle legacy format (just ChecklistData without metadata wrapper)
    if (obj.version && obj.sections) {
      const legacyData = obj as unknown as ChecklistData;
      
      return {
        metadata: {
          exportedAt: legacyData.lastModified || new Date().toISOString(),
          version: legacyData.version,
          appVersion: APP_VERSION,
        },
        data: legacyData,
        progress: {
          overall: 0,
          sections: {},
          currentPosition: { sectionId: '', categoryId: '' },
          mode: 'guided',
          lastVisited: new Date().toISOString(),
        },
      };
    }

    throw new ExportError(
      'Unrecognized data format. Expected ExportedData or ChecklistData structure.',
      'INVALID_STRUCTURE'
    );
  }

  /**
   * Export checklist data to Markdown format
   * Similar to original checklist.md structure
   * @param data - ChecklistData to export
   * @returns Markdown string
   */
  toMarkdown(data: ChecklistData): string {
    const lines: string[] = [];
    const exportTime = formatDate(new Date().toISOString());

    // Header
    lines.push('# End-of-life Disaster Response Checklist');
    lines.push('');
    lines.push(`> 导出时间: ${exportTime}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // Render each section
    for (const section of this.structure.sections) {
      const sectionData = data.sections?.[section.id];
      const sectionContent = this.renderSectionToMarkdown(section, sectionData);
      
      if (sectionContent) {
        lines.push(sectionContent);
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Render a section to Markdown
   */
  private renderSectionToMarkdown(
    section: Section,
    sectionData: { categories: Record<string, { items: Record<string, ItemValue | ItemValue[]> }> } | undefined
  ): string {
    const lines: string[] = [];
    
    lines.push(`## ${section.name}`);
    lines.push('');
    
    if (section.description) {
      lines.push(`> ${section.description}`);
      lines.push('');
    }

    let hasContent = false;

    for (const category of section.categories) {
      const categoryData = sectionData?.categories?.[category.id];
      const categoryContent = this.renderCategoryToMarkdown(category, categoryData);
      
      if (categoryContent) {
        lines.push(categoryContent);
        lines.push('');
        hasContent = true;
      }
    }

    return hasContent ? lines.join('\n') : '';
  }

  /**
   * Render a category to Markdown
   */
  private renderCategoryToMarkdown(
    category: Category,
    categoryData: { items: Record<string, ItemValue | ItemValue[]> } | undefined
  ): string {
    const lines: string[] = [];
    let hasContent = false;

    lines.push(`### ${category.name}`);
    lines.push('');

    if (category.description) {
      lines.push(`*${category.description}*`);
      lines.push('');
    }

    for (const item of category.items) {
      const itemValue = categoryData?.items?.[item.id];
      const itemContent = this.renderItemToMarkdown(item, itemValue);
      
      if (itemContent) {
        lines.push(itemContent);
        hasContent = true;
      }
    }

    return hasContent ? lines.join('\n') : '';
  }

  /**
   * Render an item to Markdown
   */
  private renderItemToMarkdown(
    item: ItemDefinition,
    value: ItemValue | ItemValue[] | undefined
  ): string {
    if (!value) {
      return '';
    }

    const lines: string[] = [];

    if (item.repeatable && Array.isArray(value)) {
      // Handle repeatable items
      const filledValues = value.filter(v => isValueFilled(v));
      if (filledValues.length === 0) {
        return '';
      }

      lines.push(`#### ${item.label}`);
      lines.push('');

      filledValues.forEach((v, index) => {
        if (item.type === 'group' && item.fields) {
          lines.push(`**${index + 1}.**`);
          lines.push(renderGroupToMarkdown(item.fields, v as ItemValueObject, '  '));
          lines.push('');
        } else {
          const displayValue = getDisplayValue(item, v);
          if (displayValue) {
            lines.push(`- ${displayValue}`);
          }
        }
      });
    } else if (item.type === 'group' && item.fields) {
      // Handle single group item
      if (!isValueFilled(value as ItemValue)) {
        return '';
      }
      lines.push(`#### ${item.label}`);
      lines.push('');
      lines.push(renderGroupToMarkdown(item.fields, value as ItemValueObject, ''));
      lines.push('');
    } else {
      // Handle simple items
      const displayValue = getDisplayValue(item, value as ItemValue);
      if (!displayValue) {
        return '';
      }
      lines.push(`- **${item.label}**: ${displayValue}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Export checklist data to HTML format for printing
   * @param data - ChecklistData to export
   * @returns HTML string
   */
  toHTML(data: ChecklistData): string {
    const exportTime = formatDate(new Date().toISOString());
    
    const sections: string[] = [];
    
    for (const section of this.structure.sections) {
      const sectionData = data.sections?.[section.id];
      const sectionHTML = this.renderSectionToHTML(section, sectionData);
      
      if (sectionHTML) {
        sections.push(sectionHTML);
      }
    }

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>End-of-life Disaster Response Checklist</title>
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
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    h2 {
      color: #2c3e50;
      margin-top: 30px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    h3 {
      color: #34495e;
      margin-top: 20px;
    }
    h4 {
      color: #555;
      margin-top: 15px;
      margin-bottom: 10px;
    }
    .export-info {
      background: #f8f9fa;
      padding: 10px 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      font-size: 0.9em;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-description {
      font-style: italic;
      color: #666;
      margin-bottom: 15px;
      padding: 10px;
      background: #f5f5f5;
      border-left: 3px solid #3498db;
    }
    .category {
      margin-bottom: 20px;
      padding-left: 10px;
    }
    .category-description {
      font-style: italic;
      color: #777;
      font-size: 0.9em;
      margin-bottom: 10px;
    }
    .item {
      margin-bottom: 15px;
      padding: 10px;
      background: #fafafa;
      border-radius: 5px;
    }
    .item-group {
      margin-bottom: 10px;
      padding: 10px;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 5px;
    }
    .item-index {
      font-weight: bold;
      color: #3498db;
      margin-bottom: 5px;
    }
    .field {
      margin: 5px 0;
    }
    .field-label {
      font-weight: 600;
      color: #555;
    }
    .field-value {
      color: #333;
    }
    .sensitive {
      font-family: monospace;
      background: #f0f0f0;
      padding: 2px 5px;
      border-radius: 3px;
    }
    .simple-item {
      margin: 8px 0;
    }
    .simple-item .label {
      font-weight: 600;
    }
    @media print {
      body {
        max-width: none;
        padding: 0;
      }
      .section {
        page-break-inside: avoid;
      }
      h2 {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <h1>📋 End-of-life Disaster Response Checklist</h1>
  <div class="export-info">
    <strong>导出时间:</strong> ${escapeHTML(exportTime)}
  </div>
  ${sections.join('\n')}
</body>
</html>`;
  }

  /**
   * Render a section to HTML
   */
  private renderSectionToHTML(
    section: Section,
    sectionData: { categories: Record<string, { items: Record<string, ItemValue | ItemValue[]> }> } | undefined
  ): string {
    const categories: string[] = [];
    let hasContent = false;

    for (const category of section.categories) {
      const categoryData = sectionData?.categories?.[category.id];
      const categoryHTML = this.renderCategoryToHTML(category, categoryData);
      
      if (categoryHTML) {
        categories.push(categoryHTML);
        hasContent = true;
      }
    }

    if (!hasContent) {
      return '';
    }

    const descriptionHTML = section.description 
      ? `<div class="section-description">${escapeHTML(section.description)}</div>`
      : '';

    return `
  <div class="section">
    <h2>${escapeHTML(section.name)}</h2>
    ${descriptionHTML}
    ${categories.join('\n')}
  </div>`;
  }

  /**
   * Render a category to HTML
   */
  private renderCategoryToHTML(
    category: Category,
    categoryData: { items: Record<string, ItemValue | ItemValue[]> } | undefined
  ): string {
    const items: string[] = [];
    let hasContent = false;

    for (const item of category.items) {
      const itemValue = categoryData?.items?.[item.id];
      const itemHTML = this.renderItemToHTML(item, itemValue);
      
      if (itemHTML) {
        items.push(itemHTML);
        hasContent = true;
      }
    }

    if (!hasContent) {
      return '';
    }

    const descriptionHTML = category.description
      ? `<div class="category-description">${escapeHTML(category.description)}</div>`
      : '';

    return `
    <div class="category">
      <h3>${escapeHTML(category.name)}</h3>
      ${descriptionHTML}
      ${items.join('\n')}
    </div>`;
  }

  /**
   * Render an item to HTML
   */
  private renderItemToHTML(
    item: ItemDefinition,
    value: ItemValue | ItemValue[] | undefined
  ): string {
    if (!value) {
      return '';
    }

    if (item.repeatable && Array.isArray(value)) {
      const filledValues = value.filter(v => isValueFilled(v));
      if (filledValues.length === 0) {
        return '';
      }

      const itemsHTML = filledValues.map((v, index) => {
        if (item.type === 'group' && item.fields) {
          return `
        <div class="item-group">
          <div class="item-index">${index + 1}.</div>
          ${renderGroupToHTML(item.fields, v as ItemValueObject)}
        </div>`;
        } else {
          const displayValue = getDisplayValue(item, v);
          return displayValue ? `<div class="simple-item">${escapeHTML(displayValue)}</div>` : '';
        }
      }).filter(Boolean).join('\n');

      return `
      <div class="item">
        <h4>${escapeHTML(item.label)}</h4>
        ${itemsHTML}
      </div>`;
    } else if (item.type === 'group' && item.fields) {
      if (!isValueFilled(value as ItemValue)) {
        return '';
      }
      return `
      <div class="item">
        <h4>${escapeHTML(item.label)}</h4>
        <div class="item-group">
          ${renderGroupToHTML(item.fields, value as ItemValueObject)}
        </div>
      </div>`;
    } else {
      const displayValue = getDisplayValue(item, value as ItemValue);
      if (!displayValue) {
        return '';
      }
      return `
      <div class="item simple-item">
        <span class="label">${escapeHTML(item.label)}:</span> ${escapeHTML(displayValue)}
      </div>`;
    }
  }

  /**
   * Download a file with the given content
   * @param content - File content
   * @param filename - Name of the file to download
   * @param mimeType - MIME type of the file
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    // Create a Blob with the content
    const blob = new Blob([content], { type: mimeType });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const exportService = new ExportService();

// Export class for testing
export { ExportService };
