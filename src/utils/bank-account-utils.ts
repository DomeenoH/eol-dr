import type { BankAccountType } from '../types/platform';

/**
 * Account type configuration for styling and display
 */
export const accountTypeConfig: Record<BankAccountType, {
  label: string;
  labelEn: string;
}> = {
  checking: {
    label: '支票账户',
    labelEn: 'Checking',
  },
  savings: {
    label: '储蓄账户',
    labelEn: 'Savings',
  },
  both: {
    label: '两者都有',
    labelEn: 'Both',
  },
};

/**
 * Available account types for selection
 */
export const accountTypes: BankAccountType[] = ['checking', 'savings', 'both'];

/**
 * Get label for an account type
 */
export const getAccountTypeLabel = (type: BankAccountType): string => {
  return accountTypeConfig[type]?.label || '未知类型';
};

/**
 * Get English label for an account type
 */
export const getAccountTypeLabelEn = (type: BankAccountType): string => {
  return accountTypeConfig[type]?.labelEn || 'Unknown';
};
