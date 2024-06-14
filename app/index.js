import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function App() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View style={{ flex: 1, opacity, backgroundColor: '#fff' }}>
    </Animated.View>
  );
}
