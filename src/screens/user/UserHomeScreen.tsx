import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { useBloodRequest } from '../../context/BloodRequestContext';
import { profileApi } from '../../services/api/profileApi';

/**
 * UserHomeScreen (Recipient Dashboard)
 */
export default function UserHomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const { getUserRequests } = useBloodRequest();

  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [nearbyDonors] = useState(45); // TODO: Replace with backend geo-based donor count

  const [profileStatus, setProfileStatus] = useState<
    'loading' | 'none' | 'pending' | 'approved' | 'rejected'
  >('loading');

  const [profileRemarks, setProfileRemarks] = useState('');

  /**
   * Load recipient profile status safely
   */
  const loadProfileStatus = async () => {
    if (!user) return;

    try {
      const response = await profileApi.getRecipientProfile(user.id);

      if (response?.data?.success && response.data.profile) {
        const rawStatus =
          response.data.profile.approval_status ||
          response.data.profile.approvalStatus;

        switch (rawStatus) {
          case 'APPROVED':
            setProfileStatus('approved');
            break;
          case 'PENDING':
            setProfileStatus('pending');
            break;
          case 'REJECTED':
            setProfileStatus('rejected');
            break;
          default:
            setProfileStatus('none');
        }

        setProfileRemarks(
          response.data.profile.admin_remarks ||
            response.data.profile.adminRemarks ||
            ''
        );
      } else {
        setProfileStatus('none');
      }
    } catch {
      setProfileStatus('none');
    }
  };

  /**
   * Load user blood requests
   */
  const loadUserRequests = () => {
    if (!user?.id) return;
    const requests = getUserRequests(user.id);
    setUserRequests(requests);
  };

  /**
   * Unified refresh handler
   */
  const refreshDashboard = useCallback(() => {
    loadProfileStatus();
    loadUserRequests();
  }, [user?.id]);

  /**
   * Initial load
   */
  useEffect(() => {
    refreshDashboard();
  }, [user?.id]);

  /**
   * Refresh on screen focus
   */
  useFocusEffect(
    useCallback(() => {
      refreshDashboard();
    }, [user?.id])
  );

  /**
   * Polling every 5 seconds (safe)
   */
  useEffect(() => {
    const interval = setInterval(refreshDashboard, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  /**
   * Helpers
   */
  const formatDate = (date: Date) => date.toLocaleDateString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#4CAF50';
      case 'ACCEPTED':
        return '#34C759';
      case 'PENDING':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  /**
   * Actions
   */
  const handleLogout = () => {
    showAlert({
      type: 'warning',
      title: 'Logout',
      message: 'Are you sure you want to logout?',
    });
    logout();
  };

  const createRequest = () => {
    if (profileStatus !== 'approved') {
      showAlert({
        type: 'warning',
        title: 'Profile Required',
        message:
          profileStatus === 'none'
            ? 'Please complete your profile first'
            : profileStatus === 'pending'
            ? 'Your profile is pending admin approval'
            : 'Your profile was rejected. Please update it.',
      });
      return;
    }
    navigation.navigate('CreateBloodRequest');
  };

  const viewRequestStatus = (requestId: string) => {
    navigation.navigate('RequestStatus', { requestId });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Recipient Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Status */}
        {profileStatus === 'loading' && (
          <ActivityIndicator color="#DC143C" />
        )}

        {profileStatus !== 'loading' && (
          <View style={styles.profileCard}>
            <Text style={styles.profileText}>
              Profile Status:{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {profileStatus.toUpperCase()}
              </Text>
            </Text>
            {profileRemarks ? (
              <Text style={styles.profileRemarks}>{profileRemarks}</Text>
            ) : null}
          </View>
        )}

        {/* Summary */}
        <View style={styles.summary}>
          <Text>Active Requests: {userRequests.length}</Text>
          <Text>Nearby Donors: {nearbyDonors}</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.button} onPress={createRequest}>
          <Text style={styles.buttonText}>Create Blood Request</Text>
        </TouchableOpacity>

        {/* Requests */}
        {userRequests.map((req) => (
          <TouchableOpacity
            key={req.id}
            style={styles.requestCard}
            onPress={() => viewRequestStatus(req.id)}
          >
            <Text style={styles.requestTitle}>{req.location}</Text>
            <Text>{formatDate(new Date(req.createdAt))}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(req.status) },
              ]}
            >
              <Text style={styles.statusText}>{req.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#DC143C',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#fff', fontSize: 14 },
  logoutText: { color: '#fff', fontWeight: '600' },
  content: { padding: 16 },
  profileCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  profileText: { fontSize: 14 },
  profileRemarks: { fontSize: 12, color: '#F44336', marginTop: 4 },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#DC143C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  requestCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  requestTitle: { fontWeight: '600', marginBottom: 4 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  statusText: { color: '#fff', fontSize: 12 },
});
