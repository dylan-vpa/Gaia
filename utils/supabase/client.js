//Expo & React Native
import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";

//Supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hfjsgslhnjifaoqynxnm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmanNnc2xobmppZmFvcXlueG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM5NDg1NTgsImV4cCI6MjAzOTUyNDU1OH0.UTdvdxt8sGWjFDjABEqwS6KdkVmgbGMui8pCx9oiRq4";

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
