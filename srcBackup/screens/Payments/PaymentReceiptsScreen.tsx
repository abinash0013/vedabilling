import {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  ChevronRight,
  IndianRupee,
  CreditCard,
  Receipt,
} from 'lucide-react-native';
import {getAllPayments} from '../../database';
import type {PaymentReceipt} from '../../types';
import BASE from './../../constants/colors';
import SearchBar from './../../components/SearchBar';
import SkeletonLoader from './../../components/SkeletonLoader';

const COLORS = {
  ...BASE,
  textMuted: '#9AAFAC',
};

type FilterType = 'all' | 'settled' | 'pending';

const FILTERS: {key: FilterType; label: string}[] = [
  {key: 'all', label: 'All'},
  {key: 'settled', label: 'Settled'},
  {key: 'pending', label: 'Pending'},
];

function Avatar({name, size = 44}: {name: string; size?: number}) {
  const parts = (name || '').trim().split(/\s+/);
  const initials =
    parts.length > 1
      ? (parts[0][0] || '') + (parts[parts.length - 1][0] || '')
      : parts[0]?.[0] || '?';
  return (
    <View
      style={[
        styles.avatar,
        {width: size, height: size, borderRadius: size / 2},
      ]}>
      <Text style={[styles.avatarText, {fontSize: size * 0.36}]}>
        {initials.toUpperCase()}
      </Text>
    </View>
  );
}

