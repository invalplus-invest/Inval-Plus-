// ==========================================
// INVAL PLUS - Centralized Supabase Config
// ==========================================

// FIXED: Removed "/rest/v1/" from the end of SUPABASE_URL
const SUPABASE_URL = "https://tbxacrdbqpasphlktzkp.supabase.co";
const SUPABASE_ANON_KEY = ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRieGFjcmRicXBhc3BobGt0emtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMjkwNTAsImV4cCI6MjEwMTcwNTA1MH0.9zUOBhxwPL2O4RPi-sKHKruYsejZvKxGS4E7l_L_AG0";

// Ensure Supabase CDN script is loaded before initializing
if (!window.supabase) {
  console.error("Supabase SDK not loaded! Make sure the CDN script tag is included in <head>.");
}

// Initialize Global Supabase Client on window.supabaseClient
window.supabaseClient = window.supabase 
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

const supabaseClient = window.supabaseClient;

/**
 * Auth Guard: Restricts page access to logged-in users.
 * Redirects unauthenticated users to login.html.
 */
async function requireAuth() {
  if (!supabaseClient) return null;

  const { data: { session }, error } = await supabaseClient.auth.getSession();
  
  if (error || !session) {
    window.location.href = "login.html";
    return null;
  }

  // Check if user is suspended
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('is_suspended')
    .eq('id', session.user.id)
    .single();

  if (profile && profile.is_suspended) {
    alert("Your account has been suspended. Please contact support.");
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
    return null;
  }

  return session;
}

/**
 * Fetch Current User's Profile & Wallet Balance
 */
async function getUserProfile(userId) {
  if (!supabaseClient || !userId) return null;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Profile Fetch Error:", error.message);
    return null;
  }

  return data;
}

/**
 * Update Header Wallet Balance Element automatically
 */
async function updateHeaderBalance(userId) {
  const balanceEl = document.getElementById('userBalance');
  if (!balanceEl) return;

  const profile = await getUserProfile(userId);
  if (profile) {
    const formattedBal = (profile.wallet_balance || 0).toLocaleString();
    balanceEl.innerText = `UGX ${formattedBal}`;
  }
}

/**
 * Check if Platform Activity is Active or Paused by Admin
 */
async function checkSystemActive() {
  if (!supabaseClient) return true;

  const { data, error } = await supabaseClient
    .from('settings')
    .select('value')
    .eq('key', 'system_active')
    .single();

  if (error || !data) return true; // Default to active if setting key is missing
  return data.value === 'true';
}

/**
 * Sign out current user
 */
async function handleLogout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  window.location.href = "login.html";
}
