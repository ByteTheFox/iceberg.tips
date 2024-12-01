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
      business_reports: {
        Row: {
          id: string
          created_at: string
          business_name: string
          address: string
          city: string
          state: string
          zip_code: string
          tip_practice: string
          details: string | null
          latitude: number
          longitude: number
          reported_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          business_name: string
          address: string
          city: string
          state: string
          zip_code: string
          tip_practice: string
          details?: string | null
          latitude: number
          longitude: number
          reported_by: string
        }
        Update: {
          id?: string
          created_at?: string
          business_name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          tip_practice?: string
          details?: string | null
          latitude?: number
          longitude?: number
          reported_by?: string
        }
      }
    }
  }
}