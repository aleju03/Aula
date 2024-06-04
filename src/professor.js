
import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import { useRoute } from "@react-navigation/native";
import { NavigationContainer } from '@react-navigation/native';


const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
});

const Greeting = props => {
  return (
    <View style={styles.center}>
      <Text>Hello {props.name}!</Text>
    </View>
  );
};

const LotsOfGreetings = ({navigation, route}) => {
  const routel = useRoute()
  const id = routel.params?.carne
  return (
    <View style={[styles.center, {top: 50}]}>
      <Greeting name= {id} />
      <Greeting name="Matthew" />
      <Greeting name="Alejandro" />
    </View>
  );
};

export default LotsOfGreetings;