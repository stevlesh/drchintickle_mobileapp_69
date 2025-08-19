import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const supabaseUrl = 'https://xrbsygiiffgfdalbvfoe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYnN5Z2lpZmZnZmRhbGJ2Zm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMTc1MzksImV4cCI6MjA2NzU5MzUzOX0.FY63XgW5PcFOlzEhcPbVZv5nfe7c1K6q6B5jos6aQng'

// Use different storage for web vs native
const storage = Platform.OS === 'web' ? undefined : AsyncStorage

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-rn'
    },
    ...(Platform.OS !== 'web' && {
      fetch: (url, options = {}) => {
        let finalHeaders = {};
        
        // Handle different header formats from Supabase client
        if (options.headers && options.headers.map) {
          // REST API calls come with headers.map structure - flatten it
          finalHeaders = { ...options.headers.map };
        } else if (options.headers) {
          // Auth API calls have flat headers - use directly
          finalHeaders = { ...options.headers };
        }
        
        // Add our custom header
        finalHeaders['X-Client-Info'] = 'supabase-js-rn';
        
        return fetch(url, {
          ...options,
          headers: finalHeaders,
        });
      },
    }),
  },
})