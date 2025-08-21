import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import { getRedirectUri } from "./redirect";

WebBrowser.maybeCompleteAuthSession(); // correct module

export async function signInWithEmailLink(email) {
  const redirectTo = getRedirectUri();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function signInWithProvider(provider) {
  const redirectTo = getRedirectUri();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error) throw error;
}

// Password login (for testing/development)
export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

async function handleAuthCallback(url) {
  const qp = Linking.parse(url).queryParams || {};
  const code = qp?.code;
  const err = qp?.error_description;
  if (err) { 
    console.log("auth error", err); 
    return; 
  }
  if (!code) return;
  const { error } = await supabase.auth.exchangeCodeForSession({
    code,
    redirectTo: getRedirectUri(),
  });
  if (error) {
    console.log("exchange error", error.message);
  } else {
    console.log("exchange success");
  }
}

// Export for App.js to set up auth linking
export function installAuthLinking() {
  // Handle warm start (app already running)
  const subscription = Linking.addEventListener("url", ({ url }) => handleAuthCallback(url));
  
  // Handle cold start (app launched by deep link)
  (async () => { 
    const u = await Linking.getInitialURL(); 
    if (u) await handleAuthCallback(u); 
  })();
  
  // Return cleanup function
  return () => {
    subscription.remove();
  };
}