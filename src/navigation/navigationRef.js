import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingRoute = null; // holds a route name if reset attempted before ready

export function resetTo(name) {
  console.log('[NAV] resetTo', name, 'ready?', navigationRef.isReady(), 'current=', navigationRef.getCurrentRoute()?.name);
  try {
    const hasTree = !!navigationRef.getRootState()?.routes?.length;
    if (navigationRef.isReady() && hasTree) {
      console.log('[NAV] do reset ->', name);
      navigationRef.reset({ index: 0, routes: [{ name }] });
      pendingRoute = null;
    } else {
      console.log('[NAV] queue', name);
      pendingRoute = name; // queue it
    }
  } catch (e) {
    console.warn('[NAV] reset early, queueing instead:', e?.message);
    pendingRoute = name;
  }
}

// Call this once the container is ready
export function flushPendingNavigation() {
  console.log('[NAV] flush pending?', pendingRoute, 'ready?', navigationRef.isReady());
  try {
    const hasTree = !!navigationRef.getRootState()?.routes?.length;
    if (pendingRoute && navigationRef.isReady() && hasTree) {
      navigationRef.reset({ index: 0, routes: [{ name: pendingRoute }] });
      pendingRoute = null;
      console.log('[NAV] flushed');
    }
  } catch (e) {
    console.warn('[NAV] flush skipped:', e?.message);
  }
}