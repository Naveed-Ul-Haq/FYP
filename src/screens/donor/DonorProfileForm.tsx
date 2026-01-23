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
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { profileApi } from '../../services/api/profileApi';

const DonorProfileForm: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [profileImage, setProfileImage] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [zipcode, setZipcode] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [lastDonated, setLastDonated] = useState<Date | null>(null);
  const [disease, setDisease] = useState<string>('None');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDiseasePicker, setShowDiseasePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const diseases = ['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Other'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const res = await profileApi.getDonorProfile(user.id);
      if (res.success && res.profile) {
        const p = res.profile;
        setExistingProfile(p);
        setProfileImage(p.profile_image || '');
        setMobile(p.mobile || '');
        setAddress(p.address || '');
        setCity(p.city || '');
        setZipcode(p.zipcode || '');
        setBloodGroup(p.blood_group || '');
        setAge(p.age?.toString() || '');
        setWeight(p.weight?.toString() || '');
        if (p.last_donated) setLastDonated(new Date(p.last_donated));
        setDisease(p.disease || 'None');
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
    if (!bloodGroup) e.bloodGroup = 'Blood group required';
    if (+age < 18 || +age > 65) e.age = 'Age 18–65';
    if (+weight < 50) e.weight = 'Min weight 50kg';
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
        address,
        city,
        zipcode,
        bloodGroup,
        age: +age,
        weight: +weight,
        lastDonated: lastDonated?.toISOString(),
        disease,
      };

      const res = await profileApi.updateDonorProfile(user.id, payload);
      if (res.success) {
        showAlert({
          type: 'success',
          title: 'Profile Submitted',
          message: 'Your profile has been sent for admin approval.',
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

  /* UI JSX BELOW IS UNCHANGED */
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* keep your existing JSX exactly as it is */}
    </KeyboardAvoidingView>
  );
};

export default DonorProfileForm;
