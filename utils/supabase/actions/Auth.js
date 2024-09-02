
// Supabase
import { supabase } from "../client";

// Auth
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
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (!user)
      throw new Error("Please check your email for verification link!");
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

const checkSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    await ensureProfile(session.user);
  }
  return session;
};

const ensureProfile = async (user) => {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    await supabase
      .from("profiles")
      .insert({ id: user.id, name: user.email.split("@")[0] });
  }
};

export { signInWithEmail, signUpWithEmail, signOut, checkSession, ensureProfile };