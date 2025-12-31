import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AlertProvider } from './src/context/AlertContext';
import { BloodRequestProvider } from './src/context/BloodRequestContext';

/**
 * App Component - Application Entry Point
 * 
 * STRUCTURE:
 * 1. AlertProvider - Provides custom alert system across the app
 * 2. AuthProvider - Wraps entire app to provide authentication context
 * 3. BloodRequestProvider - Manages blood request state and persistence
 * 4. NavigationContainer - React Navigation wrapper
 * 5. AppNavigator - Main navigation logic with RBAC
 * 
 * FYP NOTE: AuthProvider must wrap NavigationContainer so that
 * navigation can access authentication state. BloodRequestProvider
 * depends on AuthContext so it must be nested inside AuthProvider.
 */
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

