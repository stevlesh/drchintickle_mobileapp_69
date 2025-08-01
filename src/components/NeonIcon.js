import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const NeonIcon = ({ 
  type = 'trophy', 
  size = 24, 
  color = "#ff69b4", 
  style = {} 
}) => {
  const getIconPath = () => {
    switch (type) {
      case 'trophy':
        return (
          <>
            {/* Trophy Cup - More detailed */}
            <Path
              d="M7 6 L17 6 Q18 6 18 7 L17.5 13 Q17.5 14 16.5 14 L7.5 14 Q6.5 14 6.5 13 L6 7 Q6 6 7 6 Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Trophy Base */}
            <Path
              d="M9 14 L9 18 L15 18 L15 14"
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Trophy Stand */}
            <Path
              d="M7 18 L17 18 M8 18 L8 20 L16 20 L16 18"
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Trophy Handles - More elegant */}
            <Path
              d="M6 8 L4 8 Q2 8 2 10 Q2 12 4 12 L6 12"
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M18 8 L20 8 Q22 8 22 10 Q22 12 20 12 L18 12"
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Trophy Decoration */}
            <Path
              d="M10 9 L14 9 M9 11 L15 11"
              stroke={color}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
      
      case 'fire':
        return (
          <>
            {/* Main Flame */}
            <Path
              d="M12 2 C8 6 8 10 10 12 C8 14 9 16 12 16 C15 16 16 14 14 12 C16 10 16 6 12 2 Z"
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner Flame */}
            <Path
              d="M12 6 C10 8 10 10 11 11 C10 12 11 13 12 13 C13 13 14 12 13 11 C14 10 14 8 12 6 Z"
              stroke={color}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Flame Base */}
            <Path
              d="M8 15 Q10 17 12 17 Q14 17 16 15"
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        );
      
      case 'celebration':
        return (
          <>
            {/* Celebration Confetti */}
            <Path
              d="M12 2 L12 8 M12 16 L12 22 M4.22 4.22 L9.17 9.17 M14.83 14.83 L19.78 19.78 M2 12 L8 12 M16 12 L22 12 M4.22 19.78 L9.17 14.83 M14.83 9.17 L19.78 4.22"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Center Circle */}
            <Circle
              cx="12"
              cy="12"
              r="3"
              stroke={color}
              strokeWidth="2"
              fill="none"
            />
          </>
        );
      
      default:
        return (
          <Circle
            cx="12"
            cy="12"
            r="8"
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
        );
    }
  };

  return (
    <View style={[{ 
      width: size, 
      height: size,
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
    }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
      >
        {getIconPath()}
      </Svg>
    </View>
  );
};

export default NeonIcon; 