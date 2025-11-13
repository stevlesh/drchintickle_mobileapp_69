import { supabase } from './supabase';
import { getQuote as getLocalQuote } from '../utils/quotes';

// In-memory cache (1 hour TTL)
const cache = {
  preWorkout: { quote: null, timestamp: 0 },
  workout: { quote: null, timestamp: 0 },
  completion: { quote: null, timestamp: 0 }
};

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const TIMEOUT_MS = 1000; // 1 second timeout for server fetch

/**
 * Fetch quote from server with timeout and fallback
 * @param {string} context - 'preWorkout', 'workout', or 'completion'
 * @returns {Promise<string>} - Quote text
 */
export const getQuoteFromServer = async (context) => {
  // Check cache first
  const now = Date.now();
  const cached = cache[context];
  if (cached.quote && (now - cached.timestamp) < CACHE_TTL) {
    return cached.quote;
  }

  try {
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
    );

    // Create fetch promise
    const fetchPromise = supabase.functions.invoke('get-quote', {
      body: { context }
    });

    // Race timeout vs fetch
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) throw error;
    if (!data || !data.quote) throw new Error('No quote in response');

    // Update cache
    cache[context] = { quote: data.quote, timestamp: now };
    return data.quote;

  } catch (error) {
    console.log(`Quote server fetch failed (${context}), using local fallback:`, error.message);
    // Fallback to local quotes
    return getLocalQuote(context);
  }
};
