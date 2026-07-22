export type Database = {
  public: {
    Tables: {
      words: {
        Row: {
          id: string;
          word: string;
          meaning: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          word: string;
          meaning: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          word?: string;
          meaning?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      quiz_results: {
        Row: {
          id: string;
          score: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          score: number;
          total?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          score?: number;
          total?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
