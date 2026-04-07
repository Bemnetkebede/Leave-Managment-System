export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'employee' | 'manager'
          user_dpt: string | null
          manager_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'employee' | 'manager'
          user_dpt?: string | null
          manager_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'employee' | 'manager'
          user_dpt?: string | null
          manager_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          id: string
          user_id: string
          leave_type: 'vacation' | 'sick' | 'personal'
          balance: number
          total_days: number
          used_days: number
          year: number
        }
        Insert: {
          id?: string
          user_id: string
          leave_type: 'vacation' | 'sick' | 'personal'
          balance: number
          total_days: number
          used_days?: number
          year: number
        }
        Update: {
          id?: string
          user_id?: string
          leave_type?: 'vacation' | 'sick' | 'personal'
          balance?: number
          total_days?: number
          used_days?: number
          year?: number
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          id: string
          user_id: string
          manager_id: string | null
          leave_type: 'vacation' | 'sick' | 'personal'
          start_date: string
          end_date: string
          reason: string
          manager_note: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          manager_id?: string | null
          leave_type: 'vacation' | 'sick' | 'personal'
          start_date: string
          end_date: string
          reason: string
          manager_note?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          manager_id?: string | null
          leave_type?: 'vacation' | 'sick' | 'personal'
          start_date?: string
          end_date?: string
          reason?: string
          manager_note?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}