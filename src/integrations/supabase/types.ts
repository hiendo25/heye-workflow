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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          auto_track: boolean
          created_at: string
          end_date: string
          hours_per_day: number
          id: string
          is_tentative: boolean
          namespace_id: string
          note: string | null
          service_id: string
          start_date: string
          ticket_id: string | null
          user_id: string
        }
        Insert: {
          auto_track?: boolean
          created_at?: string
          end_date: string
          hours_per_day?: number
          id?: string
          is_tentative?: boolean
          namespace_id: string
          note?: string | null
          service_id: string
          start_date: string
          ticket_id?: string | null
          user_id: string
        }
        Update: {
          auto_track?: boolean
          created_at?: string
          end_date?: string
          hours_per_day?: number
          id?: string
          is_tentative?: boolean
          namespace_id?: string
          note?: string | null
          service_id?: string
          start_date?: string
          ticket_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "budget_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_cost_rates: {
        Row: {
          budget_id: string
          id: string
          note: string | null
          rate: number
          user_id: string
        }
        Insert: {
          budget_id: string
          id?: string
          note?: string | null
          rate: number
          user_id: string
        }
        Update: {
          budget_id?: string
          id?: string
          note?: string | null
          rate?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_cost_rates_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_cost_rates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_sections: {
        Row: {
          budget_id: string
          id: string
          name: string
          position: number
        }
        Insert: {
          budget_id: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          budget_id?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_sections_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_services: {
        Row: {
          allow_expense: boolean
          allow_time: boolean
          billing_type: string
          budget_id: string
          estimate: number | null
          id: string
          name: string
          position: number
          price: number
          quantity: number
          section_id: string | null
          service_type_id: string
          unit: string
        }
        Insert: {
          allow_expense?: boolean
          allow_time?: boolean
          billing_type?: string
          budget_id: string
          estimate?: number | null
          id?: string
          name: string
          position?: number
          price?: number
          quantity?: number
          section_id?: string | null
          service_type_id: string
          unit?: string
        }
        Update: {
          allow_expense?: boolean
          allow_time?: boolean
          billing_type?: string
          budget_id?: string
          estimate?: number | null
          id?: string
          name?: string
          position?: number
          price?: number
          quantity?: number
          section_id?: string | null
          service_type_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_services_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_services_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "budget_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_services_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          client_id: string
          code: string | null
          created_at: string
          currency: string
          end_date: string | null
          id: string
          is_internal: boolean
          name: string
          namespace_id: string
          note: string | null
          owner_id: string | null
          project_id: string | null
          start_date: string | null
          status: string
        }
        Insert: {
          client_id: string
          code?: string | null
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          is_internal?: boolean
          name: string
          namespace_id: string
          note?: string | null
          owner_id?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: string
        }
        Update: {
          client_id?: string
          code?: string | null
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          is_internal?: boolean
          name?: string
          namespace_id?: string
          note?: string | null
          owner_id?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      client_companies: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          currency: string
          id: string
          is_active: boolean
          name: string
          namespace_id: string
          note: string | null
          short_name: string | null
          tax_id: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name: string
          namespace_id: string
          note?: string | null
          short_name?: string | null
          tax_id?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          name?: string
          namespace_id?: string
          note?: string | null
          short_name?: string | null
          tax_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_companies_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_rates: {
        Row: {
          add_overhead: boolean
          amount: number
          created_at: string
          currency: string
          end_date: string | null
          hours_fri: number
          hours_mon: number
          hours_sat: number
          hours_sun: number
          hours_thu: number
          hours_tue: number
          hours_wed: number
          id: string
          namespace_id: string
          note: string | null
          rate_type: string
          start_date: string
          user_id: string
        }
        Insert: {
          add_overhead?: boolean
          amount?: number
          created_at?: string
          currency?: string
          end_date?: string | null
          hours_fri?: number
          hours_mon?: number
          hours_sat?: number
          hours_sun?: number
          hours_thu?: number
          hours_tue?: number
          hours_wed?: number
          id?: string
          namespace_id: string
          note?: string | null
          rate_type?: string
          start_date?: string
          user_id: string
        }
        Update: {
          add_overhead?: boolean
          amount?: number
          created_at?: string
          currency?: string
          end_date?: string | null
          hours_fri?: number
          hours_mon?: number
          hours_sat?: number
          hours_sun?: number
          hours_thu?: number
          hours_tue?: number
          hours_wed?: number
          id?: string
          namespace_id?: string
          note?: string | null
          rate_type?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_rates_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_rates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_items: {
        Row: {
          description: string
          expense_id: string
          id: string
          position: number
          quantity: number
          tax_included: boolean
          tax_rate: number
          unit_price: number
        }
        Insert: {
          description: string
          expense_id: string
          id?: string
          position?: number
          quantity?: number
          tax_included?: boolean
          tax_rate?: number
          unit_price?: number
        }
        Update: {
          description?: string
          expense_id?: string
          id?: string
          position?: number
          quantity?: number
          tax_included?: boolean
          tax_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "expense_items_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachment_name: string | null
          created_at: string
          currency: string
          date: string
          due_date: string | null
          id: string
          is_paid: boolean
          is_reimbursed: boolean
          markup_type: string
          markup_value: number
          namespace_id: string
          note: string | null
          paid_at: string | null
          reference: string
          review_note: string | null
          service_id: string
          status: string
          ticket_id: string | null
          user_id: string
          vendor: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_name?: string | null
          created_at?: string
          currency?: string
          date?: string
          due_date?: string | null
          id?: string
          is_paid?: boolean
          is_reimbursed?: boolean
          markup_type?: string
          markup_value?: number
          namespace_id: string
          note?: string | null
          paid_at?: string | null
          reference: string
          review_note?: string | null
          service_id: string
          status?: string
          ticket_id?: string | null
          user_id: string
          vendor?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_name?: string | null
          created_at?: string
          currency?: string
          date?: string
          due_date?: string | null
          id?: string
          is_paid?: boolean
          is_reimbursed?: boolean
          markup_type?: string
          markup_value?: number
          namespace_id?: string
          note?: string | null
          paid_at?: string | null
          reference?: string
          review_note?: string | null
          service_id?: string
          status?: string
          ticket_id?: string | null
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "budget_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          id: string
          is_default: boolean
          name: string
          parent_id: string | null
          position: number
          project_id: string
          type: string
        }
        Insert: {
          id?: string
          is_default?: boolean
          name: string
          parent_id?: string | null
          position?: number
          project_id: string
          type: string
        }
        Update: {
          id?: string
          is_default?: boolean
          name?: string
          parent_id?: string | null
          position?: number
          project_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      namespaces: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      overhead_settings: {
        Row: {
          client_hours: number
          facility_cost: number
          id: string
          internal_cost: number
          internal_is_auto: boolean
          is_enabled: boolean
          monthly_cost: number
          monthly_hours: number
          namespace_id: string
          note: string | null
          total_hours: number
        }
        Insert: {
          client_hours?: number
          facility_cost?: number
          id?: string
          internal_cost?: number
          internal_is_auto?: boolean
          is_enabled?: boolean
          monthly_cost?: number
          monthly_hours?: number
          namespace_id: string
          note?: string | null
          total_hours?: number
        }
        Update: {
          client_hours?: number
          facility_cost?: number
          id?: string
          internal_cost?: number
          internal_is_auto?: boolean
          is_enabled?: boolean
          monthly_cost?: number
          monthly_hours?: number
          namespace_id?: string
          note?: string | null
          total_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "overhead_settings_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: true
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          avatar_letter: string
          color: string
          id: string
          name: string
          namespace_id: string
          position: number
          status_template_id: string | null
        }
        Insert: {
          avatar_letter?: string
          color?: string
          id?: string
          name: string
          namespace_id: string
          position?: number
          status_template_id?: string | null
        }
        Update: {
          avatar_letter?: string
          color?: string
          id?: string
          name?: string
          namespace_id?: string
          position?: number
          status_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_status_template_id_fkey"
            columns: ["status_template_id"]
            isOneToOne: false
            referencedRelation: "status_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_card_items: {
        Row: {
          allow_expense: boolean
          allow_time: boolean
          billing_type: string
          cost_estimate: number | null
          description: string | null
          id: string
          markup_pct: number
          position: number
          price: number
          rate_card_id: string
          service_type_id: string
          unit: string
        }
        Insert: {
          allow_expense?: boolean
          allow_time?: boolean
          billing_type?: string
          cost_estimate?: number | null
          description?: string | null
          id?: string
          markup_pct?: number
          position?: number
          price?: number
          rate_card_id: string
          service_type_id: string
          unit?: string
        }
        Update: {
          allow_expense?: boolean
          allow_time?: boolean
          billing_type?: string
          cost_estimate?: number | null
          description?: string | null
          id?: string
          markup_pct?: number
          position?: number
          price?: number
          rate_card_id?: string
          service_type_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_card_items_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "rate_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_card_items_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cards: {
        Row: {
          client_id: string | null
          created_at: string
          currency: string
          id: string
          is_archived: boolean
          name: string
          namespace_id: string
          note: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_archived?: boolean
          name: string
          namespace_id: string
          note?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_archived?: boolean
          name?: string
          namespace_id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_cards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_cards_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          code: string | null
          color: string
          id: string
          is_active: boolean
          is_archived: boolean
          name: string
          namespace_id: string
          position: number
        }
        Insert: {
          code?: string | null
          color?: string
          id?: string
          is_active?: boolean
          is_archived?: boolean
          name: string
          namespace_id: string
          position?: number
        }
        Update: {
          code?: string | null
          color?: string
          id?: string
          is_active?: boolean
          is_archived?: boolean
          name?: string
          namespace_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_types_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      status_templates: {
        Row: {
          id: string
          name: string
          namespace_id: string
        }
        Insert: {
          id?: string
          name: string
          namespace_id: string
        }
        Update: {
          id?: string
          name?: string
          namespace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_templates_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      statuses: {
        Row: {
          color_bg: string
          color_fg: string
          id: string
          label: string
          position: number
          template_id: string
          type: string
        }
        Insert: {
          color_bg: string
          color_fg: string
          id?: string
          label: string
          position?: number
          template_id: string
          type: string
        }
        Update: {
          color_bg?: string
          color_fg?: string
          id?: string
          label?: string
          position?: number
          template_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "statuses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "status_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color_bg: string
          color_fg: string
          id: string
          name: string
          namespace_id: string
        }
        Insert: {
          color_bg: string
          color_fg: string
          id?: string
          name: string
          namespace_id: string
        }
        Update: {
          color_bg?: string
          color_fg?: string
          id?: string
          name?: string
          namespace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_assignees: {
        Row: {
          ticket_id: string
          user_id: string
        }
        Insert: {
          ticket_id: string
          user_id: string
        }
        Update: {
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_assignees_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_assignees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_tags: {
        Row: {
          tag_id: string
          ticket_id: string
        }
        Insert: {
          tag_id: string
          ticket_id: string
        }
        Update: {
          tag_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_tags_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          budget_service_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          estimate_hours: number | null
          group_id: string
          id: string
          key: string
          position: number
          priority: string | null
          start_date: string | null
          status_id: string | null
          title: string
        }
        Insert: {
          budget_service_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimate_hours?: number | null
          group_id: string
          id?: string
          key: string
          position?: number
          priority?: string | null
          start_date?: string | null
          status_id?: string | null
          title: string
        }
        Update: {
          budget_service_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimate_hours?: number | null
          group_id?: string
          id?: string
          key?: string
          position?: number
          priority?: string | null
          start_date?: string | null
          status_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_budget_service_id_fkey"
            columns: ["budget_service_id"]
            isOneToOne: false
            referencedRelation: "budget_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          billable_minutes: number
          change_request_note: string | null
          change_requested_at: string | null
          cost_rate_snapshot: number
          created_at: string
          date: string
          id: string
          locked_at: string | null
          minutes: number
          namespace_id: string
          note: string | null
          service_id: string
          ticket_id: string | null
          timer_started_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          billable_minutes?: number
          change_request_note?: string | null
          change_requested_at?: string | null
          cost_rate_snapshot?: number
          created_at?: string
          date?: string
          id?: string
          locked_at?: string | null
          minutes?: number
          namespace_id: string
          note?: string | null
          service_id: string
          ticket_id?: string | null
          timer_started_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          billable_minutes?: number
          change_request_note?: string | null
          change_requested_at?: string | null
          cost_rate_snapshot?: number
          created_at?: string
          date?: string
          id?: string
          locked_at?: string | null
          minutes?: number
          namespace_id?: string
          note?: string | null
          service_id?: string
          ticket_id?: string | null
          timer_started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "budget_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      time_settings: {
        Row: {
          id: string
          lock_period: string
          max_hours_per_day: number
          namespace_id: string
          require_approval: boolean
          require_submission: boolean
        }
        Insert: {
          id?: string
          lock_period?: string
          max_hours_per_day?: number
          namespace_id: string
          require_approval?: boolean
          require_submission?: boolean
        }
        Update: {
          id?: string
          lock_period?: string
          max_hours_per_day?: number
          namespace_id?: string
          require_approval?: boolean
          require_submission?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "time_settings_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: true
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      timer_logs: {
        Row: {
          auto_stopped: boolean
          id: string
          minutes: number
          started_at: string
          stopped_at: string | null
          time_entry_id: string
        }
        Insert: {
          auto_stopped?: boolean
          id?: string
          minutes?: number
          started_at: string
          stopped_at?: string | null
          time_entry_id: string
        }
        Update: {
          auto_stopped?: boolean
          id?: string
          minutes?: number
          started_at?: string
          stopped_at?: string | null
          time_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timer_logs_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_submissions: {
        Row: {
          id: string
          namespace_id: string
          note: string | null
          status: string
          submitted_at: string
          submitted_by: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          id?: string
          namespace_id: string
          note?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          id?: string
          namespace_id?: string
          note?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_submissions_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "namespaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_color: string
          email: string | null
          full_name: string
          id: string
          initial: string
        }
        Insert: {
          avatar_color: string
          email?: string | null
          full_name: string
          id?: string
          initial: string
        }
        Update: {
          avatar_color?: string
          email?: string | null
          full_name?: string
          id?: string
          initial?: string
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
    Enums: {},
  },
} as const
