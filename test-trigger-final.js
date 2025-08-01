const { createClient } = require('@supabase/supabase-js');

// Using correct credentials from your React Native POC
const supabaseUrl = 'https://xrbsygiiffgfdalbvfoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYnN5Z2lpZmZnZmRhbGJ2Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMTc1MzksImV4cCI6MjA2NzU5MzUzOX0.FY63XgW5PcFOlzEhcPbVZv5nfe7c1K6q6B5jos6aQng';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTriggerFinal() {
  console.log('🔍 Testing Profile Trigger (Final Check)\n');
  console.log(`🔗 Database: ${supabaseUrl}`);
  console.log(`🔑 Using correct anon key from React Native POC\n`);

  // Generate test user
  const testEmail = `final_test_${Date.now()}@drchintickle.com`;
  const testPassword = 'TestPassword123!';

  try {
    console.log('1️⃣ Creating test user...');
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
    console.log(`   Session: ${signUpData.session ? 'Active' : 'None'}`);
    console.log(`   Email confirmed: ${signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}\n`);

    // Wait for trigger to execute
    console.log('2️⃣ Waiting for trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if we have a session (some configs auto-confirm)
    if (signUpData.session) {
      console.log('3️⃣ Using existing session to check profile...');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile not found:', profileError.message);
        console.log('\n🚨 POSSIBLE ISSUES:');
        console.log('   1. Trigger not installed in database');
        console.log('   2. RLS policies blocking access');
        console.log('   3. Profile table structure mismatch');
        console.log('\n🔧 Please verify in Supabase dashboard that:');
        console.log('   - The trigger exists');
        console.log('   - The profiles table has the correct structure');
        console.log('   - RLS policies allow user access');
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

      console.log('✅ SUCCESS! The trigger is working perfectly.');
      console.log('   New users will automatically get profiles with your custom defaults.\n');

    } else {
      console.log('3️⃣ No active session (email confirmation required)');
      console.log('   This is normal if email confirmation is enabled in your Supabase settings.\n');
      
      console.log('🔧 To complete the test:');
      console.log('   1. Check the email inbox for confirmation');
      console.log('   2. Or disable email confirmation in Auth settings');
      console.log('   3. Try signing up through your actual app\n');
      
      console.log('ℹ️  The trigger should still work once the user confirms their email.');
    }

    // Cleanup
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testTriggerFinal();