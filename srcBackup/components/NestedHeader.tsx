import {ArrowLeft} from 'lucide-react-native';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#F5F0EA', // warm off-white page background
  white: '#FFFFFF',
  headerText: '#7D4D00', // golden brown — "Clinical Report" title
  headerBack: '#7D4D00', // back arrow
  borderCard: '#E5DDD3', // card borders
  activeBadge: '#D6EFE5', // "Active Case" pill bg
  activeBadgeTxt: '#1D6A4A', // "Active Case" pill text
  previewLabel: '#C07A1A', // "PROGRESS PREVIEW" label (amber)
  patientName: '#1C1512', // large patient name
  patientId: '#6B5E54', // ID: VMC-0042
  chipBorder: '#DDD5C8',
  chipLabel: '#7A6D63',
  chipValue: '#1C1512',
  improvedBg: '#FDF6EC', // warm cream — What Improved
  improvedBorder: '#EFD9B4',
  improvedIcon: '#C07A1A',
  improvedTitle: '#1C1512',
  improvedText: '#3D3028',
  statusBg: '#EEF4F8', // light blue — Current Status
  statusBorder: '#C8DCE8',
  statusIcon: '#2B6A8A',
  statusTitle: '#1C1512',
  statusDot: '#2B9348', // green dot
  statusBold: '#1C1512',
  statusText: '#3D3028',
  nextPlanBg: '#EEF4F8',
  nextPlanBorder: '#C8DCE8',
  nextPlanIcon: '#2B6A8A',
  nextPlanTitle: '#1C1512',
  planItemBg: '#E0EBF2',
  planItemText: '#1C1512',
  planCheck: '#2B6A8A',
  doctorBorder: '#E5DDD3',
  doctorIconBg: '#E0EBF2',
  doctorIconColor: '#2B6A8A',
  doctorName: '#1C1512',
  doctorReg: '#6B5E54',
  doctorRole: '#C07A1A',
  dlBtn: '#FFFFFF',
  dlBtnBorder: '#D9CABB',
  dlBtnText: '#1C1512',
  sendBtn: '#4A3000', // dark brown — Send to Patient
  sendBtnText: '#FFFFFF',
  footerBorder: '#E5DDD3',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  screenHeading?: string;
}

export default function NestedHeader({screenHeading}: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation?.goBack()}
        activeOpacity={0.7}
        style={styles.backBtn}>
        <ArrowLeft size={22} color={C.headerBack} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{screenHeading}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.bg,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: C.headerText,
    letterSpacing: 0.2,
  },
});
