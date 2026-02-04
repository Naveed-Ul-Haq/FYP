// @ts-nocheck - Type definitions incomplete for some properties
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '../../context/AlertContext';
import { adminAPI, PendingProfile } from '../../services/api';

/**
 * Profile Approvals Screen
 * 
 * Admin screen to approve or reject donor/recipient profiles
 * Shows all pending profiles with user details
 * Admin can approve or reject with remarks
 */
const ProfileApprovals: React.FC = () => {
  const navigation = useNavigation();
  const { showAlert } = useAlert();

  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Rejection Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PendingProfile | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsProfile, setDetailsProfile] = useState<PendingProfile | null>(null);

  useEffect(() => {
    loadPendingProfiles();
  }, []);

  /**
   * Load all pending profiles
   */
  const loadPendingProfiles = async () => {
    try {
      const response = await adminAPI.getPendingProfiles();
      if (response.success) {
        setProfiles(response.profiles);
        console.log(`✅ Loaded ${response.profiles.length} pending profiles`);
      }
    } catch (error: any) {
      console.error('Error loading pending profiles:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load pending profiles',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Refresh profiles
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPendingProfiles();
  };

  /**
   * Approve a profile
   */
  const handleApprove = async (profile: PendingProfile) => {
    try {
      setIsProcessing(true);
      await adminAPI.approveProfile(profile.user_id, profile.type);
      
      showAlert({
        type: 'success',
        title: 'Profile Approved',
        message: `${profile.name}'s profile has been approved`,
      });

      // Remove from list
      setProfiles(profiles.filter(p => p.user_id !== profile.user_id));
    } catch (error: any) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to approve profile',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Show details modal
   */
  const showDetails = (profile: PendingProfile) => {
    console.log('📋 Showing profile details:', profile);
    setDetailsProfile(profile);
    setShowDetailsModal(true);
  };

  /**
   * Show reject modal
   */
  const showRejectDialog = (profile: PendingProfile) => {
    setSelectedProfile(profile);
    setRejectionRemarks('');
    setShowRejectModal(true);
  };

  /**
   * Reject a profile with remarks
   */
  const handleReject = async () => {
    if (!selectedProfile) return;

    if (!rejectionRemarks.trim()) {
      showAlert({
        type: 'warning',
        title: 'Remarks Required',
        message: 'Please provide rejection remarks',
      });
      return;
    }

    try {
      setIsProcessing(true);
      await adminAPI.rejectProfile(
        selectedProfile.user_id,
        selectedProfile.type,
        rejectionRemarks.trim()
      );

      showAlert({
        type: 'success',
        title: 'Profile Rejected',
        message: `${selectedProfile.name}'s profile has been rejected`,
      });

      // Remove from list
      setProfiles(profiles.filter(p => p.user_id !== selectedProfile.user_id));
      setShowRejectModal(false);
      setSelectedProfile(null);
    } catch (error: any) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to reject profile',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC143C" />
        <Text style={styles.loadingText}>Loading pending profiles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Professional Header with Back Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.headerBackButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerBarTitle}>Profile Approvals</Text>
          <Text style={styles.headerBarSubtitle}>
            {profiles.length} pending review{profiles.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.headerRefreshButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Stats Icon Header */}
        <View style={styles.iconHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="people" size={48} color="#DC143C" />
          </View>
          <Text style={styles.iconHeaderTitle}>Profile Approvals</Text>
          <Text style={styles.iconHeaderSubtitle}>
            Review and approve user profiles
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profiles.length}</Text>
            <Text style={styles.statLabel}>Pending Profiles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profiles.filter(p => p.type === 'donor').length}
            </Text>
            <Text style={styles.statLabel}>Donors</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profiles.filter(p => p.type === 'recipient').length}
            </Text>
            <Text style={styles.statLabel}>Recipients</Text>
          </View>
        </View>

        {/* Profiles List */}
        {profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle" size={64} color="#4CAF50" />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptySubtitle}>
              No pending profiles to review
            </Text>
          </View>
        ) : (
          <View style={styles.profilesList}>
            {profiles.map((profile) => (
              <View key={profile.user_id} style={styles.profileCard}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                  <View style={styles.profileIconContainer}>
                    <Ionicons
                      name={profile.type === 'donor' ? 'water' : 'medkit'}
                      size={24}
                      color={profile.type === 'donor' ? '#DC143C' : '#2196F3'}
                    />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profile.name}</Text>
                    <Text style={styles.profileEmail}>{profile.email}</Text>
                  </View>
                  <View
                    style={[
                      styles.typeBadge,
                      profile.type === 'donor'
                        ? styles.typeBadgeDonor
                        : styles.typeBadgeRecipient,
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {profile.type === 'donor' ? 'DONOR' : 'RECIPIENT'}
                    </Text>
                  </View>
                </View>

                {/* Profile Details Summary */}
                <View style={styles.profileDetails}>
                  {/* @ts-ignore - Field exists on profile data */}
                  {profile.mobile && (
                    <View style={styles.detailRow}>
                      <Ionicons name="call" size={16} color="#666" />
                      <Text style={styles.detailText}>{profile.mobile}</Text>
                    </View>
                  )}
                  {profile.blood_group && (
                    <View style={styles.detailRow}>
                      <Ionicons name="water" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        Blood Group: {profile.blood_group}
                      </Text>
                    </View>
                  )}
                  {profile.city && (
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {profile.city}, {profile.zipcode}
                      </Text>
                    </View>
                  )}
                </View>





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  // Professional Header Bar Styles
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC143C',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRefreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerBarSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  // Icon Header (below top bar)
  iconHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
  },
  iconHeaderSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DC143C',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  profilesList: {
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  profileEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeDonor: {
    backgroundColor: '#FFEBEE',
  },
  typeBadgeRecipient: {
    backgroundColor: '#E3F2FD',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  profileDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  remarksInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#DC143C',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginBottom: 12,
  },
  viewDetailsText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsModalScroll: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    width: '100%',
  },
  detailsModalContent: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
  },
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailsModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  detailsSection: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC143C',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailsLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
    fontWeight: '500',
    flexShrink: 0,
  },
  detailsValue: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  detailsValueBold: {
    fontWeight: 'bold',
  },
  detailsModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  profileImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#DC143C',
  },
});

export default ProfileApprovals;

