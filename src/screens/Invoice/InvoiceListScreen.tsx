import {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  ChevronRight,
  FileText,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  LayoutGrid,
} from 'lucide-react-native';
import {getAllInvoices, getFullInvoice} from '../../database';
import type {InvoiceSummary} from '../../types';
import BASE from './../../constants/colors';
import SearchBar from './../../components/SearchBar';
import SkeletonLoader, {SkeletonCard} from './../../components/SkeletonLoader';

const COLORS = {
  ...BASE,
  textMuted: '#9AAFAC',
};

type FilterType = 'all' | 'paid' | 'partial' | 'unpaid' | 'due';

const statusStyles: Record<string, {bg: string; text: string}> = {
  Paid: {bg: COLORS.greenLight, text: COLORS.green},
  Partial: {bg: COLORS.violetLight, text: COLORS.violet},
  Unpaid: {bg: COLORS.redLight, text: COLORS.red},
  'Over Paid': {bg: COLORS.cyanLight, text: COLORS.cyan},
  'Advance Paid': {bg: COLORS.skyBlueLight, text: COLORS.skyBlue},
  'Partial Paid': {bg: COLORS.violetLight, text: COLORS.violet},
  Due: {bg: COLORS.orangeLight, text: COLORS.orange},
};

const accentColors: Record<string, string> = {
  Paid: COLORS.green,
  Partial: COLORS.violet,
  Unpaid: COLORS.red,
  'Over Paid': COLORS.cyan,
  'Advance Paid': COLORS.skyBlue,
  'Partial Paid': COLORS.violet,
  Due: COLORS.orange,
};

const FILTERS: {
  key: FilterType;
  label: string;
  color: string;
}[] = [
  {key: 'all', label: 'All', color: COLORS.teal},
  {key: 'paid', label: 'Paid', color: COLORS.green},
  {key: 'partial', label: 'Partial', color: COLORS.violet},
  {key: 'unpaid', label: 'Unpaid', color: COLORS.red},
  {key: 'due', label: 'Due', color: COLORS.orange},
];

