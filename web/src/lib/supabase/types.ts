export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          title: string;
          description: string;
          level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
          difficulty: number;
          muscle_groups: string[];
          equipment: string[];
          video_urls: string[];
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          level: 'beginner' | 'intermediate' | 'advanced' | 'elite';
          difficulty: number;
          muscle_groups: string[];
          equipment: string[];
          video_urls?: string[];
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
          difficulty?: number;
          muscle_groups?: string[];
          equipment?: string[];
          video_urls?: string[];
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      skill_variants: {
        Row: {
          skill_id: string;
          variant_skill_id: string;
          created_at: string;
        };
        Insert: {
          skill_id: string;
          variant_skill_id: string;
          created_at?: string;
        };
        Update: {
          skill_id?: string;
          variant_skill_id?: string;
          created_at?: string;
        };
      };
      skill_prerequisites: {
        Row: {
          skill_id: string;
          prerequisite_skill_id: string;
          created_at: string;
        };
        Insert: {
          skill_id: string;
          prerequisite_skill_id: string;
          created_at?: string;
        };
        Update: {
          skill_id?: string;
          prerequisite_skill_id?: string;
          created_at?: string;
        };
      };
      places: {
        Row: {
          id: string;
          name: string;
          description: string;
          location: string;
          address: string;
          coordinates: { lat: number; lng: number };
          amenities: string[];
          equipment: string[];
          photos_urls: string[];
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          location: string;
          address: string;
          coordinates: { lat: number; lng: number };
          amenities: string[];
          equipment: string[];
          photos_urls?: string[];
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          location?: string;
          address?: string;
          coordinates?: { lat: number; lng: number };
          amenities?: string[];
          equipment?: string[];
          photos_urls?: string[];
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      place_upvotes: {
        Row: {
          id: string;
          place_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          place_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          entity_type: 'skill' | 'place';
          action: 'create' | 'update' | 'delete';
          status: 'pending' | 'approved' | 'rejected';
          submitted_by: string;
          data: Json;
          original_id: string | null;
          created_at: string;
          updated_at: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          entity_type: 'skill' | 'place';
          action: 'create' | 'update' | 'delete';
          status?: 'pending' | 'approved' | 'rejected';
          submitted_by: string;
          data: Json;
          original_id?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          entity_type?: 'skill' | 'place';
          action?: 'create' | 'update' | 'delete';
          status?: 'pending' | 'approved' | 'rejected';
          submitted_by?: string;
          data?: Json;
          original_id?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          entity_type: 'skill' | 'place';
          entity_id: string;
          action: 'create' | 'update' | 'delete';
          user_id: string | null;
          changes: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: 'skill' | 'place';
          entity_id: string;
          action: 'create' | 'update' | 'delete';
          user_id?: string | null;
          changes: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: 'skill' | 'place';
          entity_id?: string;
          action?: 'create' | 'update' | 'delete';
          user_id?: string | null;
          changes?: Json;
          created_at?: string;
        };
      };
    };
  };
};
