export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      mosques: {
        Row: {
          id: string
          name: string
          address: string | null
          lat: number | null
          lng: number | null
          description: string | null
          bank_name: string | null
          bank_account: string | null
          bank_holder: string | null
          is_verified: boolean
          tier: string
          photo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['mosques']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['mosques']['Insert']>
      }
      mosque_roles: {
        Row: {
          id: string
          mosque_id: string
          user_id: string
          role: 'bendahara' | 'dewan' | 'admin'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['mosque_roles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['mosque_roles']['Insert']>
      }
      follows: {
        Row: {
          id: string
          user_id: string
          mosque_id: string
          notify_kajian: boolean
          notify_event: boolean
          notify_donasi: boolean
          notify_darurat: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['follows']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['follows']['Insert']>
      }
      prayer_schedules: {
        Row: {
          id: string
          mosque_id: string
          date: string
          subuh: string | null
          syuruq: string | null
          dzuhur: string | null
          ashar: string | null
          maghrib: string | null
          isya: string | null
          iqamah_subuh_offset: number
          iqamah_dzuhur_offset: number
          iqamah_ashar_offset: number
          iqamah_maghrib_offset: number
          iqamah_isya_offset: number
        }
        Insert: Omit<Database['public']['Tables']['prayer_schedules']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['prayer_schedules']['Insert']>
      }
      kajians: {
        Row: {
          id: string
          mosque_id: string
          title: string
          ustadz: string | null
          day_of_week: number | null
          time_start: string | null
          topic: string | null
          is_recurring: boolean
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['kajians']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['kajians']['Insert']>
      }
      kas_transactions: {
        Row: {
          id: string
          mosque_id: string
          type: 'in' | 'out'
          amount: number
          description: string
          receipt_url: string | null
          status: 'draft' | 'approved' | 'rejected'
          created_by: string | null
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['kas_transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['kas_transactions']['Insert']>
      }
      infaq_codes: {
        Row: {
          id: string
          mosque_id: string
          user_id: string | null
          nominal: number
          unique_code: number
          total_transfer: number
          campaign_id: string | null
          status: 'pending' | 'verified' | 'rejected' | 'expired'
          verified_by: string | null
          verified_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['infaq_codes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['infaq_codes']['Insert']>
      }
      campaigns: {
        Row: {
          id: string
          mosque_id: string
          title: string
          description: string | null
          target_amount: number | null
          raised_amount: number
          photo_url: string | null
          deadline: string | null
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>
      }
      campaign_updates: {
        Row: {
          id: string
          campaign_id: string
          content: string | null
          photo_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['campaign_updates']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['campaign_updates']['Insert']>
      }
      marketplace_products: {
        Row: {
          id: string
          mosque_id: string
          seller_user_id: string | null
          name: string
          description: string | null
          price: number | null
          photo_url: string | null
          wa_number: string | null
          status: 'pending' | 'approved' | 'rejected'
          approved_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['marketplace_products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['marketplace_products']['Insert']>
      }
      contact_hashes: {
        Row: {
          id: string
          user_id: string
          phone_hash: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contact_hashes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contact_hashes']['Insert']>
      }
      announcements: {
        Row: {
          id: string
          mosque_id: string
          content: string
          category: 'info' | 'event' | 'urgent' | 'donasi'
          is_active: boolean
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
    }
  }
}

// Convenience types
export type Mosque = Database['public']['Tables']['mosques']['Row']
export type MosqueRole = Database['public']['Tables']['mosque_roles']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type PrayerSchedule = Database['public']['Tables']['prayer_schedules']['Row']
export type Kajian = Database['public']['Tables']['kajians']['Row']
export type KasTransaction = Database['public']['Tables']['kas_transactions']['Row']
export type InfaqCode = Database['public']['Tables']['infaq_codes']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
