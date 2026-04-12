import { create } from 'zustand'
import { LeaveRequest } from '@/types'

interface UIState {
  isApplyLeaveModalOpen: boolean
  activeTab: 'my-requests' | 'team-requests' | 'balance'
  selectedRequest: LeaveRequest | null
  
  setApplyLeaveModalOpen: (isOpen: boolean) => void
  setActiveTab: (tab: 'my-requests' | 'team-requests' | 'balance') => void
  setSelectedRequest: (request: LeaveRequest | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  isApplyLeaveModalOpen: false,
  activeTab: 'my-requests',
  selectedRequest: null,

  setApplyLeaveModalOpen: (isOpen) => set({ isApplyLeaveModalOpen: isOpen }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedRequest: (request) => set({ selectedRequest: request }),
}))
