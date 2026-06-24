// import React from 'react';
// import { View, Text, SafeAreaView } from 'react-native';
// import Header from '../components/Header';

// export default function BackupScreen() {
//   return (
//     <SafeAreaView className="flex-1 bg-[#F4F5F8]">
//       <Header />
//       <View className="flex-1 items-center justify-center px-6">
//         <Text className="text-2xl font-bold text-[#1D5E58] mb-2">
//           Backup & Restore
//         </Text>
//         <Text className="text-base text-gray-500 text-center">
//           Manage your data backups and restore options.
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// }

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';

const COLORS = {
  teal: '#2E7D72',
  tealDark: '#1F5C56',
  tealLight: '#D6EAE7',
  bg: '#EFF5F4',
  card: '#FFFFFF',
  textPrimary: '#1A2E2B',
  textSecondary: '#7A9490',
  sectionLabel: '#2E7D72',
  border: '#E2EDEB',
  amber: '#A07820',
  amberBtn: '#B8921A',
  amberBtnDark: '#9A7A14',
  amberBg: '#FEF8EC',
  amberBorder: '#D4A82A',
  amberText: '#7A5C10',
  headerSub: 'rgba(255,255,255,0.75)',
};

const BACKUP_HISTORY = [
  {
    name: 'VedaBilling_Backup_20Jun2026.xlsx',
    date: '20 Jun 2026 · 7:42 PM',
    size: '184 KB',
  },
  {
    name: 'VedaBilling_Backup_13Jun2026.xlsx',
    date: '13 Jun 2026 · 8:05 PM',
    size: '171 KB',
  },
  {
    name: 'VedaBilling_Backup_06Jun2026.xlsx',
    date: '06 Jun 2026 · 7:30 PM',
    size: '158 KB',
  },
];

function SectionTitle({title}: any) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function BackupRow({item, isLast}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.backupRow, isLast && styles.backupRowLast]}>
      <View style={styles.backupInfo}>
        <Text style={styles.backupName}>{item.name}</Text>
        <Text style={styles.backupDate}>{item.date}</Text>
      </View>
      <Text style={styles.backupSize}>{item.size}</Text>
    </TouchableOpacity>
  );
}

export default function DataBackupScreen() {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      Alert.alert(
        'Export Complete',
        'VedaBilling_Backup_24Jun2026.xlsx has been saved.',
      );
    }, 1800);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Data & Backup</Text>
        <Text style={styles.headerSub}>Fully offline · manual export</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Local Storage Card */}
        <View style={styles.card}>
          <View style={styles.storageRow}>
            <View style={styles.storageLeft}>
              <Text style={styles.storageTitle}>Local storage</Text>
              <Text style={styles.storageDesc}>
                All invoices & patient data stored on this device
              </Text>
            </View>
            <View style={styles.storageSize}>
              <Text style={styles.storageSizeNum}>3.1</Text>
              <Text style={styles.storageSizeUnit}>MB</Text>
            </View>
          </View>
        </View>

        {/* Export Section */}
        <SectionTitle title="EXPORT" />
        <View style={styles.card}>
          <Text style={styles.exportDesc}>
            Download all invoices and patient records as an Excel file, then
            upload it to Google Drive yourself for an external backup.
          </Text>
          <TouchableOpacity
            style={[styles.exportBtn, exporting && styles.exportBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleExport}
            disabled={exporting}>
            <Text style={styles.exportBtnText}>
              {exporting ? '⏳  Exporting…' : '⬇  Export to Excel (.xlsx)'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.lastExport}>
            Last export: 20 Jun 2026, 7:42 PM
          </Text>
        </View>

        {/* Backup History Section */}
        <SectionTitle title="BACKUP HISTORY" />
        <View style={styles.card}>
          {BACKUP_HISTORY.map((item, idx) => (
            <BackupRow
              key={item.name}
              item={item}
              isLast={idx === BACKUP_HISTORY.length - 1}
            />
          ))}
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerBar} />
          <Text style={styles.infoBannerText}>
            PDF copies of every invoice are also saved locally in folders
            organized by year and month, as a second backup layer.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.teal,
  },

  // Header
  header: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.headerSub,
    marginTop: 3,
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },

  // Section title
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.sectionLabel,
    letterSpacing: 1.1,
    marginTop: 4,
    marginBottom: -2,
  },

  // Local storage
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storageLeft: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  storageDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  storageSize: {
    alignItems: 'center',
  },
  storageSizeNum: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: -1,
    lineHeight: 28,
  },
  storageSizeUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 0.5,
  },

  // Export
  exportDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  exportBtn: {
    backgroundColor: COLORS.amberBtn,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: COLORS.amberBtn,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  exportBtnDisabled: {
    opacity: 0.7,
  },
  exportBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  lastExport: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },

  // Backup history rows
  backupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  backupRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  backupInfo: {
    flex: 1,
  },
  backupName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  backupDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  backupSize: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flexShrink: 0,
  },

  // Info banner
  infoBanner: {
    backgroundColor: COLORS.amberBg,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  infoBannerBar: {
    width: 3,
    borderRadius: 4,
    backgroundColor: COLORS.amberBorder,
    flexShrink: 0,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.amberText,
    lineHeight: 20,
  },
});
