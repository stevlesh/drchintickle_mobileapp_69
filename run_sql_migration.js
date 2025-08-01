const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials from environment or use the ones from your React Native app
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ecvtshwxjmhsaxyajoss.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  console.log('\nTo run this script:');
  console.log('1. Get your service role key from Supabase Dashboard > Settings > API');
  console.log('2. Run: SUPABASE_SERVICE_KEY="your-service-key" node run_sql_migration.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'supabase', 'create_profile_trigger.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements (roughly)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Since we can't execute raw SQL through the JS client, we need to use RPC
      // This won't work directly, so we'll provide instructions instead
      console.log('Statement preview:', statement.substring(0, 100) + '...\n');
    }
    
    console.log('⚠️  Note: The Supabase JS client cannot execute raw SQL directly.');
    console.log('\n✅ Please run the following SQL in your Supabase Dashboard:');
    console.log('1. Go to https://app.supabase.com/project/ecvtshwxjmhsaxyajoss/sql/new');
    console.log('2. Copy and paste the contents of: supabase/create_profile_trigger.sql');
    console.log('3. Click "Run" to execute the migration');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();