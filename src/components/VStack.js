import React from 'react';
import { View } from 'react-native';

const VStack = ({ space = 12, style, children, ...rest }) => {
  const kids = React.Children.toArray(children);
  
  return (
    <View style={style} {...rest}>
      {kids.map((child, i) => (
        <View key={i} style={{ marginTop: i === 0 ? 0 : space }}>
          {child}
        </View>
      ))}
    </View>
  );
};

export default VStack;