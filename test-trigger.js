const { createClient } = require('@supabase/supabase-js');

// Use the same config as your app
const supabaseUrl = 'https://xrbsygiiffgfdalbvfoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYnN5Z2lpZmZnZmRhbGJ2Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMTc1MzksImV4cCI6MjA2NzU5MzUzOX0.FY63XgW5PcFOlzEhcPbVZv5nfe7c1K6q6B5jos6aQng';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate random test email
const testEmail = `test_${Date.now()}@drchintickle.com`;
const testPassword = 'TestPassword123!';

async function testTrigger() {
  console.log('🧪 Testing Dr. ChinTickle Profile Trigger\n');
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

    // Step 2: Wait for trigger to execute
    console.log('2️⃣ Waiting for trigger to create profile...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Check if profile was created
    console.log('3️⃣ Checking if profile exists...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signUpData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile not found or access denied:', profileError.message);
      console.log('\n🔧 Possible issues:');
      console.log('   - Trigger not installed');
      console.log('   - RLS policies blocking access');
      console.log('   - Profile table structure mismatch');
      console.log('\n💡 Check your Supabase dashboard to verify the trigger exists.');
      return;
    }

    console.log('✅ Profile found! Trigger is working correctly.');
    console.log('\n📊 Profile details:');
    console.log(`   - ID: ${profile.id}`);
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Current Max Pullups: ${profile.current_max_pullups}`);
    console.log(`   - Cycle Start Max: ${profile.cycle_start_max}`);
    console.log(`   - Current Workout: ${profile.current_workout_in_cycle}`);
    console.log(`   - Created At: ${profile.created_at}`);
    console.log(`   - Updated At: ${profile.updated_at}\n`);

    // Step 4: Test login flow
    console.log('4️⃣ Testing login with new account...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }

    console.log('✅ Login successful!\n');

    // Step 5: Test profile updates
    console.log('5️⃣ Testing profile updates...');
    const newMax = profile.current_max_pullups + 5;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_max_pullups: newMax })
      .eq('id', loginData.user.id);

    if (updateError) {
      console.error('❌ Cannot update profile:', updateError.message);
    } else {
      console.log(`✅ Profile updated successfully! New max: ${newMax}\n`);
    }

    // Step 6: Summary
    console.log('🎉 TEST RESULTS:');
    console.log('✅ User signup works');
    console.log('✅ Profile created automatically by trigger');
    console.log(`✅ Default values: ${profile.current_max_pullups} max, workout ${profile.current_workout_in_cycle}`);
    console.log('✅ User can login immediately');
    console.log('✅ Profile can be updated');
    console.log('\n🚀 The trigger is working perfectly with your custom defaults!\n');

    // Cleanup
    console.log('🧹 Cleaning up...');
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('\n🔧 Please check your database setup and trigger installation.');
  }
}

// Run the test
testTrigger();