import { parse, format, isValid } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Comprehensive date parsing formats
const DATE_FORMATS = [
  'dd/MM/yyyy',
  'yyyy-MM-dd', 
  'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx', 
  'MM/dd/yyyy',
  'yyyy-MM-dd\'T\'HH:mm:ssXXX'
];


/**
 * Enhanced date parsing with year normalization
 * @param dateString - Date string to parse
 * @returns Parsed date or null if parsing fails
 */
export const parseFlexibleDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;

  const dateStr = String(dateString).trim();
  
  // Handle Excel serial numbers
  if (/^\d{5,}$/.test(dateStr)) {
    const excelDate = XLSX.SSF.parse_date_code(Number(dateStr));
    return new Date(excelDate.y, excelDate.m - 1, excelDate.d);
  }

  // Try all defined formats
  for (const fmt of DATE_FORMATS) {
    const parsedDate = parse(dateStr, fmt, new Date());
    if (isValid(parsedDate)) {
      // Normalize years - if year is less than 100, assume it's meant to be 20xx
      if (parsedDate.getFullYear() < 100) {
        parsedDate.setFullYear(2000 + parsedDate.getFullYear());
      }
      // If year is less than 1000, assume data corruption and fix to 20xx
      if (parsedDate.getFullYear() < 1000) {
        parsedDate.setFullYear(2000 + (parsedDate.getFullYear() % 100));
      }
      return parsedDate;
    }
  }

  return null;
};
/**
 * Formats date to DD/MM/YYYY for consistent Excel and UI display
 * @param date - Date to format
 * @returns Formatted date string or empty string
 */
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  const parsedDate = parseFlexibleDate(date);
  
  return parsedDate && isValid(parsedDate) 
    ? format(parsedDate, 'dd/MM/yyyy') 
    : '';
};

/**
 * Converts date to ISO format for backend storage
 * @param date - Date to convert
 * @returns ISO formatted date string or empty string
 */
export const formatDateForStorage = (date) => {
  if (!date) return '';
  
  const parsedDate = parseFlexibleDate(date);
  
  return parsedDate && isValid(parsedDate) 
    ? format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") 
    : '';
};

/**
 * Creates a date picker compatible format
 * @param date - Date to convert
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForPicker = (date) => {
  if (!date) return '';
  
  const parsedDate = parseFlexibleDate(date);
  
  return parsedDate && isValid(parsedDate) 
    ? format(parsedDate, 'yyyy-MM-dd') 
    : '';
};

/**
 * Converts UTC date to zoned time for specific time zone
 * @param date - Date to convert (in UTC)
 * @param timeZone - Time zone string (e.g., 'Asia/Kolkata')
 * @returns Zoned Date
 */
export const convertUTCToZonedTime = (date, timeZone) => {
  return toZonedTime(date, timeZone);
};