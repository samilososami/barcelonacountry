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
        Row: { created_at: string; email: string; full_name: string; id: string; phone: string };
        Insert: { created_at?: string; email: string; full_name: string; id?: string; phone: string };
        Update: { created_at?: string; email?: string; full_name?: string; id?: string; phone?: string };
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
