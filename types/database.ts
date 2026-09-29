export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          logo_url: string | null;
          website: string | null;
          support_email: string | null;
          email_sender_name: string | null;
          email_reply_to: string | null;
          default_currency: string;
          timezone: string;
          automation_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          logo_url?: string | null;
          website?: string | null;
          support_email?: string | null;
          email_sender_name?: string | null;
          email_reply_to?: string | null;
          default_currency?: string;
          timezone?: string;
          automation_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          logo_url?: string | null;
          website?: string | null;
          support_email?: string | null;
          email_sender_name?: string | null;
          email_reply_to?: string | null;
          default_currency?: string;
          timezone?: string;
          automation_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_members: {
        Row: {
          business_id: string;
          user_id: string;
          role: Database['public']['Enums']['business_member_role'];
          created_at: string;
        };
        Insert: {
          business_id: string;
          user_id: string;
          role?: Database['public']['Enums']['business_member_role'];
          created_at?: string;
        };
        Update: {
          business_id?: string;
          user_id?: string;
          role?: Database['public']['Enums']['business_member_role'];
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          business_id: string;
          company_name: string | null;
          contact_name: string | null;
          email: string;
          phone: string | null;
          notes: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          company_name?: string | null;
          contact_name?: string | null;
          email: string;
          phone?: string | null;
          notes?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          company_name?: string | null;
          contact_name?: string | null;
          email?: string;
          phone?: string | null;
          notes?: string | null;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          business_id: string;
          client_id: string;
          invoice_number: string;
          amount: number;
          currency: string;
          issue_date: string;
          due_date: string;
          payment_url: string | null;
          status: Database['public']['Enums']['invoice_status'];
          notes: string | null;
          paid_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          client_id: string;
          invoice_number: string;
          amount: number;
          currency: string;
          issue_date: string;
          due_date: string;
          payment_url?: string | null;
          status?: Database['public']['Enums']['invoice_status'];
          notes?: string | null;
          paid_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          client_id?: string;
          invoice_number?: string;
          amount?: number;
          currency?: string;
          issue_date?: string;
          due_date?: string;
          payment_url?: string | null;
          status?: Database['public']['Enums']['invoice_status'];
          notes?: string | null;
          paid_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reminder_rules: {
        Row: { id: string; business_id: string; name: string; offset_days: number; offset_type: Database['public']['Enums']['reminder_offset_type']; template_id: string | null; active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; business_id: string; name: string; offset_days: number; offset_type: Database['public']['Enums']['reminder_offset_type']; template_id?: string | null; active?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; business_id?: string; name?: string; offset_days?: number; offset_type?: Database['public']['Enums']['reminder_offset_type']; template_id?: string | null; active?: boolean; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      reminder_jobs: {
        Row: { id: string; business_id: string; invoice_id: string; reminder_rule_id: string; scheduled_for: string; status: Database['public']['Enums']['reminder_job_status']; attempt_count: number; sent_at: string | null; locked_at: string | null; locked_by: string | null; next_retry_at: string | null; last_attempt_at: string | null; dead_lettered_at: string | null; last_error: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; business_id: string; invoice_id: string; reminder_rule_id: string; scheduled_for: string; status?: Database['public']['Enums']['reminder_job_status']; attempt_count?: number; sent_at?: string | null; locked_at?: string | null; locked_by?: string | null; next_retry_at?: string | null; last_attempt_at?: string | null; dead_lettered_at?: string | null; last_error?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; business_id?: string; invoice_id?: string; reminder_rule_id?: string; scheduled_for?: string; status?: Database['public']['Enums']['reminder_job_status']; attempt_count?: number; sent_at?: string | null; locked_at?: string | null; locked_by?: string | null; next_retry_at?: string | null; last_attempt_at?: string | null; dead_lettered_at?: string | null; last_error?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      email_templates: {
        Row: { id: string; business_id: string | null; template_key: string; name: string; subject: string; html_body: string; text_body: string; active: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; business_id?: string | null; template_key: string; name: string; subject: string; html_body: string; text_body: string; active?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; business_id?: string | null; template_key?: string; name?: string; subject?: string; html_body?: string; text_body?: string; active?: boolean; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      subscriptions: {
        Row: { id: string; business_id: string; plan: 'free' | 'starter' | 'pro' | 'agency'; status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | 'incomplete' | 'paused'; provider: string; provider_customer_id: string | null; provider_subscription_id: string | null; current_period_start: string | null; current_period_end: string | null; cancel_at_period_end: boolean; cancelled_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; business_id: string; plan?: 'free' | 'starter' | 'pro' | 'agency'; status?: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | 'incomplete' | 'paused'; provider?: string; provider_customer_id?: string | null; provider_subscription_id?: string | null; current_period_start?: string | null; current_period_end?: string | null; cancel_at_period_end?: boolean; cancelled_at?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; business_id?: string; plan?: 'free' | 'starter' | 'pro' | 'agency'; status?: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | 'incomplete' | 'paused'; provider?: string; provider_customer_id?: string | null; provider_subscription_id?: string | null; current_period_start?: string | null; current_period_end?: string | null; cancel_at_period_end?: boolean; cancelled_at?: string | null; updated_at?: string };
        Relationships: [];
      };
      billing_events: {
        Row: { id: string; business_id: string | null; provider: string; provider_event_id: string; event_type: string; status: 'received' | 'processed' | 'ignored' | 'failed'; error_message: string | null; received_at: string; processed_at: string | null; created_at: string };
        Insert: { id?: string; business_id?: string | null; provider: string; provider_event_id: string; event_type: string; status?: 'received' | 'processed' | 'ignored' | 'failed'; error_message?: string | null; received_at?: string; processed_at?: string | null; created_at?: string };
        Update: { id?: string; business_id?: string | null; provider?: string; provider_event_id?: string; event_type?: string; status?: 'received' | 'processed' | 'ignored' | 'failed'; error_message?: string | null; received_at?: string; processed_at?: string | null; created_at?: string };
        Relationships: [];
      };
      usage_events: {
        Row: { id: string; business_id: string; event_type: string; resource_id: string | null; metadata: Record<string, unknown>; created_at: string };
        Insert: { id?: string; business_id: string; event_type: string; resource_id?: string | null; metadata?: Record<string, unknown>; created_at?: string };
        Update: { id?: string; business_id?: string; event_type?: string; resource_id?: string | null; metadata?: Record<string, unknown>; created_at?: string };
        Relationships: [];
      };
      email_logs: {
        Row: { id: string; business_id: string; invoice_id: string | null; reminder_job_id: string | null; recipient: string; subject: string; provider: string; provider_message_id: string | null; status: string; sent_at: string | null; delivered_at: string | null; failed_at: string | null; error_message: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; business_id: string; invoice_id?: string | null; reminder_job_id?: string | null; recipient: string; subject: string; provider: string; provider_message_id?: string | null; status?: string; sent_at?: string | null; delivered_at?: string | null; failed_at?: string | null; error_message?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; business_id?: string; invoice_id?: string | null; reminder_job_id?: string | null; recipient?: string; subject?: string; provider?: string; provider_message_id?: string | null; status?: string; sent_at?: string | null; delivered_at?: string | null; failed_at?: string | null; error_message?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_business_member: { Args: { p_business_id: string }; Returns: boolean };
      can_manage_business: { Args: { p_business_id: string }; Returns: boolean };
      claim_due_reminder_jobs: { Args: { p_worker_id: string; p_limit?: number; p_now?: string; p_lease_minutes?: number }; Returns: { id: string; business_id: string; invoice_id: string; attempt_count: number }[] };
      sync_business_reminder_schedules: { Args: { p_business_id: string }; Returns: undefined };
    };
    Enums: {
      business_member_role: 'owner' | 'admin' | 'member';
      invoice_status: 'draft' | 'scheduled' | 'due' | 'overdue' | 'paid' | 'cancelled';
      reminder_offset_type: 'before_due' | 'on_due' | 'after_due';
      reminder_job_status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled' | 'dead_letter';
    };
    CompositeTypes: Record<string, never>;
  };
};
