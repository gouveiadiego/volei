
import { Tables } from "@/integrations/supabase/types";

// Extended student type - Tables<"students"> already has these fields but we make them explicit
export type StudentWithInactiveInfo = Tables<"students">;
