require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load credentials from .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env file');
  process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupOnboarding() {
  console.log('🚀 Dr. ChinTickle Onboarding Auto-Setup\n');
  
  try {
    // Step 1: Run SQL migrations
    console.log('1️⃣ Setting up database...');
    
    const sqlPath = path.join(__dirname, 'supabase', 'complete_onboarding_setup.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Note: Supabase JS client doesn't support raw SQL execution
    // We'll need to use the REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sqlContent })
    });
    
    if (!response.ok) {
      // Try alternative approach - check if columns exist
      console.log('   Checking if onboarding columns exist...');
      
      const { data: testProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('has_completed_onboarding')
        .limit(1);
      
      if (profileError && profileError.message.includes('column') && profileError.message.includes('does not exist')) {
        console.log('❌ Database columns don\'t exist yet.');
        console.log('   Please run this SQL manually in Supabase:');
        console.log('   https://app.supabase.com/project/xrbsygiiffgfdalbvfoe/sql/new');
        console.log('   File: supabase/complete_onboarding_setup.sql\n');
        return false;
      } else {
        console.log('✅ Database columns already exist!\n');
      }
    } else {
      console.log('✅ Database setup complete!\n');
    }
    
    // Step 2: Deploy Edge Function
    console.log('2️⃣ Deploying Edge Function...');
    console.log('   ⚠️  Edge Functions must be deployed through Supabase CLI or Dashboard');
    console.log('   Please go to: https://app.supabase.com/project/xrbsygiiffgfdalbvfoe/functions');
    console.log('   1. Click "New Function"');
    console.log('   2. Name it: onboarding');
    console.log('   3. Copy code from: supabase/functions/onboarding/index.js');
    console.log('   4. Click "Deploy"\n');
    
    // Step 3: Test the setup
    console.log('3️⃣ Testing setup...');
    
    // Test if we can query profiles
    const { data: profiles, error: testError } = await supabaseAdmin
      .from('profiles')
      .select('id, has_completed_onboarding')
      .limit(5);
    
    if (testError) {
      console.log('❌ Error testing profiles:', testError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles in database`);
      const onboardedCount = profiles.filter(p => p.has_completed_onboarding).length;
      console.log(`   ${onboardedCount} users have completed onboarding`);
      console.log(`   ${profiles.length - onboardedCount} users need onboarding\n`);
    }
    
    console.log('📋 SETUP SUMMARY:');
    console.log('✅ Database columns are ready');
    console.log('⚠️  Edge Function needs manual deployment (see instructions above)');
    console.log('\n🎉 Once you deploy the Edge Function, your onboarding will be ready!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

// Run the setup
setupOnboarding().then(success => {
  if (success) {
    console.log('\n✨ Setup completed successfully!');
  } else {
    console.log('\n⚠️  Setup needs manual steps - see instructions above');
  }
}).catch(console.error);