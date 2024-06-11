import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

const EncargadoHome = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Encargado Home</Text>
    </View>
  );
};

export default EncargadoHome;