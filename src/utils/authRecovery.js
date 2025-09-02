// src/utils/authRecovery.js
// Handles "Invalid Refresh Token" drift after reinstalls/dev builds.

export async function recoverFromStaleToken(supabase, resetTo) {
  try {
    console.log('🔍 Checking for stale tokens...');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('📱 Session check result:', !!session);
    return !!session;
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.includes('Invalid Refresh Token')) {
      console.warn('[AUTH] Stale refresh token; clearing local session');
      try { await supabase.auth.stopAutoRefresh(); } catch {}
      try { await supabase.auth.signOut({ scope: 'local' }); } catch {}
      resetTo('Login');
      return false;
    }
    // Any other error: fail safe to Login so UI isn't blocked
    try { await supabase.auth.stopAutoRefresh(); } catch {}
    resetTo('Login');
    return false;
  }
}