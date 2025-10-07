//Expo & React Native
import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";

//Supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kpzomzwhjeumcgxyynbp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwem9tendoamV1bWNneHl5bmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODM0NjEsImV4cCI6MjA3NTM1OTQ2MX0.5-ZR8xBBTLYzIZXucWx5ih-VA0CyHIpa7xw1EE-Rvt0";

//Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

//Middleware?
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

//Actions
