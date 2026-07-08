import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {getAllInvoices, getFullInvoice} from '../database';
import type {InvoiceSummary} from '../types';
import BASE from '../constants/colors';

const COLORS = BASE;

const STATUS_COLORS: Record<string, string> = {
  'Advance Paid': '#2E7D72',
  Paid: '#2ECC71',
  Partial: '#F39C12',
  Unpaid: '#E74C3C',
  Overpaid: '#9B59B6',
};

function InvoiceRow({
  item,
  isLast,
  onPress,
}: {
  item: InvoiceSummary;
  isLast: boolean;
  onPress: () => void;
}) {
  const statusColor = STATUS_COLORS[item.status] || '#7A9490';
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.row, isLast && styles.rowLast]}
      onPress={onPress}>
      <View style={styles.rowInfo}>
        <Text style={styles.invoiceNo}>{item.invoice}</Text>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.date} · {item.amount}
        </Text>
      </View>
      <View style={[styles.badge, {backgroundColor: statusColor}]}>
        <Text style={styles.badgeText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function InvoiceListScreen() {
  const navigation = useNavigation<any>();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, []),
  );

  const loadInvoices = async () => {
    try {
      const data = await getAllInvoices();
      setInvoices(data);
    } catch {
      setInvoices([]);
    }
  };

  const openInvoice = async (item: InvoiceSummary) => {
    try {
      const inv = await getFullInvoice(item.id);
      if (!inv) {
        Alert.alert('Error', 'Invoice data not found.');
        return;
      }
      navigation.navigate('EBillGenerated', {
        pdfPath: inv.pdfPath || '',
        patient: {name: inv.patientName, reg: inv.patientReg},
        billing: {
          invoiceNo: inv.invoiceNo,
          date: inv.invoiceDate,
          due: inv.dueDate,
          type: inv.billingType,
          service: inv.items.map(i => i.name).join(' + ') || '—',
          items: inv.items.map(i => ({
            name: i.name,
            unitPrice: i.unitPrice,
            qty: i.qty,
            unit: i.unit || '',
            amount: i.unitPrice * i.qty,
          })),
        },
        amount: {
          total: inv.total,
          discount: inv.discount,
          payable: inv.payable,
          payments: inv.payments.map(p => ({
            amount: p.amount,
            method: p.method,
          })),
          totalPaid: inv.totalPaid,
          extraPaid: inv.extraPaid,
          balanceDue: inv.balanceDue,
          status: inv.status,
        },
        note: inv.note,
        therapist: inv.therapist,
      });
    } catch {
      Alert.alert('Error', 'Failed to load invoice.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <Text style={styles.headerSub}>{invoices.length} total</Text>
      </View>
      <FlatList
        data={invoices}
        keyExtractor={(item: InvoiceSummary) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item, index}) => (
          <InvoiceRow
            item={item}
            isLast={index === invoices.length - 1}
            onPress={() => openInvoice(item)}
          />
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
    backgroundColor: COLORS.teal,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.headerText,
    letterSpacing: -0.5,
  },
  headerSub: {fontSize: 14, color: COLORS.headerSub, marginTop: 3},
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  invoiceNo: {fontSize: 15, fontWeight: '700', color: COLORS.teal},
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
