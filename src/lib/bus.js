// Tiny singleton event bus for app-wide events
// Used for invalidating caches when data changes

const listeners = new Map();

export const bus = {
  on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => listeners.get(event)?.delete(callback);
  },
  
  emit(event, payload) {
    listeners.get(event)?.forEach(callback => callback(payload));
  },
};