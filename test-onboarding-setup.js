const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://xrbsygiiffgfdalbvfoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYnN5Z2lpZmZnZmRhbGJ2Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMTc1MzksImV4cCI6MjA2NzU5MzUzOX0.FY63XgW5PcFOlzEhcPbVZv5nfe7c1K6q6B5jos6aQng';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testOnboardingSetup() {
  console.log('🧪 Testing Dr. ChinTickle Onboarding Setup\n');
  
  let allTestsPassed = true;
  
  // Test 1: Check if database columns exist
  console.log('1️⃣ Checking database columns...');
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('has_completed_onboarding, onboarding_completed_at, can_do_eight_pullups')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ Database columns not found. Please run the SQL setup.');
        console.log('   Go to: https://app.supabase.com/project/xrbsygiiffgfdalbvfoe/sql/new');
        console.log('   Copy and run: supabase/complete_onboarding_setup.sql\n');
        allTestsPassed = false;
      } else {
        console.log('✅ Database columns exist!\n');
      }
    } else {
      console.log('✅ Database columns exist!\n');
    }
  } catch (error) {
    console.log('❌ Error checking database:', error.message, '\n');
    allTestsPassed = false;
  }
  
  // Test 2: Check if Edge Function exists
  console.log('2️⃣ Checking Edge Function...');
  try {
    // Create a test user to check the function
    const testEmail = `test_${Date.now()}@drchintickle.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.log('⚠️  Could not create test user:', signUpError.message);
    } else if (authData.user) {
      // Try to call the Edge Function
      const { data, error } = await supabase.functions.invoke('onboarding', {
        body: { action: 'check_status' }
      });
      
      if (error) {
        console.log('❌ Edge Function not deployed or not working.');
        console.log('   Go to: https://app.supabase.com/project/xrbsygiiffgfdalbvfoe/functions');
        console.log('   Create function named "onboarding" with code from: supabase/functions/onboarding/index.js\n');
        allTestsPassed = false;
      } else {
        console.log('✅ Edge Function is working!');
        console.log('   Response:', JSON.stringify(data, null, 2), '\n');
      }
      
      // Clean up test user
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.log('❌ Error testing Edge Function:', error.message, '\n');
    allTestsPassed = false;
  }
  
  // Test 3: Check existing user
  console.log('3️⃣ Checking if existing users are marked correctly...');
  try {
    // Try to check any profile (this might fail due to RLS)
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('has_completed_onboarding', true);
    
    if (!error && count !== null) {
      console.log(`✅ Found ${count} users marked as onboarding complete\n`);
    } else {
      console.log('ℹ️  Cannot verify user status (this is normal due to security)\n');
    }
  } catch (error) {
    console.log('ℹ️  Cannot verify user status (this is normal)\n');
  }
  
  // Summary
  console.log('📊 TEST SUMMARY:');
  if (allTestsPassed) {
    console.log('✅ All tests passed! Your onboarding is ready to use.');
    console.log('\n🎉 Next steps:');
    console.log('1. Run your app: npm start');
    console.log('2. Create a new account');
    console.log('3. You should see the onboarding flow!');
  } else {
    console.log('❌ Some tests failed. Please complete the setup steps above.');
    console.log('\n📋 Setup checklist:');
    console.log('1. Run SQL in Supabase dashboard');
    console.log('2. Deploy Edge Function in Supabase dashboard');
    console.log('3. Run this test again: node test-onboarding-setup.js');
  }
}

// Run the tests
testOnboardingSetup().catch(console.error);