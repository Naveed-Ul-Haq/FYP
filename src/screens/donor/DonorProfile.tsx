import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { API_BASE_URL } from '../../services/api';

export default function DonorProfile() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!user?.email) {
      showAlert({ title: 'Error', message: 'Email not found', type: 'error' });
      return;
    }

    if (!currentPassword) {
      showAlert({ title: 'Error', message: 'Please enter current password', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      showAlert({
        title: 'Error',
        message: 'New password must be at least 6 characters',
        type: 'error',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({ title: 'Error', message: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          purpose: 'password_change',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCodeSent(true);
        showAlert({
          title: 'Success',
          message: 'Verification code sent to your email',
          type: 'success',
        });
      } else {
        showAlert({
          title: 'Error',
          message: data.error || 'Failed to send verification code',
          type: 'error',
        });
      }
    } catch {
      showAlert({
        title: 'Error',
        message: 'Failed to send verification code',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (verificationCode.length !== 6) {
      showAlert({
        title: 'Error',
        message: 'Please enter the 6-digit verification code',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const verifyRes = await fetch(`${API_BASE_URL}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          code: verificationCode,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        showAlert({ title: 'Error', message: 'Invalid verification code', type: 'error' });
        setLoading(false);
        return;
      }

      const updateRes = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      });

      const updateData = await updateRes.json();

      if (updateData.success) {
        showAlert({
          title: 'Success',
          message: 'Password updated successfully',
          type: 'success',
        });
        navigation.goBack();
      } else {
        showAlert({
          title: 'Error',
          message: updateData.error || 'Failed to update password',
          type: 'error',
        });
      }
    } catch {
      showAlert({
        title: 'Error',
        message: 'Failed to update password',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile Settings</Text>

        <TextInput
          style={styles.input}
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {!codeSent ? (
          <TouchableOpacity style={styles.btn} onPress={handleSendCode}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Code</Text>}
          </TouchableOpacity>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Verification Code"
              keyboardType="number-pad"
              value={verificationCode}
              onChangeText={setVerificationCode}
            />

            <TouchableOpacity style={styles.btn} onPress={handleUpdatePassword}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#DC143C',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: { color: '#fff', fontWeight: '700' },
});
