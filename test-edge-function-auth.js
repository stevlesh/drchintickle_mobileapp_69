require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Load credentials from .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testEdgeFunctionAuth() {
  console.log('🧪 Testing Edge Function Authentication...\n');
  
  try {
    // Test 1: Try with service role key
    console.log('1️⃣ Testing with service role key...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: adminData, error: adminError } = await supabaseAdmin.functions.invoke('onboarding', {
      body: { action: 'check_status' }
    });
    
    if (adminError) {
      console.log('❌ Service role error:', adminError);
    } else {
      console.log('✅ Service role works:', adminData);
    }
    
    // Test 2: Try with anon key and no user (should fail)
    console.log('\n2️⃣ Testing with anon key (no user - should fail)...');
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: anonData, error: anonError } = await supabaseAnon.functions.invoke('onboarding', {
      body: { action: 'check_status' }
    });
    
    if (anonError) {
      console.log('❌ Anon key error (expected):', anonError);
    } else {
      console.log('✅ Anon key works (unexpected):', anonData);
    }
    
    // Test 3: Check function status via API
    console.log('\n3️⃣ Checking function deployment status...');
    const response = await fetch(`${supabaseUrl}/functions/v1/onboarding`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'check_status' })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Direct HTTP call works:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Direct HTTP call failed:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEdgeFunctionAuth();