import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAlert } from '../../context/AlertContext';
import { RootStackParamList } from '../../navigation/types';
import { API_BASE_URL } from '../../services/api';

/* ================= TYPES ================= */

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'donor' | 'user';
  account_status: 'active' | 'deactivated';
  deactivation_reason?: string;
  created_at: number; // milliseconds
  bloodGroup?: string;
  mobile?: string;
  city?: string;
}

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'ManageUsers'
>;

/* ================= COMPONENT ================= */

const ManageUsers: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { showAlert } = useAlert();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState<'all' | 'donor' | 'user'>('all');
  const [pendingAppealsCount, setPendingAppealsCount] = useState(0);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    loadUsers();
    loadAppealsCount();
  }, []);

  /* ================= API ================= */

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();

      if (!data?.users) throw new Error('Invalid response');

      const normalizedUsers: AdminUser[] = data.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        account_status: u.account_status ?? 'active',
        deactivation_reason: u.deactivation_reason,
        created_at: Number(u.created_at), // already ms
        bloodGroup: u.blood_group,
        mobile: u.mobile,
        city: u.city,
      }));

      setUsers(normalizedUsers);
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadAppealsCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/appeals`);
      const data = await response.json();

      if (data?.success && Array.isArray(data.appeals)) {
        setPendingAppealsCount(data.appeals.length);
      }
    } catch {
      /* silent */
    }
  };

  /* ================= FILTERING ================= */

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (selectedFilter !== 'all') {
      result = result.filter(u => u.role === selectedFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        u =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [users, selectedFilter, searchQuery]);

  /* ================= HELPERS ================= */

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString();

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUsers();
  };

  const roleBadgeStyle = (role: 'donor' | 'user') =>
    role === 'donor'
      ? styles.donorBadge
      : styles.recipientBadge;

  /* ================= UI ================= */

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC143C" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            placeholder="Search users"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* FILTERS */}
        <View style={styles.filterRow}>
          {['all', 'donor', 'user'].map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                selectedFilter === f && styles.filterBtnActive,
              ]}
              onPress={() => setSelectedFilter(f as any)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === f && styles.filterTextActive,
                ]}
              >
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* USERS */}
        {filteredUsers.length === 0 ? (
          <Text style={styles.emptyText}>No users found</Text>
        ) : (
          filteredUsers.map(user => (
            <TouchableOpacity
              key={user.id}
              style={styles.userCard}
              onPress={() =>
                navigation.navigate('UserProfileDetail', {
                  userId: user.id,
                })
              }
            >
              <View style={styles.userRow}>
                <Ionicons
                  name={user.role === 'donor' ? 'water' : 'medkit'}
                  size={22}
                  color={user.role === 'donor' ? '#DC143C' : '#2196F3'}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.userMeta}>
                <Text style={styles.metaText}>
                  Registered: {formatDate(user.created_at)}
                </Text>
                <View style={[styles.roleBadge, roleBadgeStyle(user.role)]}>
                  <Text style={styles.roleBadgeText}>
                    {user.role.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  header: {
    backgroundColor: '#DC143C',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  content: { padding: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchInput: { marginLeft: 8, flex: 1 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  filterBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: '#DC143C' },
  filterText: { fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  userRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  userInfo: { flex: 1 },
  userName: { fontWeight: 'bold', fontSize: 15 },
  userEmail: { fontSize: 13, color: '#666' },
  userMeta: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: { fontSize: 12, color: '#666' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  donorBadge: { backgroundColor: '#FFEBEE' },
  recipientBadge: { backgroundColor: '#E3F2FD' },
  roleBadgeText: { fontSize: 11, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
});

export default ManageUsers;
