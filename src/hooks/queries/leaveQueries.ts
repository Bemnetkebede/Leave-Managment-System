import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { LeaveRequest, LeaveBalance, Profile } from '@/types'

const supabase = createClient()

export function useLeaveRequests() {
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
      return (data || []) as LeaveRequest[]
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useLeaveBalance() {
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
      return (data || []) as LeaveBalance[]
    }
  })
}

export function useTeamRequests() {
  return useQuery({
    queryKey: ['teamRequests'],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')
      
      // AUTO-ADOPTION: If manager has no team, claim unassigned employees
      const { data: existingTeam } = await supabase
        .from('profiles')
        .select('id')
        .eq('manager_id', authUser.id)
        .neq('id', authUser.id);

      if (!existingTeam || existingTeam.length === 0) {
        // Find and link unassigned profiles silently
        await supabase
          .from('profiles')
          .update({ manager_id: authUser.id })
          .is('manager_id', null)
          .neq('id', authUser.id);
      }
      
      // 1. Fetch ALL profiles in the database
      const { data: members, error: mError } = await supabase
        .from('profiles')
        .select('id, full_name, email, manager_id');
        
      if (mError) throw mError;
      const memberIds = members?.map(m => m.id) || [];
      
      // Guarantee the manager's own ID is always included for dummy data testing
      if (!memberIds.includes(authUser.id)) {
        memberIds.push(authUser.id);
      }
      
      if (memberIds.length === 0) return [];

      // 2. Fetch ALL leave balances
      const { data: balances, error: bError } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('year', new Date().getFullYear());

      if (bError) throw bError;

      // 3. Fetch ALL leave requests
      const { data: requests, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error
      
      return (requests || []).map(req => {
        const profile = members.find(m => m.id === req.user_id);
        const memberBalances = balances.filter(b => b.user_id === req.user_id);
        return {
          ...req,
          profiles: {
            ...profile,
            leave_balances: memberBalances
          } || null
        };
      }) as (LeaveRequest & { profiles: Profile & { leave_balances: LeaveBalance[] } })[]
    }
  })
}

export function useTeamStats() {
  const { data: requests = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ['allLeaveRequestsStats'],
    queryFn: async () => {
      // Direct raw database query as requested: fetch all leave requests in the entire database
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*');
        
      if (error) {
        console.error("Error fetching raw leave_requests:", error);
        throw error;
      }
      return data || [];
    }
  });

  const { data: members = [], isLoading: isMembersLoading } = useTeamMembers();
  
  if (!isRequestsLoading) {
    console.log("Raw Database Leave Requests:", requests); // This will log the true DB state
  }

  const stats = {
    pending: requests.filter((r: any) => r.status === 'pending').length,
    accepted: requests.filter((r: any) => r.status === 'approved').length,
    rejected: requests.filter((r: any) => r.status === 'rejected').length,
    availability: 100
  };

  if (members.length > 0 && requests.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const peopleOnLeave = requests.filter((r: any) => 
      r.status === 'approved' && 
      today >= r.start_date && 
      today <= r.end_date
    ).length;
    
    stats.availability = Math.round(((members.length - peopleOnLeave) / members.length) * 100);
  }

  return { ...stats, isLoading: isRequestsLoading || isMembersLoading };
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error
      return (data || []) as Profile[]
    }
  })
}

export function useLeaveStats(year?: number) {
  const currentYear = year || new Date().getFullYear()
  
  return useQuery({
    queryKey: ['leaveStats', currentYear],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')
      
      const { data, error } = await supabase.rpc('get_user_leave_stats', {
        p_user_id: authUser.id,
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

export function useInitializeDepartment() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Seed some real leave requests using the MANAGER's own ID.
      // RLS only allows users to insert their *own* requests!
      // Since the manager manages themselves, this data will show up on their dashboard.
      await supabase.from('leave_requests').insert([
        { 
          user_id: user.id, 
          leave_type: 'Annual', 
          start_date: new Date().toISOString().split('T')[0], 
          end_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], 
          status: 'pending', 
          days: 3,
          reason: 'Sample Initial Request - Pending Approval'
        },
        { 
          user_id: user.id, 
          leave_type: 'Sick', 
          start_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], 
          end_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], 
          status: 'approved', 
          days: 2,
          reason: 'Sample Approved Request'
        }
      ]);
      
      // Seed balance for the manager
      await supabase.from('leave_balances').upsert({
        user_id: user.id,
        year: new Date().getFullYear(),
        total_days: 21,
        used_days: 2
      }, { onConflict: 'user_id,year' });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      queryClient.invalidateQueries({ queryKey: ['teamRequests'] });
    }
  });
}
