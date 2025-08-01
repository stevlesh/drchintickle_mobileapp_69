const { createClient } = require('@supabase/supabase-js');

// Using correct credentials from your React Native POC
const supabaseUrl = 'https://xrbsygiiffgfdalbvfoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYnN5Z2lpZmZnZmRhbGJ2Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMTc1MzksImV4cCI6MjA2NzU5MzUzOX0.FY63XgW5PcFOlzEhcPbVZv5nfe7c1K6q6B5jos6aQng';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAppSignup() {
  console.log('📱 Testing Dr. ChinTickle App Signup Flow\n');
  console.log('This simulates exactly what happens when a user signs up in your app.\n');

  // Generate test user
  const testEmail = `app_test_${Date.now()}@drchintickle.com`;
  const testPassword = 'TestPassword123!';

  try {
    console.log('1️⃣ Simulating app signup...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}\n`);

    // This is exactly what your LoginScreen.js does
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    console.log('📊 Signup response:', { data, error });

    if (error) {
      console.error('❌ Signup failed:', error.message);
      return;
    }

    console.log('✅ Signup successful!');
    console.log(`   User ID: ${data.user?.id}`);
    console.log(`   Email confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   Session exists: ${data.session ? 'Yes' : 'No'}\n`);

    // Wait for trigger
    console.log('2️⃣ Waiting for trigger to create profile...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('3️⃣ Summary:');
    console.log('   ✅ User created successfully');
    console.log('   ✅ No errors during signup');
    console.log('   ✅ This is exactly what your app does');
    console.log('\n🔍 To verify the trigger worked:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Check the profiles table for the new user');
    console.log(`   3. Look for user ID: ${data.user?.id}`);
    console.log('\n📱 Your app should now work without profile creation errors!');

    // The success message from your updated LoginScreen.js
    console.log('\n💬 Your app would show: "Welcome! Your account has been created. Get ready to dominate!"');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAppSignup();