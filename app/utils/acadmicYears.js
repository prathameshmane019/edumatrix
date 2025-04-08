// utils/academicYear.js

/**
 * Calculates the current academic year based on the current date
 * Academic year starts from July (month index 6) and ends in June of the following year
 * @returns {string} Academic year in format "YYYY-YYYY"
 */
export const getCurrentAcademicYear = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // If current month is June (5) or earlier, we're in the academic year that started the previous year
  // If current month is July (6) or later, we're in the academic year starting in the current year
  const startYear = currentMonth <= 5 ? currentYear - 1 : currentYear;
  return `${startYear}-${startYear + 1}`;
};

/**
 * Generates an array of academic years including past, current, and future years
 * @param {number} pastYears How many previous years to include
 * @param {number} futureYears How many future years to include
 * @returns {Array<{value: string, label: string}>} Array of academic year objects
 */
export const getAcademicYears = (pastYears = 5, futureYears = 3) => {
  const currentAcademicYear = getCurrentAcademicYear();
  const currentStartYear = parseInt(currentAcademicYear.split('-')[0]);
  const years = [];
  
  // Add past academic years
  for (let i = 0; i < pastYears; i++) {
    const year = currentStartYear - i;
    years.push({
      value: `${year}-${year + 1}`,
      label: `${year}-${year + 1}`
    });
  }
  
  // Add future academic years (skip current as it's already added)
  for (let i = 1; i <= futureYears; i++) {
    const year = currentStartYear + i;
    years.push({
      value: `${year}-${year + 1}`,
      label: `${year}-${year + 1}`
    });
  }
  
  // Sort years in descending order (most recent first)
  return years.sort((a, b) => {
    const yearA = parseInt(a.value.split('-')[0]);
    const yearB = parseInt(b.value.split('-')[0]);
    return yearB - yearA;
  });
};

/**
 * Validates if a given year string is in correct academic year format
 * @param {string} year Year string to validate
 * @returns {boolean} Whether the year string is valid
 */
export const isValidAcademicYear = (year) => {
  if (!year) return false;
  
  const pattern = /^\d{4}-\d{4}$/;
  if (!pattern.test(year)) return false;
  
  const [startYear, endYear] = year.split('-').map(Number);
  return endYear === startYear + 1;
};

/**
 * Formats a year string into academic year format
 * @param {string|number} year Start year
 * @returns {string} Formatted academic year
 */
export const formatAcademicYear = (year) => {
  const startYear = parseInt(year);
  return `${startYear}-${startYear + 1}`;
};