import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AlertProvider } from './src/context/AlertContext';
import { BloodRequestProvider } from './src/context/BloodRequestContext';
export default function App() {
  return (
    
    <AlertProvider>
      <AuthProvider>
        <BloodRequestProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </BloodRequestProvider>
      </AuthProvider>
    </AlertProvider>
  );
}

