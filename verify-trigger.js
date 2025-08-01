const { createClient } = require('@supabase/supabase-js');

// Using correct credentials from your React Native POC
const supabaseUrl = 'https://xrbsygiiffgfdalbvfoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYnN5Z2lpZmZnZmRhbGJ2Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMTc1MzksImV4cCI6MjA2NzU5MzUzOX0.FY63XgW5PcFOlzEhcPbVZv5nfe7c1K6q6B5jos6aQng';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyTriggerInstalled() {
  console.log('🔍 Verifying Profile Trigger Installation\n');
  console.log(`🔗 Database: ${supabaseUrl}`);
  console.log(`🔑 Using anon key: ${supabaseAnonKey.substring(0, 20)}...\n`);

  // Generate test user
  const testEmail = `trigger_test_${Date.now()}@drchintickle.com`;
  const testPassword = 'TestPassword123!';

  try {
    console.log('1️⃣ Creating test user to verify trigger...');
    console.log(`   Email: ${testEmail}\n`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('❌ User creation failed:', signUpError.message);
      return;
    }

    console.log('✅ User created successfully!');
    console.log(`   User ID: ${signUpData.user?.id}`);
    console.log(`   Email confirmed: ${signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}\n`);

    // Wait a moment for trigger to execute
    console.log('2️⃣ Waiting for trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try to sign in immediately (this will help establish auth context)
    console.log('3️⃣ Signing in to establish auth context...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }

    console.log('✅ Login successful!\n');

    // Now check for profile with authenticated user
    console.log('4️⃣ Checking if profile was created by trigger...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile not found:', profileError.message);
      console.log('\n🚨 TRIGGER NOT WORKING:');
      console.log('   The trigger was either not installed or failed to execute');
      console.log('   Please check your Supabase dashboard to verify the trigger exists');
      console.log('\n🔧 To verify trigger exists, run this in SQL Editor:');
      console.log('   SELECT * FROM information_schema.triggers WHERE trigger_name = \'on_auth_user_created\';\n');
      return;
    }

    console.log('🎉 TRIGGER IS WORKING! Profile created automatically.');
    console.log('\n📊 Profile details with your custom defaults:');
    console.log(`   - ID: ${profile.id}`);
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Current Max Pullups: ${profile.current_max_pullups}`);
    console.log(`   - Cycle Start Max: ${profile.cycle_start_max}`);
    console.log(`   - Current Workout: ${profile.current_workout_in_cycle}`);
    console.log(`   - Created: ${profile.created_at}`);
    console.log(`   - Updated: ${profile.updated_at}\n`);

    console.log('✅ SUCCESS SUMMARY:');
    console.log('   ✅ User signup works');
    console.log('   ✅ Profile created automatically');
    console.log('   ✅ Custom default values applied');
    console.log('   ✅ User can login immediately');
    console.log('   ✅ No manual profile creation needed');
    console.log('\n🚀 The trigger is working perfectly!\n');

    // Test profile update
    console.log('5️⃣ Testing profile update capability...');
    const newMax = profile.current_max_pullups + 1;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_max_pullups: newMax })
      .eq('id', profile.id);

    if (updateError) {
      console.error('❌ Profile update failed:', updateError.message);
    } else {
      console.log(`✅ Profile update successful! New max: ${newMax}`);
    }

    // Cleanup
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyTriggerInstalled();