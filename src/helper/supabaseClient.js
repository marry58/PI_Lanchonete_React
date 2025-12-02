import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jjcbtuoikfhxnkitnmtm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqY2J0dW9pa2ZoeG5raXRubXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTI4MzAsImV4cCI6MjA3ODkyODgzMH0.iD_A5ACxlXCRM42pvZENoKwkUQwQZbTYkPvM8qwn8e4";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;