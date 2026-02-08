import { supabase } from "@/integrations/supabase/client";

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/editor`,
    },
  });
  
  if (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
  
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
  
  return data;
};

export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        display_name: name,
      },
    },
  });
  
  if (error) {
    console.error("Email sign-up error:", error);
    throw error;
  }
  
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign-out error:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
};
