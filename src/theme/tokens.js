// Dr. ChinTickle Design System - Miami Vice Token System
// Systematic token-based approach with backwards compatibility

// Base color palette - Miami Vice foundation
export const palette = {
  // Primary neon colors
  hotPink: '#ff1493',
  brightPink: '#ff69b4', 
  purple: '#da70d6',
  electricCyan: '#00ffff',
  lightBlue: '#00bfff',
  neonYellow: '#ffff00',
  
  // Background gradients
  deepPurple: '#2d1b69',
  darkPurple: '#4a1b69', 
  veryDark: '#1a0d3d',
  
  // Accent colors
  coral: '#ff6b35',
  orange: '#ff8c00',
  gold: '#ffd700',
  
  // Neutrals
  white: '#ffffff',
  lightGray: '#d1d5db',
  mediumGray: '#9ca3af',
  darkGray: '#6b7280',
};

// Semantic color tokens - what colors mean in our system
export const tokens = {
  // Brand colors
  brand: {
    primary: palette.hotPink,
    secondary: palette.electricCyan,
    accent: palette.neonYellow,
  },
  
  // Background system
  background: {
    primary: palette.veryDark,
    secondary: palette.deepPurple,
    card: palette.darkPurple,
    overlay: 'rgba(26, 13, 61, 0.9)', // veryDark with transparency
  },
  
  // Border system - cyan for structure, gold/orange for emphasis
  border: {
    primary: palette.electricCyan,    // Main card borders
    accent: palette.gold,             // Number/stat emphasis
    warning: palette.orange,          // Streak/secondary stats
    glow: palette.hotPink,           // Tab bar and CTA elements
  },
  
  // Text system
  text: {
    primary: palette.white,
    secondary: palette.lightGray,
    tertiary: palette.mediumGray,
    accent: palette.electricCyan,
    success: palette.lightBlue,
    warning: palette.neonYellow,
    error: palette.coral,
  },

  // Neon color tokens for progress rings and glows
  color: {
    pinkA: '#FF006B',    // Progress ring gradient start - more vibrant
    pinkB: '#FF3DFF',    // Progress ring gradient end - more vibrant
    pinkGlow: '#FF44C8', // Progress ring glow effect
    neonPurple: '#9D4EFF',    // ELECTRIC neon purple border - more saturated and intense
    neonPurpleGlow: '#B866FF', // ELECTRIC neon purple glow - brighter and more vibrant
  },
  
  // Component-specific tokens
  component: {
    // Tab bar without glass morphism
    tabBar: {
      background: 'rgba(45, 27, 105, 0.95)', // deepPurple with transparency
      border: palette.hotPink,
      shadow: palette.hotPink,
      activeIcon: palette.electricCyan,
      inactiveIcon: '#8A8FA6',
    },
    
    // Neon card system (replaces glass morphism)
    neonCard: {
      background: ['#1d1440', '#301058'], // Gradient colors
      border: palette.electricCyan,
      shadow: palette.electricCyan,
      glow: '0 0 20px rgba(0, 255, 255, 0.3)',
    },
    
    // Progress ring
    progressRing: {
      track: 'rgba(255, 255, 255, 0.1)',
      fill: palette.hotPink,
      glow: palette.hotPink,
      center: palette.white,
    },
    
    // Buttons
    button: {
      primary: {
        background: palette.hotPink,
        text: palette.white,
        border: palette.hotPink,
        glow: palette.hotPink,
      },
      secondary: {
        background: 'transparent',
        text: palette.electricCyan,
        border: palette.electricCyan,
        glow: palette.electricCyan,
      },
    },
  },
  
  // Shadow system
  shadow: {
    small: '0 2px 8px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.4)', 
    large: '0 8px 32px rgba(0, 0, 0, 0.5)',
    neon: '0 0 20px rgba(0, 255, 255, 0.3)', // cyan glow
    pink: '0 0 20px rgba(255, 20, 147, 0.4)', // pink glow
  },
  
  // Spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius system
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
};

// Backwards compatibility - re-export existing colors
export const colors = {
  // Keep all existing color names for backwards compatibility
  ...palette,
  
  // Add any additional legacy names if needed
  neonBlue: palette.electricCyan, // Alternative name
};

// Component style generators
export const createNeonCard = (borderColor = tokens.border.primary) => ({
  borderRadius: tokens.radius.lg,
  borderWidth: 1.5,
  borderColor,
  backgroundColor: 'transparent', // Use LinearGradient for background
  shadowColor: borderColor,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 8,
});

export const createTabBarStyle = (insets = {}) => ({
  height: 52 + (insets.bottom || 0),
  paddingBottom: insets.bottom || 4,
  paddingTop: 6,
  borderTopWidth: 2,
  borderTopColor: tokens.component.tabBar.border,
  position: 'absolute',
  marginHorizontal: 0,
  marginTop: 0,
  marginBottom: 0,
  backgroundColor: tokens.component.tabBar.background,
  shadowColor: tokens.component.tabBar.shadow,
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.6,
  shadowRadius: 8,
  elevation: 20,
});

// Export everything for easy importing
export default {
  palette,
  tokens,
  colors,
  createNeonCard,
  createTabBarStyle,
};