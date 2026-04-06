import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useCreateLeave() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (newLeave: { start_date: string; end_date: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error } = await (supabase
        .from('leave_requests')
        .insert({
          user_id: user.id,
          start_date: newLeave.start_date,
          end_date: newLeave.end_date,
          reason: newLeave.reason,
          status: 'pending'
        } as any)
        .select()
        .single() as any)
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate both so the UI automatically re-fetches
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] })
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] })
    }
  })
}
