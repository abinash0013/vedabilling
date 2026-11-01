import {useState, useCallback, useMemo} from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  ChevronRight,
  IndianRupee,
  CreditCard,
  Receipt,
} from 'lucide-react-native';
import {getAllPayments} from '../../database';
import type {PaymentReceipt} from '../../types';
import BASE from '../../constants/colors';
import SearchBar from '../../components/SearchBar';
import SkeletonLoader from '../../components/SkeletonLoader';
import ScreenWrapper from '../../components/ScreenWrapper';
import {styles} from './styles';

const COLORS = {
  ...BASE,
  textMuted: '#9AAFAC',
};

const AVATAR_PALETTE = [
  '#2E7D72',
  '#8E44AD',
  '#2980B9',
  '#D35400',
  '#27AE60',
  '#C0392B',
  '#1ABC9C',
  '#A07820',
];

const METHOD_COLORS: Record<string, {bg: string; fg: string}> = {
  Cash: {bg: '#E8F5EC', fg: '#27AE60'},
  UPI: {bg: '#F4ECF7', fg: '#8E44AD'},
  Card: {bg: '#EBF5FB', fg: '#2980B9'},
  Online: {bg: '#E8F8F5', fg: '#1ABC9C'},
  'Net Banking': {bg: '#FEF3E2', fg: '#A07820'},
};

const DEFAULT_METHOD_COLOR = {bg: '#EBF4F2', fg: '#2E7D72'};

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

type FilterType = 'all' | 'settled' | 'pending';

const FILTERS: {key: FilterType; label: string; color: string}[] = [
  {key: 'all', label: 'All', color: '#2E7D72'},
  {key: 'settled', label: 'Settled', color: '#27AE60'},
  {key: 'pending', label: 'Pending', color: '#D35400'},
];

function Avatar({name, size = 44}: {name: string; size?: number}) {
  const parts = (name || '').trim().split(/\s+/);
  const initials =
    parts.length > 1
      ? (parts[0][0] || '') + (parts[parts.length - 1][0] || '')
      : parts[0]?.[0] || '?';
  const bg = AVATAR_PALETTE[hashName(name) % AVATAR_PALETTE.length];
  return (
    <View
      style={[
        styles.avatar,
        {width: size, height: size, borderRadius: size / 2, backgroundColor: bg},
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
  const accent = isPaid ? COLORS.green : COLORS.orange;
  const methodColor = METHOD_COLORS[item.method] || DEFAULT_METHOD_COLOR;
  const pct = Math.min((item.totalPaid / item.payable) * 100, 100);

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
          <View style={styles.topRight}>
            <Text style={[styles.amount, {color: accent}]}>
              ₹{item.amount.toLocaleString('en-IN')}
            </Text>
            <View style={[styles.methodTag, {backgroundColor: methodColor.bg}]}>
              <Text style={[styles.methodTagText, {color: methodColor.fg}]}>
                {item.method}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Middle row — invoice + payment badge */}
        <View style={styles.cardMid}>
          <View style={styles.chipRow}>
            <View style={[styles.cardChip, {backgroundColor: '#EBF4F2'}]}>
              <Receipt size={13} color={COLORS.teal} strokeWidth={2.5} />
              <Text style={[styles.cardChipText, {color: COLORS.teal}]}>
                #{item.invoiceNo}
              </Text>
            </View>
            <View
              style={[
                styles.cardChip,
                {
                  backgroundColor: isPaid
                    ? COLORS.greenLight
                    : COLORS.amberLight,
                },
              ]}>
              <CreditCard
                size={13}
                color={isPaid ? COLORS.green : COLORS.amber}
                strokeWidth={2.5}
              />
              <Text
                style={[
                  styles.cardChipText,
                  {color: isPaid ? COLORS.green : COLORS.amber},
                ]}>
                {item.paymentIndex}/{item.paymentCount}
              </Text>
            </View>
            {item.paymentDate ? (
              <View
                style={[styles.cardChip, {backgroundColor: COLORS.skyBlueLight}]}>
                <Text
                  style={[styles.cardChipText, {color: COLORS.skyBlue}]}>
                  {item.paymentDate}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Progress bar */}
        {!isPaid && (
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${pct}%`,
                  backgroundColor: pct > 60 ? COLORS.green : pct > 30 ? COLORS.amber : COLORS.orange,
                },
              ]}
            />
          </View>
        )}

        <View style={styles.cardDivider} />

        {/* Bottom row */}
        <View style={styles.cardBottom}>
          <View style={styles.bottomLeft}>
            <View
              style={[
                styles.cardChip,
                {backgroundColor: isPaid ? COLORS.greenLight : COLORS.orangeLight},
              ]}>
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
            <Text style={styles.cardDate} numberOfLines={1}>
              {item.invoiceDate}
            </Text>
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

export default function PaymentReceipts() {
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
    <ScreenWrapper
      title="Payment Receipts"
      subtitle={`${payments.length} payment${
        payments.length !== 1 ? 's' : ''
      } · ₹${totalAmount.toLocaleString('en-IN')} total`}
      scrollable={false}>
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
                  {
                    paddingHorizontal: Math.max(12, f.label.length * 3.5),
                    backgroundColor: isActive ? f.color : COLORS.card,
                    shadowColor: isActive ? f.color : '#000',
                    shadowOpacity: isActive ? 0.25 : 0.04,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterPillLabel,
                    {color: isActive ? '#FFF' : COLORS.textSecondary},
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
                          : `${f.color}15`,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.filterPillBadgeText,
                        {color: isActive ? '#FFF' : f.color},
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
    </ScreenWrapper>
  );
}
