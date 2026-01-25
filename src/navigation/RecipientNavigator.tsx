import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Recipient Screens
import UserHomeScreen from '../screens/user/UserHomeScreen';
import RecipientProfileForm from '../screens/user/RecipientProfileForm';

/**
 * Recipient Stack Navigator
 * 
 * Internal navigation for Recipient role users.
 * 
 * Screens:
 * 1. UserHome - Main dashboard (renamed to RecipientHome in context)
 * 2. RecipientProfileForm - Complete profile for admin approval
 * 3. CreateBloodRequest - Form to create new blood request
 * 4. RequestStatus - Real-time status tracking of requests
 * 
 * Navigation Flow:
 * UserHome → RecipientProfileForm / CreateBloodRequest → RequestStatus → UserHome
 * 
 * This navigator is only accessible to authenticated users with 'user' role
 * (Recipient in the context of blood requests)
 */

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

/**
 * RecipientNavigator Component
 * 
 * Provides internal navigation structure for Recipient users.
 * Includes custom header styling and back button configuration.
 */
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
        headerBackTitleVisible: false,
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
          headerTitle: 'Recipient Dashboard',
          headerLeft: () => null, // No back button on home
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

