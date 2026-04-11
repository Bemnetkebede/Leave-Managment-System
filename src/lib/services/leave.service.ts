import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'];
export type LeaveBalance = Database['public']['Tables']['leave_balances']['Row'];

export interface LeaveStats {
  total: number;
  used: number;
  balance: number;
  pending: number;
  distribution: Array<{ name: string; value: number }>;
}

/**
 * Fetches calculated leave statistics directly from the database (RPC).
 */
export const fetchLeaveStats = async (
  supabase: SupabaseClient,
  userId: string,
  year: number = new Date().getFullYear()
): Promise<LeaveStats> => {
  const { data, error } = await supabase.rpc('get_user_leave_stats', {
    p_user_id: userId,
    p_year: year
  });

  if (error) throw error;
  return data as LeaveStats;
};

/**
 * Calculates working days via Database RPC to ensure consistency.
 */
export const getWorkingDaysFromDB = async (
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<number> => {
  const { data, error } = await supabase.rpc('calculate_working_days', {
    p_start_date: startDate,
    p_end_date: endDate
  });

  if (error) throw error;
  return data as number;
};

/**
 * DEPRECATED: Standard calculations are now handled by database triggers.
 * Keeping for UI-only previews if needed, but not for state updates.
 */
export const calculateWorkingDays = (startDate: Date, endDate: Date, holidays: Date[] = []): number => {
  let count = 0;
  const curDate = new Date(startDate.getTime());
  const holidayTimes = holidays.map(h => new Date(h).setHours(0,0,0,0));

  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayTimes.includes(curDate.setHours(0,0,0,0))) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
};
