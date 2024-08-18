// Supabase
import { supabase } from "./client";

const signInWithEmail = async (email, password) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

const signUpWithEmail = async (email, password) => {
  try {
    const { data: { user }, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (!user) throw new Error("Please check your email for verification link!");
  } catch (error) {
    throw error;
  }
};

const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

export { signInWithEmail, signUpWithEmail, signOut };