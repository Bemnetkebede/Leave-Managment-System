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
          updated_at: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'employee' | 'manager'
          user_dpt?: string | null
          manager_id?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'employee' | 'manager'
          user_dpt?: string | null
          manager_id?: string | null
          updated_at?: string
          created_at?: string
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          id: string
          user_id: string
          total: number
          used_days: number
          balance: number
          year: number
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          total: number
          used_days?: number
          balance?: number
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total?: number
          used_days?: number
          balance?: number
          year?: number
          created_at?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          id: string
          user_id: string
          leave_type: 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Court Case' | 'Exam' | 'Unpaid' | 'Other'
          start_date: string
          end_date: string
          days: number
          reason: string
          manager_note: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          leave_type: 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Court Case' | 'Exam' | 'Unpaid' | 'Other'
          start_date: string
          end_date: string
          days: number
          reason: string
          manager_note?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          leave_type?: 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Court Case' | 'Exam' | 'Unpaid' | 'Other'
          start_date?: string
          end_date?: string
          days?: number
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