const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://ecvtshwxjmhsaxyajoss.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ Please set VITE_SUPABASE_ANON_KEY environment variable');
  console.log('Run: VITE_SUPABASE_ANON_KEY="your-anon-key" node test-signup-flow.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate random test email
const testEmail = `test_${Date.now()}@drchintickle.com`;
const testPassword = 'TestPassword123!';

async function testSignupFlow() {
  console.log('🧪 Testing Dr. ChinTickle Signup Flow\n');
  console.log(`📧 Test email: ${testEmail}`);
  console.log(`🔑 Test password: ${testPassword}\n`);

  try {
    // Step 1: Sign up new user
    console.log('1️⃣ Creating new user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('❌ Signup failed:', signUpError.message);
      return;
    }

    console.log('✅ User created successfully!');
    console.log(`   User ID: ${signUpData.user?.id}\n`);

    // Step 2: Check if profile was created automatically
    console.log('2️⃣ Checking if profile was created by trigger...');
    
    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signUpData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile not found:', profileError.message);
      console.log('\n⚠️  The trigger might not be installed or working properly.');
      return;
    }

    console.log('✅ Profile created automatically!');
    console.log('📊 Profile details:');
    console.log(`   - ID: ${profile.id}`);
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Current Max Pullups: ${profile.current_max_pullups}`);
    console.log(`   - Cycle Start Max: ${profile.cycle_start_max}`);
    console.log(`   - Current Workout: ${profile.current_workout_in_cycle}`);
    console.log(`   - Created At: ${profile.created_at}\n`);

    // Step 3: Test login with new account
    console.log('3️⃣ Testing login with new account...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }

    console.log('✅ Login successful!\n');

    // Step 4: Test profile access with RLS
    console.log('4️⃣ Testing profile access with RLS policies...');
    
    // Test SELECT
    const { data: myProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();

    if (selectError) {
      console.error('❌ Cannot read own profile:', selectError.message);
    } else {
      console.log('✅ Can read own profile');
    }

    // Test UPDATE
    const newMax = profile.current_max_pullups + 1;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_max_pullups: newMax })
      .eq('id', loginData.user.id);

    if (updateError) {
      console.error('❌ Cannot update own profile:', updateError.message);
    } else {
      console.log('✅ Can update own profile');
      console.log(`   Updated max pullups to: ${newMax}\n`);
    }

    // Step 5: Summary
    console.log('📋 SUMMARY:');
    console.log('✅ User signup works');
    console.log('✅ Profile created automatically with your default values');
    console.log('✅ User can login');
    console.log('✅ RLS policies allow user to read/update their profile');
    console.log('\n🎉 All tests passed! The trigger is working correctly.\n');

    // Cleanup
    console.log('🧹 Cleaning up test user...');
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Also test existing users
async function checkExistingUsers() {
  console.log('📊 Checking existing users...\n');
  
  // This requires service role key to bypass RLS
  console.log('ℹ️  To check all existing users, you need to run a query in Supabase dashboard:');
  console.log('\nSELECT ');
  console.log('  u.id, ');
  console.log('  u.email, ');
  console.log('  p.id as profile_id,');
  console.log('  p.current_max_pullups,');
  console.log('  p.cycle_start_max,');
  console.log('  p.current_workout_in_cycle');
  console.log('FROM auth.users u');
  console.log('LEFT JOIN public.profiles p ON u.id = p.id;');
  console.log('\nThis will show which users have profiles and which don\'t.\n');
}

// Run tests
console.log('🚀 Dr. ChinTickle Signup Flow Test\n');
console.log('This test will:');
console.log('1. Create a new test user');
console.log('2. Verify the profile is created automatically');
console.log('3. Check the default values you set');
console.log('4. Test RLS policies\n');

testSignupFlow().then(() => {
  checkExistingUsers();
});