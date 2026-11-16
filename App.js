import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TaskInput from './screens/TaskInput';
import TaskList from './screens/TaskList';
import LoginScreen from './screens/LoginScreen';
import Draggable from 'react-native-draggable';
import InscriptionScreen from './screens/InscriptionScreen';
import BoardScreen from './screens/BoardScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="TaskList" component={TaskList} />
        <Stack.Screen name="Inscription" component={InscriptionScreen} />
        <Stack.Screen name="Board" component={BoardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}