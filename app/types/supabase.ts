Need to install the following packages:
supabase@2.19.7
Ok to proceed? (y) 

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
      typing_results: {
        Row: {
          id: string
          created_at: string
          user_id: string
          wpm: number
          accuracy: number
          errors: number
          characters: number
          duration: number
          mode: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          wpm: number
          accuracy: number
          errors: number
          characters: number
          duration: number
          mode: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          wpm?: number
          accuracy?: number
          errors?: number
          characters?: number
          duration?: number
          mode?: string
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
