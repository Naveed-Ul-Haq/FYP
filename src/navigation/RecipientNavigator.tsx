import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Recipient Screens (EXISTING ONLY)
import UserHomeScreen from '../screens/user/UserHomeScreen';
import RecipientProfileForm from '../screens/user/RecipientProfileForm';

export type RecipientStackParamList = {
  UserHome: undefined;
  RecipientProfileForm: undefined;
};

const Stack = createNativeStackNavigator<RecipientStackParamList>();

const RecipientNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="UserHome"
      screenOptions={{
        headerStyle: { backgroundColor: '#DC143C' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Recipient Home */}
      <Stack.Screen
        name="UserHome"
        component={UserHomeScreen}
        options={{
          title: 'Recipient Dashboard',
          headerBackVisible: false,
        }}
      />

      {/* Recipient Profile Form */}
      <Stack.Screen
        name="RecipientProfileForm"
        component={RecipientProfileForm}
        options={{ title: 'Complete Profile' }}
      />
    </Stack.Navigator>
  );
};

export default RecipientNavigator;
