import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingRoute = null; // holds a route name if reset attempted before ready

export function resetTo(name) {
  console.log('[NAV] resetTo', name, 'ready?', navigationRef.isReady(), 'current=', navigationRef.getCurrentRoute()?.name);
  if (navigationRef.isReady()) {
    console.log('[NAV] do reset ->', name);
    navigationRef.reset({ index: 0, routes: [{ name }] });
    pendingRoute = null;
  } else {
    console.log('[NAV] queue', name);
    pendingRoute = name; // queue it
  }
}

// Call this once the container is ready
export function flushPendingNavigation() {
  console.log('[NAV] flush pending?', pendingRoute, 'ready?', navigationRef.isReady());
  if (pendingRoute && navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: pendingRoute }] });
    pendingRoute = null;
    console.log('[NAV] flushed', pendingRoute);
  }
}