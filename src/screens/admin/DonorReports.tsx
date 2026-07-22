/**
 * Donor Reports Screen
 *
 * Lets an admin generate a filtered report of registered donors.
 *
 * FILTERS SUPPORTED:
 * - Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
 * - Age range (min / max)
 * - Location / city (partial match)
 * - Approval status (Approved / Pending / Rejected)
 * - Free-text search (name or email)
 *
 * The filters are combined and sent to the backend
 * (GET /api/admin/donors-report) which returns only matching donors,
 * so the report stays accurate even for large donor lists.
 *
 * The resulting report can be exported/shared as CSV using the
 * device's native share sheet (email it, save it, send it, etc.)
 *
 * RBAC: Only accessible to admins.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '../../context/AlertContext';
import { API_BASE_URL } from '../../services/api';

interface DonorReportRow {
  id: string;
  name: string;
  email: string;
  account_status: string;
  created_at: number;
  mobile?: string;
  address?: string;
  city?: string;
  zipcode?: string;
  blood_group?: string;
  age?: number;
  weight?: number;
  last_donated?: string;
  approval_status?: string;
}

const BLOOD_GROUPS = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const APPROVAL_STATUSES: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Rejected', value: 'REJECTED' },
];

const DonorReports: React.FC = () => {
  const navigation = useNavigation();
  const { showAlert } = useAlert();

  // Filter state
  const [bloodGroup, setBloodGroup] = useState('all');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [city, setCity] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('all');
  const [search, setSearch] = useState('');

  // Result state
  const [results, setResults] = useState<DonorReportRow[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (bloodGroup !== 'all') params.append('bloodGroup', bloodGroup);
    if (minAge.trim()) params.append('minAge', minAge.trim());
    if (maxAge.trim()) params.append('maxAge', maxAge.trim());
    if (city.trim()) params.append('city', city.trim());
    if (approvalStatus !== 'all') params.append('approvalStatus', approvalStatus);
    if (search.trim()) params.append('search', search.trim());
    return params.toString();
  };

  const generateReport = useCallback(async () => {
    // Basic sanity check on age range before hitting the server
    if (minAge.trim() && maxAge.trim() && parseInt(minAge, 10) > parseInt(maxAge, 10)) {
      showAlert({
        type: 'warning',
        title: 'Invalid Age Range',
        message: 'Minimum age cannot be greater than maximum age.',
      });
      return;
    }

    try {
      setIsLoading(true);
      const query = buildQueryParams();
      const response = await fetch(`${API_BASE_URL}/admin/donors-report${query ? `?${query}` : ''}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.donors || []);
        setHasGenerated(true);
        console.log(`✅ [Admin] Donor report generated: ${data.donors?.length || 0} result(s)`);
      } else {
        showAlert({ type: 'error', title: 'Error', message: 'Failed to generate report.' });
      }
    } catch (error) {
      console.error('❌ [Admin] Error generating donor report:', error);
      showAlert({ type: 'error', title: 'Error', message: 'Could not reach the server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [bloodGroup, minAge, maxAge, city, approvalStatus, search]);

  const resetFilters = () => {
    setBloodGroup('all');
    setMinAge('');
    setMaxAge('');
    setCity('');
    setApprovalStatus('all');
    setSearch('');
    setResults([]);
    setHasGenerated(false);
  };

  const exportCsv = async () => {
    if (results.length === 0) {
      showAlert({ type: 'warning', title: 'Nothing to Export', message: 'Generate a report first.' });
      return;
    }

    const header = ['Name', 'Email', 'Blood Group', 'Age', 'Mobile', 'City', 'Address', 'Approval Status', 'Account Status'];
    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = results.map((d) =>
      [d.name, d.email, d.blood_group, d.age, d.mobile, d.city, d.address, d.approval_status, d.account_status]
        .map(escape)
        .join(',')
    );
    const csv = [header.map(escape).join(','), ...rows].join('\n');

    try {
      await Share.share({
        title: 'Donor Report',
        message: csv,
      });
    } catch (error) {
      console.error('❌ [Admin] Error exporting report:', error);
    }
  };

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return '—';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getApprovalBadgeStyle = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return { backgroundColor: '#E8F5E9', color: '#4CAF50' };
      case 'REJECTED':
        return { backgroundColor: '#FFEBEE', color: '#F44336' };
      default:
        return { backgroundColor: '#FFF8E1', color: '#FF9800' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Donor Reports</Text>
          <Text style={styles.headerSubtitle}>
            {hasGenerated ? `${results.length} donor${results.length !== 1 ? 's' : ''} found` : 'Filter and generate donor reports'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Panel */}
        <View style={styles.filterCard}>
          <View style={styles.filterCardHeader}>
            <Ionicons name="filter" size={18} color="#DC143C" />
            <Text style={styles.filterCardTitle}>Filters</Text>
          </View>

          {/* Blood Group */}
          <Text style={styles.filterLabel}>Blood Group</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {BLOOD_GROUPS.map((bg) => (
              <TouchableOpacity
                key={bg}
                style={[styles.chip, bloodGroup === bg && styles.chipActive]}
                onPress={() => setBloodGroup(bg)}
              >
                <Text style={[styles.chipText, bloodGroup === bg && styles.chipTextActive]}>
                  {bg === 'all' ? 'All' : bg}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Age Range */}
          <Text style={styles.filterLabel}>Age Range</Text>
          <View style={styles.ageRow}>
            <TextInput
              style={styles.ageInput}
              placeholder="Min age"
              value={minAge}
              onChangeText={(t) => setMinAge(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
            <Text style={styles.ageSeparator}>to</Text>
            <TextInput
              style={styles.ageInput}
              placeholder="Max age"
              value={maxAge}
              onChangeText={(t) => setMaxAge(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
          </View>

          {/* Location */}
          <Text style={styles.filterLabel}>Location (City)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Peshawar"
            value={city}
            onChangeText={setCity}
            placeholderTextColor="#999"
          />

          {/* Approval Status */}
          <Text style={styles.filterLabel}>Approval Status</Text>
          <View style={styles.chipRowWrap}>
            {APPROVAL_STATUSES.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[styles.chip, approvalStatus === s.value && styles.chipActive]}
                onPress={() => setApprovalStatus(s.value)}
              >
                <Text style={[styles.chipText, approvalStatus === s.value && styles.chipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.generateButton} onPress={generateReport} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={18} color="#fff" />
                  <Text style={styles.generateButtonText}>Generate Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Results */}
        {hasGenerated && !isLoading && (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Results ({results.length})
              </Text>
              {results.length > 0 && (
                <TouchableOpacity style={styles.exportButton} onPress={exportCsv}>
                  <Ionicons name="share-outline" size={16} color="#DC143C" />
                  <Text style={styles.exportButtonText}>Export CSV</Text>
                </TouchableOpacity>
              )}
            </View>

            {results.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="water-outline" size={56} color="#ccc" />
                <Text style={styles.emptyTitle}>No donors match these filters</Text>
                <Text style={styles.emptySubtitle}>Try widening your filter criteria</Text>
              </View>
            ) : (
              <View style={styles.donorList}>
                {results.map((donor) => {
                  const badge = getApprovalBadgeStyle(donor.approval_status);
                  return (
                    <View key={donor.id} style={styles.donorCard}>
                      <View style={styles.donorCardHeader}>
                        <View style={styles.bloodGroupBadge}>
                          <Text style={styles.bloodGroupBadgeText}>{donor.blood_group || '—'}</Text>
                        </View>
                        <View style={styles.donorInfo}>
                          <Text style={styles.donorName}>{donor.name}</Text>
                          <Text style={styles.donorEmail}>{donor.email}</Text>
                        </View>
                        <View style={[styles.approvalBadge, { backgroundColor: badge.backgroundColor }]}>
                          <Text style={[styles.approvalBadgeText, { color: badge.color }]}>
                            {donor.approval_status || 'PENDING'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.donorDetailsRow}>
                        <View style={styles.donorDetailItem}>
                          <Ionicons name="calendar-outline" size={14} color="#666" />
                          <Text style={styles.donorDetailText}>{donor.age ? `${donor.age} yrs` : '—'}</Text>
                        </View>
                        <View style={styles.donorDetailItem}>
                          <Ionicons name="location-outline" size={14} color="#666" />
                          <Text style={styles.donorDetailText}>{donor.city || '—'}</Text>
                        </View>
                        <View style={styles.donorDetailItem}>
                          <Ionicons name="call-outline" size={14} color="#666" />
                          <Text style={styles.donorDetailText}>{donor.mobile || '—'}</Text>
                        </View>
                      </View>
                      <Text style={styles.donorJoined}>Joined {formatDate(donor.created_at)}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DC143C" />
            <Text style={styles.loadingText}>Generating report...</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Blood Donation Management System{'\n'}Donor Reports</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#DC143C',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 15, padding: 5 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9, marginTop: 4 },
  scrollView: { flex: 1 },
  contentContainer: { padding: 15 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  filterCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  filterCardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 10 },
  chipRow: { flexDirection: 'row' },
  chipRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 4,
  },
  chipActive: { backgroundColor: '#DC143C', borderColor: '#DC143C' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#fff' },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ageInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  ageSeparator: { fontSize: 13, color: '#999' },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  filterActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  resetButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  generateButton: {
    flex: 1,
    backgroundColor: '#DC143C',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC143C',
  },
  exportButtonText: { fontSize: 13, fontWeight: '600', color: '#DC143C' },
  donorList: { gap: 12 },
  donorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  donorCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  bloodGroupBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bloodGroupBadgeText: { fontSize: 13, fontWeight: '800', color: '#DC143C' },
  donorInfo: { flex: 1 },
  donorName: { fontSize: 15, fontWeight: '700', color: '#333' },
  donorEmail: { fontSize: 12, color: '#666', marginTop: 2 },
  approvalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  approvalBadgeText: { fontSize: 10, fontWeight: '700' },
  donorDetailsRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  donorDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  donorDetailText: { fontSize: 12, color: '#666' },
  donorJoined: { fontSize: 11, color: '#999', marginTop: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 14 },
  emptySubtitle: { fontSize: 13, color: '#666', marginTop: 6 },
  loadingContainer: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666', fontWeight: '600' },
  footer: { paddingVertical: 30, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#999', textAlign: 'center' },
});

export default DonorReports;
