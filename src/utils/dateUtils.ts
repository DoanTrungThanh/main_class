// Utility functions for handling dates in Vietnam timezone (UTC+7)

/**
 * Get current date in Vietnam timezone
 */
export const getCurrentDateVN = (): Date => {
  // Use Intl.DateTimeFormat to get proper Vietnam timezone
  const now = new Date();
  const vnTimeString = now.toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });

  // Ensure we get a valid date object
  const vnDate = new Date(vnTimeString);

  // If the conversion failed, use offset calculation as fallback
  if (isNaN(vnDate.getTime())) {
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const vnTime = utcTime + (7 * 3600000); // UTC+7 for Vietnam
    return new Date(vnTime);
  }

  return vnDate;
};

/**
 * Get today's date string in YYYY-MM-DD format in Vietnam timezone
 */
export const getTodayVN = (): string => {
  const now = new Date();
  // Get date in Vietnam timezone using toLocaleDateString
  const vnDateString = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });

  // Validate the date format (should be YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(vnDateString)) {
    const fallback = now.toISOString().split('T')[0];
    return fallback;
  }

  return vnDateString;
};

/**
 * Format date as YYYY-MM-DD for input fields, ensuring local timezone
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse YYYY-MM-DD string to Date object in local timezone
 */
export const parseInputDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Get week start (Monday) for Vietnamese calendar
 */
export const getWeekStart = (date: Date): Date => {
  // Convert to Vietnam timezone first
  const vnDate = toVietnamTime(date);
  const day = vnDate.getDay();
  // Adjust for Vietnamese week (Monday = 1, Sunday = 0)
  // If it's Sunday (0), we want to go back 6 days to get to Monday
  // If it's any other day, we want to go back (day - 1) days
  const diff = vnDate.getDate() - (day === 0 ? 6 : day - 1);
  const weekStart = new Date(vnDate);
  weekStart.setDate(diff);
  return weekStart;
};

/**
 * Get week end (Sunday) for Vietnamese calendar
 */
export const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

/**
 * Format week range for display
 */
export const formatWeekRange = (date: Date): string => {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  return `${start.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} - ${end.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;
};

/**
 * Get Vietnamese day name
 */
export const getVietnameseDayName = (date: Date): string => {
  // Get day of week in Vietnam timezone
  const vnDate = toVietnamTime(date);
  const dayOfWeek = vnDate.getDay();
  return dayOfWeek === 0 ? 'Chủ nhật' : `Thứ ${dayOfWeek + 1}`;
};

/**
 * Check if a date is today in Vietnam timezone (legacy function, use isTodayVN instead)
 */
export const isToday = (date: string | Date): boolean => {
  return isTodayVN(date);
};

/**
 * Get current week in Vietnam timezone
 */
export const getCurrentWeekVN = (): Date => {
  return getCurrentDateVN();
};

/**
 * Convert any date to Vietnam timezone
 */
export const toVietnamTime = (date: Date): Date => {
  const vnTimeString = date.toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
  const vnDate = new Date(vnTimeString);

  // If the conversion failed, use offset calculation as fallback
  if (isNaN(vnDate.getTime())) {
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const vnTime = utcTime + (7 * 3600000); // UTC+7 for Vietnam
    return new Date(vnTime);
  }

  return vnDate;
};

/**
 * Get date string for Vietnam timezone from any date
 */
export const getVNDateString = (date?: Date): string => {
  const targetDate = date || new Date();
  const vnDateString = targetDate.toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });

  // Validate the date format (should be YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(vnDateString)) {
    // Fallback to manual calculation
    const vnDate = toVietnamTime(targetDate);
    return formatDateForInput(vnDate);
  }

  return vnDateString;
};

/**
 * Format date for display in Vietnamese format with Vietnam timezone
 */
export const formatDateVN = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return dateObj.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};

/**
 * Compare two dates in YYYY-MM-DD format, accounting for Vietnam timezone
 */
export const isSameDateVN = (date1: string | Date, date2: string | Date): boolean => {
  const dateStr1 = typeof date1 === 'string' ? date1 : getVNDateString(date1);
  const dateStr2 = typeof date2 === 'string' ? date2 : getVNDateString(date2);
  return dateStr1 === dateStr2;
};

/**
 * Check if a date is today in Vietnam timezone (improved version)
 */
export const isTodayVN = (date: string | Date): boolean => {
  return isSameDateVN(date, getTodayVN());
};



/**
 * Format datetime for display in Vietnamese format with Vietnam timezone
 */
export const formatDateTimeVN = (date: Date): string => {
  return date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
};
