// Supabase
import { supabase } from "./client";

const signInWithPhone = async (phone, password) => {
  try {
    const { error } = await supabase.auth.signInWithPhone({
      phone,
      password,
    });
    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

const signUpWithPhone = async (phone, password) => {
  try {
    const { data: { session }, error } = await supabase.auth.signUpWithPhone({
      phone,
      password,
    });
    if (error) throw error;
    if (!session) throw new Error("Please check your phone for verification code!");
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

export { signInWithPhone, signUpWithPhone, signOut };