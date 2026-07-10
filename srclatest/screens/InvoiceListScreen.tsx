import {useState, useCallback} from 'react';
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

const COLORS = {
  ...BASE,
  tealBorder: '#2E7D72',
  textMuted: '#9AAFAC',
};

const statusStyles: Record<string, {bg: string; text: string}> = {
  Paid: {bg: COLORS.greenLight, text: COLORS.green},
  Partial: {bg: COLORS.violetLight, text: COLORS.violet},
  Unpaid: {bg: COLORS.redLight, text: COLORS.red},
  'Over Paid': {bg: COLORS.cyanLight, text: COLORS.cyan},
  'Advance Paid': {bg: COLORS.skyBlueLight, text: COLORS.skyBlue},
  'Partial Paid': {bg: COLORS.violetLight, text: COLORS.violet},
  Due: {bg: COLORS.orangeLight, text: COLORS.orange},
};

function Avatar({name}: any) {
  const parts = (name || '').trim().split(/\s+/);
  const initials =
    parts.length > 1
      ? (parts[0][0] || '') + (parts[parts.length - 1][0] || '')
      : parts[0]?.[0] || '?';
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
    </View>
  );
}

function StatusBadge({status}: {status: string}) {
  const s = statusStyles[status] || statusStyles.Paid;
  return (
    <View style={[styles.badge, {backgroundColor: s.bg}]}>
      <Text style={[styles.badgeText, {color: s.text}]}>{status}</Text>
    </View>
  );
}

function InvoiceRow({item, isLast, onPress}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.invoiceRow, isLast && styles.invoiceRowLast]}
      onPress={onPress}>
      <View style={styles.invoiceRowInner}>
        <Avatar name={item.name} />
        <View style={styles.invRowLeft}>
          <Text style={styles.invoiceName}>{item.name}</Text>
          <Text style={styles.invoiceMeta}>{item.reg}</Text>
          <Text style={styles.invoiceMeta}>{item.invoice}</Text>
        </View>
        <View style={styles.invRowRight}>
          <Text style={styles.invoiceAmount}>{item.amount}</Text>
          <Text style={[styles.invoiceMeta, {textAlign: 'right'}]}>
            {item.date}
          </Text>
          <StatusBadge status={item.status} />
        </View>
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
        showBack: true,
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
    gap: 10,
  },
  invoiceRow: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  invoiceRowLast: {},
  invoiceRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  invRowLeft: {
    flex: 1,
    gap: 4,
  },
  invoiceName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  invoiceMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  invRowRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  invoiceAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.teal,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {fontSize: 16, color: COLORS.textSecondary},
});
