import React, { useEffect, useRef } from 'react';
import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../utils/store';
import { Animated } from 'react-native';
import NavigationHandler from './NavigationHandler';

export default function AppLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <Slot />
        <NavigationHandler />
      </PersistGate>
    </Provider>
  );
}

function Loading() {
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
