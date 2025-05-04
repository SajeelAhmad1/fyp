// lib/utils.ts

/**
 * Formats a date string or Date object into a readable format
 * @param dateString - Date string or Date object to format
 * @returns Formatted date string (e.g. "March 19, 2025")
 */
export function formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
  
  /**
   * Formats price as currency
   * @param price - Price to format
   * @returns Formatted price string (e.g. "£19.99")
   */
  export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  }
  
  /**
   * Truncates text to specified length with ellipsis
   * @param text - Text to truncate
   * @param length - Maximum length before truncation
   * @returns Truncated text with ellipsis if needed
   */
  export function truncateText(text: string, length: number = 100): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  }
  
  /**
   * Generate a random order ID (for demo purposes)
   * @returns Random order ID string
   */
  export function generateOrderId(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }