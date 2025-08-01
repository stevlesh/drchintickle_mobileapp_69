// Dr. ChinTickle Global Typography System - Miami Vice Edition
// All text elements must use one of these predefined styles

export const typography = {
  // Main Dr. ChinTickle Title - Using Pacifico for signature style
  drChinTickleTitle: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 40,
    fontStyle: 'italic',
    // Used for main "DR. CHINTICKLE" headers
  },
  
  // H1 - Hero Numbers (Progress Ring center, large stats)
  h1: {
    fontFamily: 'Orbitron_900Black',
    fontWeight: '900',
    fontSize: 48,
    letterSpacing: 2,
  },
  
  // H2 - Page Titles (Screen headers)
  h2: {
    fontFamily: 'Orbitron_700Bold',
    fontWeight: '700',
    fontSize: 32,
    letterSpacing: 1.5,
  },
  
  // H3 - Sub-Titles & Section Headers
  h3: {
    fontFamily: 'Orbitron_700Bold',
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: 1,
  },
  
  // Button Text - Bold and impactful
  button: {
    fontFamily: 'Orbitron_700Bold',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  
  // Label/Info Text - Clean and readable
  label: {
    fontFamily: 'Orbitron_400Regular',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  
  // Small text - For subtitles and details
  small: {
    fontFamily: 'Orbitron_400Regular',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  
  // Motivational Quotes - Using Righteous for personality
  quote: {
    fontFamily: 'Righteous_400Regular',
    fontSize: 16,
    fontStyle: 'italic',
  },
  
  // Accent Text - Using Monoton for retro feel
  accent: {
    fontFamily: 'Monoton_400Regular',
    fontSize: 20,
    letterSpacing: 2,
  },
};

// Miami Vice Color Palette
export const colors = {
  // Primary Colors - The Miami Vice Foundation
  hotPink: '#ff1493',
  brightPink: '#ff69b4',
  purple: '#da70d6',
  electricCyan: '#00ffff',
  lightBlue: '#00bfff',
  neonYellow: '#ffff00',
  
  // Background Colors
  deepPurple: '#2d1b69',
  darkPurple: '#4a1b69',
  veryDark: '#1a0d3d',
  
  // Accent Colors
  coral: '#ff6b35',
  orange: '#ff8c00',
  gold: '#ffd700',
  
  // Text Colors
  white: '#ffffff',
  lightGray: '#d1d5db',
  mediumGray: '#9ca3af',
  darkGray: '#6b7280',
};

// Helper function to create intense neon glow effects that follow text contours
export const createNeonGlow = (color, intensity = 'medium') => {
  const intensityMap = {
    light: {
      color: colors.white, // Ensure text color is white for best glow effect
      textShadowColor: color,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
      // No rectangular background elements
    },
    medium: {
      color: colors.white,
      textShadowColor: color,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 15,
      // No rectangular background elements
    },
    intense: {
      color: colors.white,
      textShadowColor: color,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 20,
      // No rectangular background elements
    },
  };
  
  return intensityMap[intensity] || intensityMap.medium;
};

// Pre-defined Miami Vice text styles
export const textStyles = {
  // Main Dr. ChinTickle Title with intense neon glow
  drChinTickleTitle: {
    ...typography.drChinTickleTitle,
    color: colors.white,
    ...createNeonGlow(colors.electricCyan, 'intense'),
    transform: [{ rotate: '-2deg' }],
  },
  
  // Hero Numbers - Large stats and progress ring center
  heroNumber: {
    ...typography.h1,
    color: colors.white,
    ...createNeonGlow(colors.hotPink, 'intense'),
  },
  
  // Page Titles - Screen headers
  pageTitle: {
    ...typography.h2,
    color: colors.white,
    ...createNeonGlow(colors.electricCyan, 'medium'),
    textTransform: 'uppercase',
  },
  
  // Sub Titles - Section headers
  subTitle: {
    ...typography.h3,
    color: colors.white,
    ...createNeonGlow(colors.brightPink, 'medium'),
    textTransform: 'uppercase',
  },
  
  // Button Text - All buttons
  buttonText: {
    ...typography.button,
    color: colors.white,
    ...createNeonGlow(colors.white, 'light'),
  },
  
  // Info Labels - General information
  infoLabel: {
    ...typography.label,
    color: colors.lightGray,
    textTransform: 'uppercase',
  },
  
  // Accent Labels - Highlighted information
  accentLabel: {
    ...typography.label,
    color: colors.white,
    ...createNeonGlow(colors.electricCyan, 'light'),
    textTransform: 'uppercase',
  },
  
  // Small Text - Details and subtitles
  smallText: {
    ...typography.small,
    color: colors.mediumGray,
    textTransform: 'uppercase',
  },
  
  // Motivational Quotes - Dr. ChinTickle personality
  quote: {
    ...typography.quote,
    color: colors.neonYellow,
    // Mobile-friendly text shadow that follows text contours
    textShadowColor: colors.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  
  // Quote Author
  quoteAuthor: {
    ...typography.small,
    color: colors.darkGray,
  },
  
  // Accent Text - Using Monoton for special emphasis
  accentText: {
    ...typography.accent,
    color: colors.white,
    ...createNeonGlow(colors.purple, 'medium'),
    textTransform: 'uppercase',
  },
  
  // Success/Positive Text
  successText: {
    ...typography.label,
    color: colors.white,
    ...createNeonGlow(colors.lightBlue, 'light'),
  },
  
  // Warning/Alert Text
  warningText: {
    ...typography.label,
    color: colors.white,
    ...createNeonGlow(colors.neonYellow, 'medium'),
  },
  
  // Error/Danger Text
  errorText: {
    ...typography.label,
    color: colors.white,
    ...createNeonGlow(colors.coral, 'light'),
  },
};