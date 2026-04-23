export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          actor_id: string
          changes: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id: string
          changes?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          country: string
          county: string | null
          created_at: string
          id: string
          is_default: boolean
          line_1: string
          line_2: string | null
          organization_id: string
          post_code: string
          town: string
          type: Database["public"]["Enums"]["address_type"]
        }
        Insert: {
          country?: string
          county?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          line_1: string
          line_2?: string | null
          organization_id: string
          post_code: string
          town: string
          type?: Database["public"]["Enums"]["address_type"]
        }
        Update: {
          country?: string
          county?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          line_1?: string
          line_2?: string | null
          organization_id?: string
          post_code?: string
          town?: string
          type?: Database["public"]["Enums"]["address_type"]
        }
        Relationships: [
          {
            foreignKeyName: "addresses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calculator_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
          value?: number
        }
        Relationships: []
      }
      credit_note_lines: {
        Row: {
          credit_note_id: string
          description: string
          id: string
          quantity: number
          sort_order: number
          unit_price: number
        }
        Insert: {
          credit_note_id: string
          description: string
          id?: string
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Update: {
          credit_note_id?: string
          description?: string
          id?: string
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_note_lines_credit_note_id_fkey"
            columns: ["credit_note_id"]
            isOneToOne: false
            referencedRelation: "credit_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          created_at: string
          credit_note_number: string
          customer_org_id: string
          date: string
          id: string
          invoice_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["credit_note_status"]
          subtotal: number
          tax_code: string | null
          total_amount: number
          user_id: string | null
          vat_amount: number
        }
        Insert: {
          created_at?: string
          credit_note_number?: string
          customer_org_id: string
          date?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["credit_note_status"]
          subtotal?: number
          tax_code?: string | null
          total_amount?: number
          user_id?: string | null
          vat_amount?: number
        }
        Update: {
          created_at?: string
          credit_note_number?: string
          customer_org_id?: string
          date?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["credit_note_status"]
          subtotal?: number
          tax_code?: string | null
          total_amount?: number
          user_id?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_customer_org_id_fkey"
            columns: ["customer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_note_lines: {
        Row: {
          delivery_note_id: string
          description: string
          id: string
          order_line_id: string | null
          quantity: number
          sort_order: number
        }
        Insert: {
          delivery_note_id: string
          description: string
          id?: string
          order_line_id?: string | null
          quantity?: number
          sort_order?: number
        }
        Update: {
          delivery_note_id?: string
          description?: string
          id?: string
          order_line_id?: string | null
          quantity?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_note_lines_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "delivery_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_note_lines_order_line_id_fkey"
            columns: ["order_line_id"]
            isOneToOne: false
            referencedRelation: "order_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_notes: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_date: string
          dn_number: string
          id: string
          invoice_id: string | null
          notes: string | null
          order_id: string
          shipped_via: string | null
          signing_token: string | null
          status: Database["public"]["Enums"]["dn_status"]
          tracking_number: string | null
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_date?: string
          dn_number?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          order_id: string
          shipped_via?: string | null
          signing_token?: string | null
          status?: Database["public"]["Enums"]["dn_status"]
          tracking_number?: string | null
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_date?: string
          dn_number?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          order_id?: string
          shipped_via?: string | null
          signing_token?: string | null
          status?: Database["public"]["Enums"]["dn_status"]
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_signatures: {
        Row: {
          delivery_note_id: string
          id: string
          ip_address: string | null
          signature_data: string
          signed_at: string
          signer_name: string
        }
        Insert: {
          delivery_note_id: string
          id?: string
          ip_address?: string | null
          signature_data: string
          signed_at?: string
          signer_name: string
        }
        Update: {
          delivery_note_id?: string
          id?: string
          ip_address?: string | null
          signature_data?: string
          signed_at?: string
          signer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_signatures_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: true
            referencedRelation: "delivery_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      file_attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_id: string
          id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_id: string
          id?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_attachments_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category: Database["public"]["Enums"]["file_category"]
          created_at: string
          description: string | null
          drawing_number: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string | null
          uploaded_by: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["file_category"]
          created_at?: string
          description?: string | null
          drawing_number?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id?: string | null
          uploaded_by: string
        }
        Update: {
          category?: Database["public"]["Enums"]["file_category"]
          created_at?: string
          description?: string | null
          drawing_number?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          description: string
          id: string
          invoice_id: string
          material: string | null
          order_line_id: string | null
          quantity: number
          sort_order: number
          unit_price: number
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          material?: string | null
          order_line_id?: string | null
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          material?: string | null
          order_line_id?: string | null
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_order_line_id_fkey"
            columns: ["order_line_id"]
            isOneToOne: false
            referencedRelation: "order_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          additional_costs: Json | null
          created_at: string
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          order_id: string
          shipped_via: string | null
          shipping_cost: number
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_code: string | null
          total_amount: number
          user_id: string | null
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          additional_costs?: Json | null
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          order_id: string
          shipped_via?: string | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_code?: string | null
          total_amount?: number
          user_id?: string | null
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          additional_costs?: Json | null
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          order_id?: string
          shipped_via?: string | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_code?: string | null
          total_amount?: number
          user_id?: string | null
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturing_processes: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string
          created_at: string
          cutting_speed: number | null
          density: number | null
          id: string
          is_active: boolean
          name: string
          properties: Json | null
        }
        Insert: {
          category?: string
          created_at?: string
          cutting_speed?: number | null
          density?: number | null
          id?: string
          is_active?: boolean
          name: string
          properties?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          cutting_speed?: number | null
          density?: number | null
          id?: string
          is_active?: boolean
          name?: string
          properties?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          recipient_id: string
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_id: string
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_lines: {
        Row: {
          completed_date: string | null
          created_at: string
          description: string
          due_out_date: string | null
          id: string
          line_status: Database["public"]["Enums"]["line_status"]
          material: string | null
          material_type: string | null
          notes: string | null
          order_id: string
          priority: number
          production_line: string | null
          quantity: number
          quote_item_id: string | null
          sort_order: number
          unit_price: number
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          description: string
          due_out_date?: string | null
          id?: string
          line_status?: Database["public"]["Enums"]["line_status"]
          material?: string | null
          material_type?: string | null
          notes?: string | null
          order_id: string
          priority?: number
          production_line?: string | null
          quantity?: number
          quote_item_id?: string | null
          sort_order?: number
          unit_price?: number
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          description?: string
          due_out_date?: string | null
          id?: string
          line_status?: Database["public"]["Enums"]["line_status"]
          material?: string | null
          material_type?: string | null
          notes?: string | null
          order_id?: string
          priority?: number
          production_line?: string | null
          quantity?: number
          quote_item_id?: string | null
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_lines_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_lines_quote_item_id_fkey"
            columns: ["quote_item_id"]
            isOneToOne: false
            referencedRelation: "quote_items"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          created_at: string
          currency: string
          customer_org_id: string
          customer_reference: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_date: string
          order_number: string
          partner_org_id: string | null
          quote_id: string | null
          required_date: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total_amount: number
          updated_at: string
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string
          customer_org_id: string
          customer_reference?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_date?: string
          order_number?: string
          partner_org_id?: string | null
          quote_id?: string | null
          required_date?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string
          customer_org_id?: string
          customer_reference?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_date?: string
          order_number?: string
          partner_org_id?: string | null
          quote_id?: string | null
          required_date?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_org_id_fkey"
            columns: ["customer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_partner_org_id_fkey"
            columns: ["partner_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["org_member_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          profile_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
        }
        Relationships: [
          {
            foreignKeyName: "org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          account_ref: string | null
          created_at: string
          currency: string
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          payment_terms: string | null
          slug: string
          status: Database["public"]["Enums"]["org_status"]
          tax_code: string | null
          type: Database["public"]["Enums"]["org_type"]
          updated_at: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          account_ref?: string | null
          created_at?: string
          currency?: string
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          slug: string
          status?: Database["public"]["Enums"]["org_status"]
          tax_code?: string | null
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          account_ref?: string | null
          created_at?: string
          currency?: string
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["org_status"]
          tax_code?: string | null
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      partner_capabilities: {
        Row: {
          created_at: string
          id: string
          lead_time_days: number | null
          materials: string[] | null
          max_capacity_note: string | null
          min_order_value: number | null
          organization_id: string
          process_id: string
          quality_certs: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_time_days?: number | null
          materials?: string[] | null
          max_capacity_note?: string | null
          min_order_value?: number | null
          organization_id: string
          process_id: string
          quality_certs?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_time_days?: number | null
          materials?: string[] | null
          max_capacity_note?: string | null
          min_order_value?: number | null
          organization_id?: string
          process_id?: string
          quality_certs?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_capabilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_capabilities_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      purchase_lines: {
        Row: {
          description: string
          id: string
          part_number: string | null
          po_id: string
          quantity: number
          sort_order: number
          unit_price: number
        }
        Insert: {
          description: string
          id?: string
          part_number?: string | null
          po_id: string
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Update: {
          description?: string
          id?: string
          part_number?: string | null
          po_id?: string
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_lines_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          currency: string
          delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          status: Database["public"]["Enums"]["po_status"]
          subtotal: number
          supplier_org_id: string
          total_amount: number
          user_id: string | null
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          created_at?: string
          currency?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: Database["public"]["Enums"]["po_status"]
          subtotal?: number
          supplier_org_id: string
          total_amount?: number
          user_id?: string | null
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          created_at?: string
          currency?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: Database["public"]["Enums"]["po_status"]
          subtotal?: number
          supplier_org_id?: string
          total_amount?: number
          user_id?: string | null
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_org_id_fkey"
            columns: ["supplier_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_assignments: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          partner_org_id: string
          partner_price: number | null
          quote_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["assignment_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          partner_org_id: string
          partner_price?: number | null
          quote_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          partner_org_id?: string
          partner_price?: number | null
          quote_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "quote_assignments_partner_org_id_fkey"
            columns: ["partner_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_assignments_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_calculations: {
        Row: {
          additional_costs: number | null
          additional_costs_detail: Json | null
          base_cost: number | null
          burn_hours: number
          consumables_cost: number
          created_at: string
          effective_speed: number
          hourly_rate: number
          id: string
          is_unmanned: boolean | null
          machining_cost: number | null
          material: string
          material_speed: number
          perimeter: number
          quantity: number
          quote_item_id: string
          skim_passes: number | null
          thickness: number
          thickness_penalty: number
          total: number
        }
        Insert: {
          additional_costs?: number | null
          additional_costs_detail?: Json | null
          base_cost?: number | null
          burn_hours?: number
          consumables_cost?: number
          created_at?: string
          effective_speed?: number
          hourly_rate?: number
          id?: string
          is_unmanned?: boolean | null
          machining_cost?: number | null
          material: string
          material_speed?: number
          perimeter?: number
          quantity?: number
          quote_item_id: string
          skim_passes?: number | null
          thickness?: number
          thickness_penalty?: number
          total?: number
        }
        Update: {
          additional_costs?: number | null
          additional_costs_detail?: Json | null
          base_cost?: number | null
          burn_hours?: number
          consumables_cost?: number
          created_at?: string
          effective_speed?: number
          hourly_rate?: number
          id?: string
          is_unmanned?: boolean | null
          machining_cost?: number | null
          material?: string
          material_speed?: number
          perimeter?: number
          quantity?: number
          quote_item_id?: string
          skim_passes?: number | null
          thickness?: number
          thickness_penalty?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_calculations_quote_item_id_fkey"
            columns: ["quote_item_id"]
            isOneToOne: false
            referencedRelation: "quote_items"
            referencedColumns: ["id"]
          },
        ]
      }
      geometry_results: {
        Row: {
          bounding_box_x_mm: number | null
          bounding_box_y_mm: number | null
          bounding_box_z_mm: number | null
          completed_at: string | null
          complexity_score: number | null
          created_at: string | null
          error_message: string | null
          face_count: number | null
          file_hash: string | null
          file_id: string
          id: string
          is_watertight: boolean | null
          job_id: string
          material_removal_ratio: number | null
          process_confidence: number | null
          processing_time_ms: number | null
          recommended_process: string | null
          solid_count: number | null
          status: string
          stock_volume_mm3: number | null
          surface_area_mm2: number | null
          volume_mm3: number | null
          wall_thickness_min_mm: number | null
        }
        Insert: {
          bounding_box_x_mm?: number | null
          bounding_box_y_mm?: number | null
          bounding_box_z_mm?: number | null
          completed_at?: string | null
          complexity_score?: number | null
          created_at?: string | null
          error_message?: string | null
          face_count?: number | null
          file_hash?: string | null
          file_id: string
          id?: string
          is_watertight?: boolean | null
          job_id: string
          material_removal_ratio?: number | null
          process_confidence?: number | null
          processing_time_ms?: number | null
          recommended_process?: string | null
          solid_count?: number | null
          status?: string
          stock_volume_mm3?: number | null
          surface_area_mm2?: number | null
          volume_mm3?: number | null
          wall_thickness_min_mm?: number | null
        }
        Update: {
          bounding_box_x_mm?: number | null
          bounding_box_y_mm?: number | null
          bounding_box_z_mm?: number | null
          completed_at?: string | null
          complexity_score?: number | null
          created_at?: string | null
          error_message?: string | null
          face_count?: number | null
          file_hash?: string | null
          file_id?: string
          id?: string
          is_watertight?: boolean | null
          job_id?: string
          material_removal_ratio?: number | null
          process_confidence?: number | null
          processing_time_ms?: number | null
          recommended_process?: string | null
          solid_count?: number | null
          status?: string
          stock_volume_mm3?: number | null
          surface_area_mm2?: number | null
          volume_mm3?: number | null
          wall_thickness_min_mm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "geometry_results_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string
          file_id: string | null
          geometry_result_id: string | null
          id: string
          lead_time: string | null
          material: string | null
          material_type: string | null
          process_id: string | null
          quantity: number
          quote_id: string
          sort_order: number
          specifications: Json | null
          total_price: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          file_id?: string | null
          geometry_result_id?: string | null
          id?: string
          lead_time?: string | null
          material?: string | null
          material_type?: string | null
          process_id?: string | null
          quantity?: number
          quote_id: string
          sort_order?: number
          specifications?: Json | null
          total_price?: number | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          file_id?: string | null
          geometry_result_id?: string | null
          id?: string
          lead_time?: string | null
          material?: string | null
          material_type?: string | null
          process_id?: string | null
          quantity?: number
          quote_id?: string
          sort_order?: number
          specifications?: Json | null
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_geometry_result_id_fkey"
            columns: ["geometry_result_id"]
            isOneToOne: false
            referencedRelation: "geometry_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "manufacturing_processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          created_at: string
          customer_org_id: string
          customer_reference: string | null
          id: string
          internal_notes: string | null
          material_type: string | null
          notes: string | null
          quote_date: string
          quote_number: string
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          total_amount: number
          updated_at: string
          valid_until: string | null
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          customer_org_id: string
          customer_reference?: string | null
          id?: string
          internal_notes?: string | null
          material_type?: string | null
          notes?: string | null
          quote_date?: string
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          created_at?: string
          customer_org_id?: string
          customer_reference?: string | null
          id?: string
          internal_notes?: string | null
          material_type?: string | null
          notes?: string | null
          quote_date?: string
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_org_id_fkey"
            columns: ["customer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      user_org_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      address_type: "billing" | "shipping" | "registered"
      assignment_status: "pending" | "accepted" | "declined" | "completed"
      credit_note_status: "draft" | "sent" | "allocated" | "void"
      dn_status: "pending" | "dispatched" | "delivered" | "signed"
      file_category: "drawing" | "document" | "certificate" | "photo" | "other"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "void"
      line_status:
        | "outstanding"
        | "in_progress"
        | "on_hold"
        | "waiting_material"
        | "cutting_complete"
        | "quality_check"
        | "complete"
      order_status:
        | "draft"
        | "confirmed"
        | "in_production"
        | "quality_check"
        | "ready_to_ship"
        | "shipped"
        | "delivered"
        | "completed"
        | "cancelled"
      org_member_role: "owner" | "admin" | "member" | "viewer"
      org_status: "prospect" | "active" | "inactive" | "suspended"
      org_type: "customer" | "partner"
      po_status: "draft" | "ordered" | "received" | "cancelled"
      quote_status:
        | "draft"
        | "submitted"
        | "reviewing"
        | "priced"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
      user_role: "customer" | "partner" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      address_type: ["billing", "shipping", "registered"],
      assignment_status: ["pending", "accepted", "declined", "completed"],
      credit_note_status: ["draft", "sent", "allocated", "void"],
      dn_status: ["pending", "dispatched", "delivered", "signed"],
      file_category: ["drawing", "document", "certificate", "photo", "other"],
      invoice_status: ["draft", "sent", "paid", "overdue", "void"],
      line_status: [
        "outstanding",
        "in_progress",
        "on_hold",
        "waiting_material",
        "cutting_complete",
        "quality_check",
        "complete",
      ],
      order_status: [
        "draft",
        "confirmed",
        "in_production",
        "quality_check",
        "ready_to_ship",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
      ],
      org_member_role: ["owner", "admin", "member", "viewer"],
      org_status: ["prospect", "active", "inactive", "suspended"],
      org_type: ["customer", "partner"],
      po_status: ["draft", "ordered", "received", "cancelled"],
      quote_status: [
        "draft",
        "submitted",
        "reviewing",
        "priced",
        "sent",
        "accepted",
        "rejected",
        "expired",
      ],
      user_role: ["customer", "partner", "admin"],
    },
  },
} as const
