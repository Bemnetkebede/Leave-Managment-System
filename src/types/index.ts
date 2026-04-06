import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type LeaveBalance = Database['public']['Tables']['leave_balances']['Row']
export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']

// Extended type for when you join profiles onto leave requests
export interface LeaveRequestWithProfile extends LeaveRequest {
  profiles?: Pick<Profile, 'id' | 'email' | 'full_name' | 'role'>
}
