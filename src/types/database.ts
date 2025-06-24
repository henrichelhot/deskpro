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
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'agent' | 'customer'
          avatar_url: string | null
          is_online: boolean
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'admin' | 'agent' | 'customer'
          avatar_url?: string | null
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'agent' | 'customer'
          avatar_url?: string | null
          is_online?: boolean
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          domain: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          primary_color: string
          secondary_color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      airlines: {
        Row: {
          id: string
          name: string
          email: string
          code: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          email: string
          contact_person: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          contact_person?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          contact_person?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inboxes: {
        Row: {
          id: string
          name: string
          description: string | null
          provider: 'gmail' | 'outlook' | 'imap' | 'pop3' | 'exchange'
          email_address: string
          brand_id: string | null
          is_active: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          provider: 'gmail' | 'outlook' | 'imap' | 'pop3' | 'exchange'
          email_address: string
          brand_id?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          provider?: 'gmail' | 'outlook' | 'imap' | 'pop3' | 'exchange'
          email_address?: string
          brand_id?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          ticket_number: string
          subject: string
          description: string
          status: 'new' | 'open' | 'pending' | 'on-hold' | 'solved' | 'closed'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          satisfaction: 'offered' | 'unoffered' | 'good' | 'bad'
          category: 'service' | 'airline' | 'supplier'
          requester_id: string
          assignee_id: string | null
          organization_id: string | null
          brand_id: string | null
          airline_id: string | null
          supplier_id: string | null
          inbox_id: string | null
          due_date: string | null
          tags: string[]
          custom_fields: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_number?: string
          subject: string
          description: string
          status?: 'new' | 'open' | 'pending' | 'on-hold' | 'solved' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          satisfaction?: 'offered' | 'unoffered' | 'good' | 'bad'
          category: 'service' | 'airline' | 'supplier'
          requester_id: string
          assignee_id?: string | null
          organization_id?: string | null
          brand_id?: string | null
          airline_id?: string | null
          supplier_id?: string | null
          inbox_id?: string | null
          due_date?: string | null
          tags?: string[]
          custom_fields?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_number?: string
          subject?: string
          description?: string
          status?: 'new' | 'open' | 'pending' | 'on-hold' | 'solved' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          satisfaction?: 'offered' | 'unoffered' | 'good' | 'bad'
          category?: 'service' | 'airline' | 'supplier'
          requester_id?: string
          assignee_id?: string | null
          organization_id?: string | null
          brand_id?: string | null
          airline_id?: string | null
          supplier_id?: string | null
          inbox_id?: string | null
          due_date?: string | null
          tags?: string[]
          custom_fields?: Json
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          ticket_id: string
          author_id: string
          content: string
          is_internal: boolean
          attachments: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id: string
          content: string
          is_internal?: boolean
          attachments?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          author_id?: string
          content?: string
          is_internal?: boolean
          attachments?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      ticket_changes: {
        Row: {
          id: string
          ticket_id: string
          agent_id: string
          field_name: string
          old_value: string | null
          new_value: string | null
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          agent_id: string
          field_name: string
          old_value?: string | null
          new_value?: string | null
          action: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          agent_id?: string
          field_name?: string
          old_value?: string | null
          new_value?: string | null
          action?: string
          created_at?: string
        }
      }
      ticket_viewers: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          last_viewed: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          last_viewed?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          last_viewed?: string
        }
      }
      attachments: {
        Row: {
          id: string
          ticket_id: string | null
          comment_id: string | null
          filename: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id?: string | null
          comment_id?: string | null
          filename: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string | null
          comment_id?: string | null
          filename?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_by?: string | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}