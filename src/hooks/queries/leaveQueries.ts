import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { LeaveRequest, LeaveBalance } from '@/types'

export function useLeaveRequests() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['leaveRequests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        
      if (error) throw error
      return data as LeaveRequest[]
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useLeaveBalance() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['leaveBalance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const currentYear = new Date().getFullYear()
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', currentYear)
        
      if (error) throw error
      return data as LeaveBalance[]
    }
  })
}

export function useTeamRequests() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['teamRequests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      // Depending on your actual DB schema, replace 'manager_id' with the correct relation if necessary
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('manager_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        
      if (error) throw error
      return data as LeaveRequest[]
    }
  })
}

export function useLeaveStats(year?: number) {
  const supabase = createClient()
  const currentYear = year || new Date().getFullYear()
  
  return useQuery({
    queryKey: ['leaveStats', currentYear],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase.rpc('get_user_leave_stats', {
        p_user_id: user.id,
        p_year: currentYear
      })
        
      if (error) throw error
      return data as {
        total: number
        used: number
        balance: number
        pending: number
        distribution: Array<{ name: string; value: number }>
      }
    }
  })
}
