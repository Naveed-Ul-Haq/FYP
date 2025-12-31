import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Existing Donor Screens ONLY
import DonorHomeScreen from '../screens/donor/DonorHomeScreen';
import DonorProfileForm from '../screens/donor/DonorProfileForm';
import DonorProfile from '../screens/donor/DonorProfile';

export type DonorStackParamList = {
  DonorHome: undefined;
  DonorProfileForm: undefined;
  DonorProfile: undefined;
};

const Stack = createNativeStackNavigator<DonorStackParamList>();

const DonorNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DonorHome"
      screenOptions={{
        headerStyle: { backgroundColor: '#DC143C' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="DonorHome"
        component={DonorHomeScreen}
        options={{
          title: 'Donor Dashboard',
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="DonorProfileForm"
        component={DonorProfileForm}
        options={{ title: 'Complete Profile' }}
      />

      <Stack.Screen
        name="DonorProfile"
        component={DonorProfile}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default DonorNavigator;
