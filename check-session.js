const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xrbsygiiffgfdalbvfoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYnN5Z2lpZmZnZmRhbGJ2Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMTc1MzksImV4cCI6MjA2NzU5MzUzOX0.FY63XgW5PcFOlzEhcPbVZv5nfe7c1K6q6B5jos6aQng';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSession() {
  console.log('Checking for existing session...\n');
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (session) {
    console.log('✅ Active session found!');
    console.log('User:', session.user.email);
    console.log('ID:', session.user.id);
    console.log('\nTo sign out, run: node sign-out.js');
  } else {
    console.log('❌ No active session');
    console.log('\nTry signing in through the app again');
  }
}

checkSession();