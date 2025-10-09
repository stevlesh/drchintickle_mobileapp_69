/**
 * Centralized timing constants for celebration animations.
 * All totals are derived to prevent drift when segments change.
 */

export const CELEBRATION = {
  // Button sparkle animation segments
  sparkleSpinMs: 300,
  sparkleExplosionMs: 600,
  sparkleResetMs: 250,

  // Derived total (auto-updates when segments change)
  get sparkleTotalMs() {
    return this.sparkleSpinMs + this.sparkleExplosionMs + this.sparkleResetMs;
  },

  // Kiss mark animation segments
  kissPopInMs: 300,
  kissHoldMs: 400,
  kissFadeOutMs: 280,

  // Derived total
  get kissTotalMs() {
    return this.kissPopInMs + this.kissHoldMs + this.kissFadeOutMs;
  },

  // Derived failsafe: longest animation + 500ms buffer (prevents permanent lock)
  get failsafeMs() {
    return Math.max(this.sparkleTotalMs, this.kissTotalMs) + 500;
  },
};
