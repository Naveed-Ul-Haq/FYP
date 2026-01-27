import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AlertProvider } from './src/context/AlertContext';
import { BloodRequestProvider } from './src/context/BloodRequestContext';
import { NotificationProvider } from './src/context/NotificationContext';


export default function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <BloodRequestProvider>
          <NavigationContainer>
            <NotificationProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </NotificationProvider>
          </NavigationContainer>
        </BloodRequestProvider>
      </AuthProvider>
    </AlertProvider>
  );
}

