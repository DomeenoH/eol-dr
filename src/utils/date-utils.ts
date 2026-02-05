/**
 * Format relative time in Chinese
 * @param date - The date to format
 * @returns Relative time string in Chinese
 */
export function formatRelativeTime(date: Date | null | undefined): string {
  if (!date) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Handle future dates (shouldn't happen, but just in case)
  if (diffMs < 0) {
    return '刚刚';
  }

  // Less than 10 seconds
  if (diffSeconds < 10) {
    return '刚刚';
  }

  // Less than 1 minute
  if (diffSeconds < 60) {
    return `${diffSeconds}秒前`;
  }

  // Less than 1 hour
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }

  // Less than 7 days
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }

  // More than 7 days - show date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // If same year, don't show year
  if (year === now.getFullYear()) {
    return `${month}月${day}日 ${hours}:${minutes}`;
  }

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}
