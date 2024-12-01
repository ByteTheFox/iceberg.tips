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
        Row: BusinessReport
        Insert: Omit<BusinessReport, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<BusinessReport>
      }
    }
  }
}

export interface BusinessReport {
  id: string
  created_at: string
  business_name: string
  address: string
  city: string
  state: string
  zip_code: string
  tip_practice: TipPractice
  details: string | null
  latitude: number
  longitude: number
  reported_by: string
}

export type TipPractice = 
  | "no_tipping"
  | "living_wage"
  | "traditional"
  | "service_charge"
  | "tip_pooling"
  | "other"