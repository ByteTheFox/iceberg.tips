export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      businesses: {
        Row: {
          address: string;
          city: string;
          country: string;
          created_at: string | null;
          hash: string;
          id: string;
          latitude: number | null;
          longitude: number | null;
          name: string;
          state: string;
          updated_at: string | null;
          zip_code: string;
        };
        Insert: {
          address: string;
          city: string;
          country: string;
          created_at?: string | null;
          hash: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          state: string;
          updated_at?: string | null;
          zip_code: string;
        };
        Update: {
          address?: string;
          city?: string;
          country?: string;
          created_at?: string | null;
          hash?: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          state?: string;
          updated_at?: string | null;
          zip_code?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          business_id: string;
          created_at: string | null;
          details: string | null;
          id: string;
          service_charge_percentage: number | null;
          suggested_tips: number[] | null;
          tip_practice: string;
          tips_go_to_staff: boolean | null;
          user_id: string | null;
        };
        Insert: {
          business_id: string;
          created_at?: string | null;
          details?: string | null;
          id?: string;
          service_charge_percentage?: number | null;
          suggested_tips?: number[] | null;
          tip_practice: string;
          tips_go_to_staff?: boolean | null;
          user_id?: string | null;
        };
        Update: {
          business_id?: string;
          created_at?: string | null;
          details?: string | null;
          id?: string;
          service_charge_percentage?: number | null;
          suggested_tips?: number[] | null;
          tip_practice?: string;
          tips_go_to_staff?: boolean | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reports_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "business_stats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      business_stats: {
        Row: {
          address: string | null;
          city: string | null;
          computed_service_charge_percentage: number | null;
          computed_suggested_tips: number[] | null;
          computed_tip_practice: string | null;
          computed_tips_go_to_staff: boolean | null;
          country: string | null;
          created_at: string | null;
          hash: string | null;
          id: string | null;
          latitude: number | null;
          longitude: number | null;
          name: string | null;
          report_count: number | null;
          state: string | null;
          updated_at: string | null;
          zip_code: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export type SearchParams = {
  lat?: string;
  lng?: string;
  [key: string]: string | string[] | undefined;
};

export interface BusinessUIProps {
  businesses: any[] | null;
  initialLat?: number;
  initialLng?: number;
}
