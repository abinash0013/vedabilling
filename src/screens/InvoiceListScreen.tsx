import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  teal: '#2E7D72',
  tealLight: '#D6EAE7',
  bg: '#EFF5F4',
  card: '#FFFFFF',
  textPrimary: '#1A2E2B',
  textSecondary: '#7A9490',
  border: '#E2EDEB',
};

const STATUS_COLORS: Record<string, string> = {
  'Advance Paid': '#2E7D72',
  Paid: '#2ECC71',
  Partial: '#F39C12',
  Unpaid: '#E74C3C',
  Overpaid: '#9B59B6',
};

function InvoiceRow({item, isLast}: any) {
  const statusColor = STATUS_COLORS[item.status] || '#7A9490';
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowInfo}>
        <Text style={styles.invoiceNo}>{item.invoiceNo}</Text>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.meta}>
          {item.date} · ₹{item.payable?.toLocaleString('en-IN')}
        </Text>
      </View>
      <View style={[styles.badge, {backgroundColor: statusColor}]}>
        <Text style={styles.badgeText}>{item.status}</Text>
      </View>
    </View>
  );
}

export default function InvoiceListScreen() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, []),
  );

  const loadInvoices = async () => {
    try {
      const raw = await AsyncStorage.getItem('invoices');
      if (raw) {
        setInvoices(JSON.parse(raw));
      }
    } catch {
      setInvoices([]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <Text style={styles.headerSub}>{invoices.length} total</Text>
      </View>
      <FlatList
        data={invoices}
        keyExtractor={(_: any, i: number) => String(i)}
        contentContainerStyle={styles.list}
        renderItem={({item, index}) => (
          <InvoiceRow item={item} isLast={index === invoices.length - 1} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No invoices yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.bg},
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {fontSize: 14, color: COLORS.textSecondary, marginTop: 2},
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 1,
  },
  row: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  rowLast: {},
  rowInfo: {flex: 1},
  invoiceNo: {fontSize: 15, fontWeight: '700', color: COLORS.textPrimary},
  patientName: {fontSize: 13, color: COLORS.textSecondary, marginTop: 2},
  meta: {fontSize: 12, color: COLORS.textSecondary, marginTop: 2},
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {fontSize: 11, fontWeight: '700', color: '#FFF'},
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {fontSize: 16, color: COLORS.textSecondary},
});
