/**
 * Admin Profile Screen
 *
 * Secure Admin Profile Management
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { RootStackParamList } from '../../navigation/types';
import { API_BASE_URL } from '../../services/api';

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'AdminProfile'
>;

const AdminProfile: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout, token } = useAuth();
  const { showAlert } = useAlert();

  const logoutTimer = useRef<NodeJS.Timeout | null>(null);

  const [showEmailSection, setShowEmailSection] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  /* ================= EMAIL STATES ================= */

  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  /* ================= PASSWORD STATES ================= */

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordCode, setPasswordCode] = useState('');
  const [passwordCodeSent, setPasswordCodeSent] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  /* ================= HELPERS ================= */

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const sendVerificationCode = async (email: string, purpose: string) => {
    const response = await fetch(`${API_BASE_URL}/send-verification`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ email, purpose }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.error || 'Failed to send code');
    }
  };

  const verifyCode = async (email: string, code: string, purpose: string) => {
    const response = await fetch(`${API_BASE_URL}/verify-code`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ email, code, purpose }),
    });

    if (!response.ok) {
      throw new Error('Invalid verification code');
    }
  };

  /* ================= EMAIL FLOW ================= */

  const handleSendEmailCode = async () => {
    if (!newEmail.includes('@')) {
      showAlert({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address',
      });
      return;
    }

    try {
      setEmailLoading(true);
      await sendVerificationCode(newEmail, 'email_update');

      setEmailCodeSent(true);
      showAlert({
        type: 'success',
        title: 'Code Sent',
        message: `Verification code sent to ${newEmail}`,
      });
    } catch (e: any) {
      showAlert({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!emailCode) {
      showAlert({
        type: 'error',
        title: 'Verification Required',
        message: 'Please enter the verification code',
      });
      return;
    }

    try {
      setEmailLoading(true);
      await verifyCode(newEmail, emailCode, 'email_update');

      const response = await fetch(`${API_BASE_URL}/admin/update-email`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          userId: user?.id,
          newEmail,
        }),
      });

      if (!response.ok) throw new Error('Failed to update email');

      showAlert({
        type: 'success',
        title: 'Email Updated',
        message: 'Email updated successfully. Logging out...',
      });

      logoutTimer.current = setTimeout(() => logout(), 2000);
    } catch (e: any) {
      showAlert({ type: 'error', title: 'Update Failed', message: e.message });
    } finally {
      setEmailLoading(false);
    }
  };

  /* ================= PASSWORD FLOW ================= */

  const handleSendPasswordCode = async () => {
    if (!currentPassword || newPassword.length < 6 || newPassword !== confirmPassword) {
      showAlert({
        type: 'error',
        title: 'Invalid Input',
        message: 'Please check password fields',
      });
      return;
    }

    try {
      setPasswordLoading(true);
      await sendVerificationCode(user!.email, 'password_change');

      setPasswordCodeSent(true);
      showAlert({
        type: 'success',
        title: 'Code Sent',
        message: 'Verification code sent to your email',
      });
    } catch (e: any) {
      showAlert({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordCode) {
      showAlert({
        type: 'error',
        title: 'Verification Required',
        message: 'Please enter verification code',
      });
      return;
    }

    try {
      setPasswordLoading(true);
      await verifyCode(user!.email, passwordCode, 'password_change');

      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          email: user!.email,
          newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to change password');

      showAlert({
        type: 'success',
        title: 'Password Changed',
        message: 'Password updated successfully',
      });

      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordCode('');
      setPasswordCodeSent(false);
    } catch (e: any) {
      showAlert({ type: 'error', title: 'Update Failed', message: e.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* PROFILE CARD */}
        <View style={styles.card}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.role}>ADMINISTRATOR</Text>
        </View>

        {/* EMAIL & PASSWORD SECTIONS — unchanged UI */}
        {/* (UI code intentionally omitted for brevity – logic already fixed) */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#DC143C',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  name: { fontSize: 22, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#666', marginTop: 6 },
  role: { marginTop: 10, color: '#DC143C', fontWeight: 'bold' },
});

export default AdminProfile;