function PaymentCard({
  item,
  onPress,
}: {
  item: PaymentReceipt;
  onPress: () => void;
}) {
  const remaining = item.payable - item.totalPaid;
  const isPaid = remaining <= 0;
  const isLastPayment = item.paymentIndex === item.paymentCount;
  const showPayBtn = !isPaid && isLastPayment;
  const accent = isPaid ? COLORS.green : COLORS.teal;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={showPayBtn ? onPress : undefined}>
      <View style={[styles.cardAccent, {backgroundColor: accent}]} />
      <View style={styles.cardBody}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <Avatar name={item.patientName} />
          <View style={styles.cardInfo}>
            <Text style={styles.patientName} numberOfLines={1}>
              {item.patientName}
            </Text>
            <Text style={styles.patientReg}>{item.patientReg}</Text>
          </View>
          <Text style={[styles.amount, {color: accent}]}>
            ₹{item.amount.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={styles.cardDivider} />

        {/* Middle row — invoice + payment badge */}
        <View style={styles.cardMid}>
          <View style={styles.chipRow}>
            <View style={styles.cardChip}>
              <Receipt size={13} color={COLORS.teal} strokeWidth={2.5} />
              <Text style={styles.cardChipText}>#{item.invoiceNo}</Text>
            </View>
            <View
              style={[
                styles.cardChip,
                {
                  backgroundColor: isPaid
                    ? COLORS.greenLight
                    : COLORS.tealLight,
                },
              ]}>
              <CreditCard
                size={13}
                color={isPaid ? COLORS.green : COLORS.teal}
                strokeWidth={2.5}
              />
              <Text
                style={[
                  styles.cardChipText,
                  {color: isPaid ? COLORS.green : COLORS.teal},
                ]}>
                {item.paymentIndex}/{item.paymentCount}
              </Text>
            </View>
            {item.paymentDate ? (
              <View
                style={[styles.cardChip, {backgroundColor: COLORS.inputBg}]}>
                <Text
                  style={[styles.cardChipText, {color: COLORS.textSecondary}]}>
                  {item.paymentDate}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.methodTag}>
            <Text style={styles.methodTagText}>{item.method}</Text>
          </View>
        </View>

        {/* Progress bar */}
        {!isPaid && (
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(
                    (item.totalPaid / item.payable) * 100,
                    100,
                  )}%`,
                },
              ]}
            />
          </View>
        )}

        <View style={styles.cardDivider} />

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          <View style={styles.bottomLeft}>
            <View style={styles.cardChip}>
              <IndianRupee
                size={13}
                color={isPaid ? COLORS.green : COLORS.orange}
                strokeWidth={2.5}
              />
              <Text
                style={[
                  styles.cardChipText,
                  {color: isPaid ? COLORS.green : COLORS.orange},
                ]}>
                {isPaid
                  ? 'Settled'
                  : `₹${remaining.toLocaleString('en-IN')} due`}
              </Text>
            </View>
          </View>
          <View style={styles.bottomRight}>
            <Text style={styles.cardDate}>{item.invoiceDate}</Text>
            {showPayBtn ? (
              <View style={styles.payBadge}>
                <Text style={styles.payBadgeText}>Pay</Text>
                <ChevronRight size={14} color="#FFF" strokeWidth={3} />
              </View>
            ) : (
              <ChevronRight
                size={16}
                color={COLORS.textMuted}
                strokeWidth={2.5}
              />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PaymentReceiptsScreen() {
  const navigation = useNavigation<any>();
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, []),
  );

  const loadPayments = async () => {
    try {
      const data = await getAllPayments();
      setPayments(data);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    let list = payments;

    if (activeFilter === 'settled') {
      list = list.filter(p => p.payable - p.totalPaid <= 0);
    } else if (activeFilter === 'pending') {
      list = list.filter(p => p.payable - p.totalPaid > 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.patientName.toLowerCase().includes(q) ||
          p.patientReg.toLowerCase().includes(q) ||
          p.invoiceNo.toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q) ||
          p.invoiceDate.toLowerCase().includes(q) ||
          (p.paymentDate || '').toLowerCase().includes(q),
      );
    }

    return list;
  }, [payments, activeFilter, search]);

  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
  const settledCount = payments.filter(
    p => p.payable - p.totalPaid <= 0,
  ).length;
  const pendingCount = payments.length - settledCount;

  const handlePress = (item: PaymentReceipt) => {
    const remaining = item.payable - item.totalPaid;
    if (remaining <= 0) {
      return;
    }
    const previousPayments = payments
      .filter(p => p.invoiceId === item.invoiceId)
      .map(p => ({
        amount: p.amount,
        method: p.method,
        date: p.paymentDate || '',
      }));
    navigation.navigate('NewInvoice', {
      patient: {name: item.patientName, reg: item.patientReg},
      paymentStatus: 'Partial Paid',
      dueAmount: String(remaining),
      paymentCount: item.paymentCount,
      existingInvoiceNo: item.invoiceNo,
      existingInvoiceId: item.invoiceId,
      existingTotalPaid: item.totalPaid,
      existingPayable: item.payable,
      existingPayments: previousPayments,
    });
  };

  const getCount = (filter: FilterType) => {
    if (filter === 'all') return payments.length;
    if (filter === 'settled') return settledCount;
    return pendingCount;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Receipts</Text>
        <Text style={styles.headerSub}>
          {payments.length} payment{payments.length !== 1 ? 's' : ''} · ₹
          {totalAmount.toLocaleString('en-IN')} total
        </Text>
      </View>

      {/* Search */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name, invoice, method..."
        style={styles.searchMargin}
      />

      {/* Filter */}
      <View style={styles.filterBar}>
        {FILTERS.map(f => {
          const isActive = activeFilter === f.key;
          const count = getCount(f.key);
          return (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.7}
              style={styles.filterTab}
              onPress={() => setActiveFilter(f.key)}>
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

      {/* Result Count */}
      {!loading && (search.trim() || activeFilter) && (
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {filteredPayments.length} of {payments.length} result
            {filteredPayments.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* List */}
      {loading ? (
        <SkeletonLoader count={5} />
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => String(item.id)}
          style={styles.flatList}
          contentContainerStyle={[
            styles.list,
            filteredPayments.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <PaymentCard item={item} onPress={() => handlePress(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Receipt size={40} color={COLORS.dashed} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>
                {search.trim() || activeFilter !== 'all'
                  ? 'No matching payments'
                  : 'No payments yet'}
              </Text>
              <Text style={styles.emptySub}>
                {search.trim() || activeFilter !== 'all'
                  ? 'Try changing your search or filters'
                  : 'Payments will appear here once recorded'}
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
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  methodTag: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  methodTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Progress
  progressBarBg: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.teal,
    borderRadius: 3,
  },

  // Avatar
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Info
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  patientReg: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
    flexShrink: 0,
  },

  // Pay badge
  payBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 2,
  },
  payBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
