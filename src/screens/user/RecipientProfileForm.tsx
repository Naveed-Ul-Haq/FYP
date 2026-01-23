import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { profileApi } from '../../services/api/profileApi';

const RecipientProfileForm: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [profileImage, setProfileImage] = useState('');
  const [mobile, setMobile] = useState('');
  const [cnic, setCnic] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipcode, setZipcode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const res = await profileApi.getRecipientProfile(user.id);
      if (res.success && res.profile) {
        const p = res.profile;
        setExistingProfile(p);
        setProfileImage(p.profile_image || '');
        setMobile(p.mobile || '');
        setCnic(p.cnic || '');
        setAddress(p.address || '');
        setCity(p.city || '');
        setZipcode(p.zipcode || '');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const e: any = {};
    if (!profileImage) e.profileImage = 'Profile image required';
    if (!mobile.match(/^92\d{10}$/)) e.mobile = 'Invalid mobile format';
    if (!address) e.address = 'Address required';
    if (!city) e.city = 'City required';
    if (!zipcode) e.zipcode = 'Zipcode required';
    if (cnic && !cnic.match(/^\d{13}$/)) e.cnic = 'CNIC must be 13 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;
    setIsSubmitting(true);
    try {
      const payload = {
        userId: user.id,
        profileImage,
        mobile,
        cnic: cnic || undefined,
        address,
        city,
        zipcode,
      };

      const res = await profileApi.updateRecipientProfile(user.id, payload);
      if (res.success) {
        showAlert({
          type: 'success',
          title: 'Profile Submitted',
          message: 'Your profile has been submitted for admin approval.',
        });
        navigation.goBack();
      }
    } catch {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to save profile',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC143C" />
      </View>
    );
  }

  /* KEEP YOUR EXISTING JSX UI BELOW — NO CHANGES NEEDED */
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* UI remains unchanged */}
    </KeyboardAvoidingView>
  );
};

export default RecipientProfileForm;
