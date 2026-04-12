import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useCreateLeave() {
  const supabase = createClient()
  const queryClient = useQueryClient()
<<<<<<< HEAD

  return useMutation({
    mutationFn: async (newLeave: { start_date: string; end_date: string; reason: string; leave_type?: string }) => {
      const response = await fetch('/api/leave/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newLeave),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to submit leave request')
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] })
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] })
      queryClient.invalidateQueries({ queryKey: ['leaveStats'] })
    }
  })
}

export function useUpdateLeaveStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestId, status, note }: { requestId: string, status: 'approved' | 'rejected', note?: string }) => {
      const response = await fetch('/api/leave/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          request_id: requestId,
          status,
          manager_note: note ?? null,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update leave status')
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamRequests'] })
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] })
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] })
      queryClient.invalidateQueries({ queryKey: ['leaveStats'] })
=======
  
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
>>>>>>> 216fc4495fa2672be9db4277c8591826e7bdd72b
    }
  })
}
