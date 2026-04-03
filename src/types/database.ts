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
          role: 'admin' | 'employee' | 'manager'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'employee' | 'manager'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'employee' | 'manager'
          created_at?: string
        }
      }
      leave_balances: {
        Row: {
          id: string
          user_id: string
          leave_type: 'vacation' | 'sick' | 'personal'
          balance: number
          year: number
        }
        Insert: {
          id?: string
          user_id: string
          leave_type: 'vacation' | 'sick' | 'personal'
          balance: number
          year: number
        }
        Update: {
          id?: string
          user_id?: string
          leave_type?: 'vacation' | 'sick' | 'personal'
          balance?: number
          year?: number
        }
      }
      leave_requests: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string
          reason: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date: string
          reason: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          reason?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
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
