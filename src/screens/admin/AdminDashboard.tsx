import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { API_BASE_URL } from '../../services/api';

/* ✅ FIX 1: remove route constraint to avoid mismatch */
type NavigationProp = StackNavigationProp<RootStackParamList>;

type ActivityItem = {
  title: string;
  timeAgo: string;
  color: string;
};

export default function AdminDashboard() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout, token } = useAuth();
  const { showAlert } = useAlert();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalRecipients: 0,
    activeRequests: 0,
    totalRequests: 0,
    completedRequests: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  /* ✅ FIX 3: safe auth headers */
  const authHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  /* ================= LOAD UNREAD NOTIFICATIONS ================= */

  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    const count = await getUnreadNotificationCount(user.id);
    setUnreadCount(count);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, [loadUnreadCount])
  );

  /* ================= LOAD DASHBOARD STATS ================= */

  const loadStats = async () => {
    try {
      setIsLoading(true);

      const [usersRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/blood-requests`, { headers: authHeaders }),
      ]);

      const usersData = await usersRes.json();
      const requestsData = await requestsRes.json();

      const users = usersData.users ?? [];
      const requests = requestsData.requests ?? [];

      const donors = users.filter((u: any) => u.role === 'donor').length;
      const recipients = users.filter((u: any) => u.role === 'user').length;

      const activeReqs = requests.filter(
        (r: any) => r.status === 'PENDING' || r.status === 'ACCEPTED'
      ).length;

      const completedReqs = requests.filter(
        (r: any) => r.status === 'COMPLETED'
      ).length;

      setStats({
        totalUsers: users.length,
        totalDonors: donors,
        totalRecipients: recipients,
        activeRequests: activeReqs,
        totalRequests: requests.length,
        completedRequests: completedReqs,
      });
    } catch (error) {
      console.error('❌ [AdminDashboard] Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= LOAD RECENT ACTIVITIES ================= */

  const loadActivities = async () => {
    try {
      setLoadingActivities(true);

      const response = await fetch(
        `${API_BASE_URL}/admin/recent-activities?limit=5`,
        { headers: authHeaders }
      );

      const data = await response.json();
      if (data.success) {
        setActivities(data.activities ?? []);
      }
    } catch (error) {
      console.error('❌ [AdminDashboard] Failed to load activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadActivities();
  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    showAlert({
      type: 'warning',
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => await logout(),
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setShowMenu(!showMenu)}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>ADMINISTRATOR</Text>
          </View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>

        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.navigate('Notifications' as never)}
        >
          <Ionicons name="notifications" size={24} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DC143C" />
            <Text style={styles.loadingText}>Loading statistics...</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {(Object.entries(stats) as [string, number][]).map(([key, value]) => (
              <View key={key} style={styles.statCard}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#C81E1E',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerIcon: { padding: 8 },
  headerContent: { flex: 1 },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 10,
  },
  roleBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5722',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  scrollContent: { padding: 18 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  statValue: { fontSize: 32, fontWeight: '800' },
  statLabel: { fontSize: 13, color: '#666' },
  loadingContainer: { paddingVertical: 50, alignItems: 'center' },
  loadingText: { marginTop: 14, color: '#666' },
});
