import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Recipient Screens
import UserHomeScreen from '../screens/user/UserHomeScreen';
import RecipientProfileForm from '../screens/user/RecipientProfileForm';
import RecipientProfile from '../screens/user/RecipientProfile';

export type RecipientStackParamList = {
  UserHome: undefined;
  RecipientProfileForm: undefined;
  RecipientProfile: undefined;
  CreateBloodRequest: undefined;
  RequestStatus: { requestId: string };
  RequestHistory: undefined;
  Notifications: undefined;
  LiveTracking: { requestId: string; donorId: string };
  RatingScreen: { requestId: string; donorId: string; donorName: string; recipientName: string };
};

const Stack = createStackNavigator<RecipientStackParamList>();

const RecipientNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="UserHome"
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
      {/* Recipient Home Dashboard */}
      <Stack.Screen
        name="UserHome"
        component={UserHomeScreen}
        options={{
          headerShown: false, // Using custom AppHeader in component
        }}
      />


      {/* Recipient Profile Settings */}
      <Stack.Screen
        name="RecipientProfile"
        component={RecipientProfile}
        options={{
          headerShown: false, // Custom header in component
        }}
      />
    </Stack.Navigator>
  );
};

export default RecipientNavigator;