function Avatar({name}: {name: string}) {
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

function InvoiceCard({
  item,
  onPress,
}: {
  item: InvoiceSummary;
  onPress: () => void;
}) {
  const isPartial = item.status === 'Partial';
  const due = (item.payable ?? 0) - (item.totalPaid ?? 0);
  const hasPayments = (item.paymentCount ?? 0) > 0;
  const accent = accentColors[item.status] || COLORS.teal;

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.card} onPress={onPress}>
      <View style={[styles.cardAccent, {backgroundColor: accent}]} />
      <View style={styles.cardBody}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <Avatar name={item.name} />
          <View style={styles.cardInfo}>
            <Text style={styles.invoiceName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.invoiceMeta}>{item.reg}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.cardDivider} />

        {/* Middle row — invoice + amount */}
        <View style={styles.cardMid}>
          <View style={styles.cardChip}>
            <FileText size={13} color={COLORS.teal} strokeWidth={2.5} />
            <Text style={styles.cardChipText}>{item.invoice}</Text>
          </View>
          <Text style={styles.invoiceAmount}>{item.amount}</Text>
        </View>

        {/* Partial payments */}
        {isPartial && hasPayments && item.payments && (
          <Text style={styles.partialPayments}>
            {item.payments
              .map(
                (p: {amount: number; method: string}, idx: number) =>
                  `P${idx + 1}: ₹${p.amount.toLocaleString('en-IN')}`,
              )
              .join(' · ')}
          </Text>
        )}

        <View style={styles.cardDivider} />

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          <View style={styles.cardChip}>
            <IndianRupee
              size={13}
              color={
                item.status === 'Due' || isPartial
                  ? COLORS.orange
                  : COLORS.green
              }
              strokeWidth={2.5}
            />
            <Text
              style={[
                styles.cardChipText,
                {
                  color:
                    item.status === 'Due' || isPartial
                      ? COLORS.orange
                      : COLORS.green,
                },
              ]}>
              {isPartial && due > 0
                ? `₹${due.toLocaleString('en-IN')} due`
                : item.status}
            </Text>
          </View>
          <View style={styles.bottomRight}>
            <Text style={styles.cardDate}>{item.date}</Text>
            <ChevronRight
              size={16}
              color={COLORS.textMuted}
              strokeWidth={2.5}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FilterBar({
  activeFilter,
  onFilterChange,
  getCount,
}: {
  activeFilter: string;
  onFilterChange: (key: FilterType) => void;
  getCount: (key: FilterType) => number;
}) {
  return (
    <View style={styles.filterBar}>
      {FILTERS.map(f => {
        const isActive = activeFilter === f.key;
        const count = getCount(f.key);
        return (
          <TouchableOpacity
            key={f.key}
            activeOpacity={0.7}
            style={styles.filterTab}
            onPress={() => onFilterChange(f.key)}>
            <View
              style={[
                styles.filterPill,
                isActive && styles.filterPillActive,
                {paddingHorizontal: Math.max(12, f.label.length * 3.5)},
              ]}>
              <Text
                style={[
                  styles.filterPillLabel,
                  isActive && styles.filterPillLabelActive,
                ]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.filterPillBadge,
                    {
                      backgroundColor: isActive
                        ? 'rgba(255,255,255,0.3)'
                        : COLORS.tealBg,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.filterPillBadgeText,
                      {color: isActive ? '#FFF' : COLORS.teal},
                    ]}>
                    {count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function InvoiceListScreen() {
  const navigation = useNavigation<any>();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    let list = invoices;

    if (activeFilter === 'paid') {
      list = list.filter(i => i.status === 'Paid');
    } else if (activeFilter === 'partial') {
      list = list.filter(i => i.status === 'Partial');
    } else if (activeFilter === 'unpaid') {
      list = list.filter(i => i.status === 'Unpaid');
    } else if (activeFilter === 'due') {
      list = list.filter(i => i.status === 'Due');
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.invoice.toLowerCase().includes(q) ||
          i.reg.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.date.toLowerCase().includes(q),
      );
    }

    return list;
  }, [invoices, activeFilter, search]);

  const getCount = (filter: FilterType) => {
    if (filter === 'all') return invoices.length;
    if (filter === 'paid')
      return invoices.filter(i => i.status === 'Paid').length;
    if (filter === 'partial')
      return invoices.filter(i => i.status === 'Partial').length;
    if (filter === 'unpaid')
      return invoices.filter(i => i.status === 'Unpaid').length;
    return invoices.filter(i => i.status === 'Due').length;
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
            date: p.date || '',
          })),
          totalPaid: inv.totalPaid,
          extraPaid: inv.extraPaid,
          balanceDue: inv.balanceDue,
          status: inv.status,
        },
        note: inv.note,
        therapist: inv.therapist,
        paymentReceiveDate: inv.paymentReceiveDate || '',
      });
    } catch {
      Alert.alert('Error', 'Failed to load invoice.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <Text style={styles.headerSub}>
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name, invoice, ID, status..."
        style={styles.searchMargin}
      />

      {/* Filter */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        getCount={getCount}
      />

      {/* Result Count */}
      {!loading && (search.trim() || activeFilter) && (
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {filteredInvoices.length} of {invoices.length} result
            {filteredInvoices.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* List */}
      {loading ? (
        <SkeletonLoader count={5} />
      ) : (
        <FlatList
          data={filteredInvoices}
          keyExtractor={(item: InvoiceSummary) => item.id}
          style={styles.flatList}
          contentContainerStyle={[
            styles.list,
            filteredInvoices.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <InvoiceCard item={item} onPress={() => openInvoice(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <FileText size={40} color={COLORS.dashed} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>
                {search.trim() || activeFilter !== 'all'
                  ? 'No matching invoices'
                  : 'No invoices yet'}
              </Text>
              <Text style={styles.emptySub}>
                {search.trim() || activeFilter !== 'all'
                  ? 'Try changing your search or filters'
                  : 'Create your first invoice to get started'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.bg},

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
    color: COLORS.headerText,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.headerSub,
    marginTop: 2,
  },

  // Search
  searchMargin: {
    marginHorizontal: 16,
    marginTop: 12,
  },

  // Filters
  filterBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    gap: 6,
  },
  filterTab: {},
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  filterPillActive: {
    backgroundColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  filterPillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterPillBadge: {
    minWidth: 18,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  filterPillBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // List
  flatList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    // paddingTop: 8,
    paddingBottom: 90,
    gap: 12,
  },
  listEmpty: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.tealBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  resultRow: {
    // paddingHorizontal: 20,
    // paddingTop: 8,
    // paddingBottom: 2,
    paddingHorizontal: 20,
    paddingBottom: 2,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  cardAccent: {
    width: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardBody: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  cardMid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.tealBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  cardChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.teal,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  partialPayments: {
    fontSize: 12,
    color: COLORS.violet,
    fontWeight: '500',
    marginTop: -4,
  },

  // Avatar
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

  // Info
  invoiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  invoiceMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.teal,
  },

  // Badge
  badge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
