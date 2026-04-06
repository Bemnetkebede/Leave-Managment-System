import { Database } from '@/types/database';

export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'];
export type LeaveBalance = Database['public']['Tables']['leave_balances']['Row'];

/**
 * Calculates the total working days between two dates, excluding weekends and requested holidays.
 */
export const calculateWorkingDays = (startDate: Date, endDate: Date, holidays: Date[] = []): number => {
  let count = 0;
  const curDate = new Date(startDate.getTime());
  
  const holidayTimes = holidays.map(h => {
    const d = new Date(h);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    curDate.setHours(0, 0, 0, 0);
    
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidayTimes.includes(curDate.getTime());

    if (!isWeekend && !isHoliday) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
};

/**
 * Validates if a user has sufficient leave balance to accommodate the requested days.
 */
export const validateLeaveRequest = (
  requestedDays: number, 
  balance: LeaveBalance
): { isValid: boolean; error?: string } => {
  if (requestedDays <= 0) {
    return { isValid: false, error: "Requested days must be greater than zero." };
  }
  
  const availableBalance = balance.total_days - balance.used_days;
  if (requestedDays > availableBalance) {
    return { 
      isValid: false, 
      error: `Insufficient balance. You have ${availableBalance} days remaining but requested ${requestedDays} days.` 
    };
  }

  return { isValid: true };
};

/**
 * Ensures a new leave request does not conflict or overlap with existing (approved/pending) requests.
 */
export const checkLeaveConflict = (
  startDate: Date, 
  endDate: Date, 
  existingRequests: LeaveRequest[]
): boolean => {
  const newStart = startDate.getTime();
  const newEnd = endDate.getTime();

  return existingRequests.some(req => {
    if (req.status === 'rejected') return false;

    const existingStart = new Date(req.start_date).getTime();
    const existingEnd = new Date(req.end_date).getTime();

    // Overlap occurs if new Start Date <= existing End Date AND new End Date >= existing Start Date
    return (newStart <= existingEnd) && (newEnd >= existingStart);
  });
};

/**
 * Computes and triggers a new balance state given the days to deduct. 
 * This returns the pure data block to be saved into Supabase via the caller.
 */
export const updateLeaveBalance = (
  daysToDeduct: number,
  currentBalance: LeaveBalance
): LeaveBalance => {
  const newUsedDays = currentBalance.used_days + daysToDeduct;
  
  if (newUsedDays > currentBalance.total_days) {
    throw new Error("Deduction computation exceeds total allocated days.");
  }
  
  return {
    ...currentBalance,
    used_days: newUsedDays
  };
};
