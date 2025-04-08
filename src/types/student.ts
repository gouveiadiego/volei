
import { Tables } from "@/integrations/supabase/types";

// Extended student type with the inactive properties
export interface StudentWithInactiveInfo extends Tables<"students"> {
  inactive_reason?: string | null;
  inactive_date?: string | null;
}
