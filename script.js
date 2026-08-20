// Register Function
async function registerUser(fullName, email, phone, password) {
  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email,
    password: password
  });

  if (authError) {
    alert("Registration failed: " + authError.message);
    return;
  }

  if (!authData || !authData.user) {
    alert("Registration submitted! Check your email to confirm.");
    return;
  }

  const userId = authData.user.id;

  // 2. Insert user details into 'profiles' table with UGX 0 balance
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        full_name: fullName,
        email: email,
        phone_number: phone,
        wallet_balance: 0,
        has_received_bonus: false
      }
    ]);

  if (profileError) {
    alert("Profile creation failed: " + profileError.message);
    return;
  }

  alert("Account created successfully! Redirecting to login...");
  window.location.href = "login.html";
}
async function checkAndGrantBonus() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) return;

  // 1. Check if user is eligible for bonus
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_received_bonus, created_at')
    .eq('id', user.id)
    .single();

  if (profile && !profile.has_received_bonus) {
    // 2. Trigger the 60-second countdown safely inside the active session
    console.log("60-second bonus timer started...");
    
    setTimeout(async () => {
      const { error: rpcError } = await supabase.rpc('grant_signup_bonus', { 
        user_id_input: user.id 
      });

      if (!rpcError) {
        alert("🎉 Congratulations! UGX 1,000 welcome bonus has been added to your wallet.");
        // Refresh wallet balance UI function here
        if (typeof loadWalletBalance === 'function') {
          loadWalletBalance();
        }
      }
    }, 60000); // 60 seconds
  }
}

// Call on dashboard load
document.addEventListener('DOMContentLoaded', checkAndGrantBonus);
// TOP OF FILE: Correct Initialization
const { createClient } = window.supabase;

const SUPABASE_URL = "https://your-project-ref.supabase.co"; // Your Supabase URL
const SUPABASE_ANON_KEY = "your-anon-key-here";              // Your Supabase Key

// 1. Initialize 'supabaseClient' FIRST
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// 2. NOW write your registration or submit event listener below
async function registerUser(fullName, email, phone, password) {
  // Usage here is now safe because supabaseClient is already declared above
  const { data: authData, error: authError } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (authError) {
    alert("Registration failed: " + authError.message);
    return;
  }
  
  // Rest of your logic...
}
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>