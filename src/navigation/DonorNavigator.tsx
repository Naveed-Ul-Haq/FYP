import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Donor Screens
import DonorHomeScreen from '../screens/donor/DonorHomeScreen';
import DonorProfile from '../screens/donor/DonorProfile';

export type DonorStackParamList = {
  DonorHome: undefined;
  DonorProfileForm: undefined;
  DonorProfile: undefined;
  AvailableRequests: undefined;
  RequestHistory: undefined;
  LiveTracking: { requestId: string; donorId: string };
  RatingScreen: { requestId: string; donorId: string; donorName: string; recipientName: string };
  Notifications: undefined;
};

const Stack = createStackNavigator<DonorStackParamList>();

const DonorNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DonorHome"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#DC143C',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeftContainerStyle: {
          paddingLeft: 10,
        },
      }}
    >
      {/* Donor Home Dashboard */}
      <Stack.Screen
        name="DonorHome"
        component={DonorHomeScreen}
        options={{
          headerShown: false, // Using custom AppHeader in component
        }}
      />

      {/* Donor Profile Settings */}
      <Stack.Screen
        name="DonorProfile"
        component={DonorProfile}
        options={{
          headerShown: false, // Custom header in component
        }}
      />
    </Stack.Navigator>
  );
};

export default DonorNavigator;

