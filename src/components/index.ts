/**
 * Components barrel export file
 * 
 * This file exports all UI components for the EOL Checklist Webapp.
 */

export { Layout } from './Layout';
export type { LayoutProps } from './Layout';

export { Navigation } from './Navigation';
export type { NavigationProps } from './Navigation';

export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps, SectionProgressData } from './ProgressBar';

export { SaveStatus, SaveStatusBadge, formatRelativeTime } from './SaveStatus';
export type { SaveStatusProps, SaveStatusType } from './SaveStatus';

export { PlatformCard, platformBranding } from './PlatformCard';
export type { PlatformCardProps, PlatformField, PlatformData } from './PlatformCard';

export { ContactBubble, ContactBubbleForm, ContactBubbleList, contactPlatforms, getInitials } from './ContactBubble';
export type { ContactBubbleProps, ContactBubbleFormProps, ContactBubbleListProps } from './ContactBubble';

export { ItemForm } from './ItemForm';
export type { ItemFormProps } from './ItemForm';

export { getInputType, getFieldIcon } from './formUtils';

export { RepeatableItemList, getDefaultValue } from './RepeatableItemList';
export type { RepeatableItemListProps } from './RepeatableItemList';

export { SectionView } from './SectionView';
export type { SectionViewProps } from './SectionView';

export { CategoryForm } from './CategoryForm';
export type { CategoryFormProps } from './CategoryForm';

export { ZenModeView } from './ZenModeView';
export type { ZenModeViewProps } from './ZenModeView';
