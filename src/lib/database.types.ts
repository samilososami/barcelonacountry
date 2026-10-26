export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      admin_users: {
        Row: { created_at: string; email: string; user_id: string };
        Insert: { created_at?: string; email: string; user_id: string };
        Update: { created_at?: string; email?: string; user_id?: string };
        Relationships: [];
      };
      registrations: {
        Row: { country_iso: string | null; created_at: string; dance_location: string | null; email: string; full_name: string; id: string; newsletter_consent: boolean; phone: string; privacy_accepted_at: string | null; subscription_locale: string | null; welcome_newsletter_sent_at: string | null };
        Insert: { country_iso?: string | null; created_at?: string; dance_location?: string | null; email: string; full_name: string; id?: string; newsletter_consent?: boolean; phone: string; privacy_accepted_at?: string | null; subscription_locale?: string | null; welcome_newsletter_sent_at?: string | null };
        Update: { country_iso?: string | null; created_at?: string; dance_location?: string | null; email?: string; full_name?: string; id?: string; newsletter_consent?: boolean; phone?: string; privacy_accepted_at?: string | null; subscription_locale?: string | null; welcome_newsletter_sent_at?: string | null };
        Relationships: [];
      };
      newsletter_issues: {
        Row: { content: string; created_at: string; excerpt: string; id: string; is_published: boolean; issue_number: number; published_at: string | null; slug: string; title: string; updated_at: string };
        Insert: { content: string; created_at?: string; excerpt?: string; id?: string; is_published?: boolean; issue_number: number; published_at?: string | null; slug: string; title: string; updated_at?: string };
        Update: { content?: string; created_at?: string; excerpt?: string; id?: string; is_published?: boolean; issue_number?: number; published_at?: string | null; slug?: string; title?: string; updated_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Registration = Database["public"]["Tables"]["registrations"]["Row"];
export type RegistrationInsert = Database["public"]["Tables"]["registrations"]["Insert"];
export type RegistrationUpdate = Database["public"]["Tables"]["registrations"]["Update"];
export type NewsletterIssue = Database["public"]["Tables"]["newsletter_issues"]["Row"];
export type NewsletterIssueInsert = Database["public"]["Tables"]["newsletter_issues"]["Insert"];
