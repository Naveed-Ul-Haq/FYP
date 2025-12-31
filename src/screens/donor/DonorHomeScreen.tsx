import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function DonorHomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Donor Dashboard</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* Sidebar */}
      {showMenu && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackdrop} onPress={() => setShowMenu(false)} />
          <View style={styles.sidebarMenu}>
            <Text style={styles.menuUserName}>{user?.name}</Text>
            <Text style={styles.menuUserEmail}>{user?.email}</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => setShowMenu(false)}>
              <Ionicons name="person" size={20} />
              <Text>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={20} color="#DC143C" />
              <Text style={{ color: '#DC143C' }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome, {user?.name}</Text>
          <Text style={styles.cardText}>
            Your donor dashboard is ready. Advanced features like request
            matching, live tracking, and notifications will be added in the next phase.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <TouchableOpacity style={styles.actionBtn}>
            <Text>Browse Blood Requests (Coming Soon)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text>Donation History (Coming Soon)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#DC143C',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardText: { color: '#555' },
  actionBtn: {
    padding: 14,
    backgroundColor: '#FFE5E5',
    borderRadius: 10,
    marginTop: 10,
  },
  menuOverlay: { position: 'absolute', inset: 0, zIndex: 10 },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sidebarMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 260,
    backgroundColor: '#fff',
    padding: 20,
  },
  menuUserName: { fontSize: 18, fontWeight: 'bold' },
  menuUserEmail: { fontSize: 12, color: '#777', marginBottom: 20 },
  menuItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemDanger: {
    marginTop: 20,
  },
});
