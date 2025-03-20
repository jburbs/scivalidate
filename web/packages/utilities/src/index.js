/**
 * SciValidate utility functions
 */

/**
 * Format a date using the locale date format
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString(undefined, options);
};

/**
 * Format a citation string from author and title
 * @param {string} author - The author name
 * @param {string} title - The publication title
 * @param {number} year - The publication year
 * @returns {string} - Formatted citation
 */
export const formatCitation = (author, title, year) => {
  return `${author} (${year}). ${title}.`;
};

/**
 * Truncate text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Generate a citation key for a paper
 * @param {Object} paper - Paper metadata
 * @returns {string} - Citation key
 */
export const generateCitationKey = (paper) => {
  const authorLastName = paper.author.split(' ').pop().toLowerCase();
  const year = new Date(paper.published).getFullYear();
  return `${authorLastName}${year}`;
};