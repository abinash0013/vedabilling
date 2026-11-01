import {useState, useCallback} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {getPatientBillingHistory} from '../../database';

import type {PatientBillingHistory} from '../../types';
import BASE from '../../constants/colors';
import ScreenWrapper, {BackButton} from '../../components/ScreenWrapper';

const COLORS = {
  ...BASE,
  textSecondary: '#9AAFAC',
  textMuted: '#B0C4C1',
  border: '#E8F0EF',
  headerSub: 'rgba(255,255,255,0.7)',
};

const s = {
  scroll: {flex: 1, backgroundColor: COLORS.bg},
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: COLORS.sectionLabel,
    letterSpacing: 1.1,
    marginBottom: -2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLast: {borderBottomWidth: 0},
  rowLabel: {fontSize: 14, color: COLORS.textSecondary},
  rowValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500' as const,
    textAlign: 'right' as const,
    flex: 1,
    marginLeft: 16,
  },
  heroRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },
  heroValue: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800' as const,
    color: COLORS.tealDark,
  },
  heroLabel: {fontSize: 12, color: COLORS.textSecondary, marginTop: 2},
  chipRow: {flexDirection: 'row' as const, gap: 8, flexWrap: 'wrap' as const},
  chip: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center' as const,
    minWidth: 56,
  },
  chipNeutral: {backgroundColor: COLORS.inputBg},
  chipGreen: {backgroundColor: COLORS.greenLight},
  chipRed: {backgroundColor: COLORS.redLight},
  chipValue: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: COLORS.textPrimary,
  },
  chipLabel: {fontSize: 10, color: COLORS.textSecondary, marginTop: 1},
  chipValueGreen: {color: COLORS.green},
  chipValueRed: {color: COLORS.red},
  barTrack: {
    flexDirection: 'row' as const,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.inputBg,
    overflow: 'hidden' as const,
    marginBottom: 4,
  },
  barOnTime: {backgroundColor: COLORS.teal},
  barLate: {backgroundColor: COLORS.red},
  listHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  listHeaderText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800' as const,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  listItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  listItemLast: {paddingBottom: 16},
  listTop: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  invoiceNo: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
  },
  pill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillGreen: {backgroundColor: COLORS.greenLight},
  pillRed: {backgroundColor: COLORS.redLight},
  pillText: {fontSize: 10.5, fontWeight: '700' as const},
  pillTextGreen: {color: COLORS.green},
  pillTextRed: {color: COLORS.red},
  listBottom: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginTop: 6,
  },
  listAmount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
  },
  listMeta: {fontSize: 11, color: COLORS.textSecondary},
  listMetaLate: {color: COLORS.red, fontWeight: '700' as const},
  contextItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contextItemLast: {borderBottomWidth: 0},
  contextLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  contextValue: {fontSize: 13, color: COLORS.textSecondary},
  recCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  recHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  recBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.tealBg,
  },
  recBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
    color: COLORS.tealDark,
    textTransform: 'uppercase' as const,
  },
  recText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500' as const,
    lineHeight: 21,
  },
  emptyText: {
    textAlign: 'center' as const,
    color: COLORS.textSecondary,
    paddingVertical: 24,
    fontSize: 14,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingTop: 60,
  },
  loadingText: {fontSize: 14, color: COLORS.textSecondary, marginTop: 12},
};

function StatChip({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: 'neutral' | 'green' | 'red';
}) {
  const bg =
    tone === 'green' ? s.chipGreen : tone === 'red' ? s.chipRed : s.chipNeutral;
  const valueColor =
    tone === 'green'
      ? s.chipValueGreen
      : tone === 'red'
      ? s.chipValueRed
      : null;

  return (
    <View style={[s.chip, bg]}>
      <Text style={[s.chipValue, valueColor]}>{value}</Text>
      <Text style={s.chipLabel}>{label}</Text>
    </View>
  );
}

export default function AccountPaymentHistory() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const patientReg = route?.params?.patientReg || '';
  const patientName = route?.params?.patientName || '';
  const [data, setData] = useState<PatientBillingHistory | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!patientReg) {
        return;
      }
      let cancelled = false;
      getPatientBillingHistory(patientReg).then(d => {
        if (!cancelled) {
          setData(d);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [patientReg]),
  );

  return (
    <ScreenWrapper
      title="Account Payment History"
      subtitle={patientName}
      headerLeft={<BackButton onPress={() => navigation.goBack()} />}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}>
        {!data ? (
          <View style={s.loadingWrap}>
            <Text style={s.loadingText}>Loading billing data…</Text>
          </View>
        ) : (
          <>
            {/* ── 1. BILLING STATUS ── */}
            <Text style={s.sectionTitle}>BILLING STATUS</Text>
            <View style={s.card}>
              <View style={s.row}>
                <Text style={s.rowLabel}>Outstanding Balance</Text>
                <Text style={s.rowValue}>
                  ₹
                  {data.billingStatus.outstandingBalance.toLocaleString(
                    'en-IN',
                  )}
                </Text>
              </View>
              <View style={s.row}>
                <Text style={s.rowLabel}>Overdue Amount</Text>
                <Text
                  style={[
                    s.rowValue,
                    data.billingStatus.overdueAmount > 0 && {color: COLORS.red},
                  ]}>
                  ₹{data.billingStatus.overdueAmount.toLocaleString('en-IN')}
                  {data.billingStatus.daysOverdue > 0
                    ? ` (${data.billingStatus.daysOverdue} days)`
                    : ''}
                </Text>
              </View>
              <View style={s.row}>
                <Text style={s.rowLabel}>Last Payment</Text>
                <Text style={s.rowValue}>
                  {data.billingStatus.lastPaymentAmount > 0
                    ? `₹${data.billingStatus.lastPaymentAmount.toLocaleString(
                        'en-IN',
                      )}`
                    : '—'}
                  {data.billingStatus.lastPaymentDate
                    ? ` on ${data.billingStatus.lastPaymentDate}`
                    : ''}
                </Text>
              </View>
              <View style={[s.row, s.rowLast]}>
                <Text style={s.rowLabel}>Credit Balance</Text>
                <Text
                  style={[
                    s.rowValue,
                    data.billingStatus.creditBalance > 0 && {
                      color: COLORS.cyan,
                    },
                  ]}>
                  {data.billingStatus.creditBalance > 0
                    ? `₹${data.billingStatus.creditBalance.toLocaleString(
                        'en-IN',
                      )}`
                    : '—'}
                </Text>
              </View>
            </View>

            {/* ── 2. PAYMENT HISTORY ── */}
            <Text style={s.sectionTitle}>PAYMENT HISTORY</Text>
            <View style={s.card}>
              {data.paymentHistory.settledCount === 0 ? (
                <Text style={s.emptyText}>No settled invoices on record.</Text>
              ) : (
                <>
                  <View style={s.heroRow}>
                    <View>
                      <Text style={s.heroValue}>
                        {data.paymentHistory.onTimePercent}%
                      </Text>
                      <Text style={s.heroLabel}>paid on time</Text>
                    </View>
                    <View style={s.chipRow}>
                      <StatChip
                        value={data.paymentHistory.settledCount}
                        label="settled"
                        tone="neutral"
                      />
                      <StatChip
                        value={data.paymentHistory.onTimeCount}
                        label="on time"
                        tone="green"
                      />
                      {data.paymentHistory.lateCount > 0 ? (
                        <StatChip
                          value={data.paymentHistory.lateCount}
                          label="late"
                          tone="red"
                        />
                      ) : null}
                    </View>
                  </View>

                  <View style={s.barTrack}>
                    <View
                      style={[
                        s.barOnTime,
                        {flex: Math.max(data.paymentHistory.onTimeCount, 0.01)},
                      ]}
                    />
                    {data.paymentHistory.lateCount > 0 ? (
                      <View
                        style={[
                          s.barLate,
                          {flex: data.paymentHistory.lateCount},
                        ]}
                      />
                    ) : null}
                  </View>

                  <View style={s.listHeader}>
                    <Text style={s.listHeaderText}>SETTLED INVOICES</Text>
                  </View>

                  {data.paymentHistory.recentSettled.map((row, idx, list) => {
                    const isLate = row.daysEarlyOrLate < 0;
                    const timingLabel = isLate
                      ? `${Math.abs(row.daysEarlyOrLate)}d late`
                      : row.daysEarlyOrLate > 0
                      ? `${row.daysEarlyOrLate}d early`
                      : 'On time';
                    return (
                      <View
                        key={row.invoiceNo}
                        style={[
                          s.listItem,
                          idx === list.length - 1 && s.listItemLast,
                        ]}>
                        <View style={s.listTop}>
                          <Text style={s.invoiceNo} numberOfLines={1}>
                            {row.invoiceNo}
                          </Text>
                          <View
                            style={[s.pill, isLate ? s.pillRed : s.pillGreen]}>
                            <Text
                              style={[
                                s.pillText,
                                isLate ? s.pillTextRed : s.pillTextGreen,
                              ]}>
                              {timingLabel}
                            </Text>
                          </View>
                        </View>
                        <View style={s.listBottom}>
                          <Text style={s.listAmount}>
                            ₹{row.amount.toLocaleString('en-IN')}
                          </Text>
                          <Text style={[s.listMeta, isLate && s.listMetaLate]}>
                            {`${row.onTimePercent}% of invoice paid on time`}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
            </View>

            {/* ── 3. BILLING CONTEXT ── */}
            <Text style={s.sectionTitle}>BILLING CONTEXT</Text>
            <View style={s.card}>
              <View style={s.contextItem}>
                <Text style={s.contextLabel}>Write-offs</Text>
                <Text style={s.contextValue}>None on record</Text>
              </View>
              <View style={s.contextItem}>
                <Text style={s.contextLabel}>Credit Balance</Text>
                <Text style={s.contextValue}>
                  {data.billingContext.creditBalance > 0
                    ? `₹${data.billingContext.creditBalance.toLocaleString(
                        'en-IN',
                      )} from overpayment`
                    : 'None'}
                </Text>
              </View>
              <View style={s.contextItem}>
                <Text style={s.contextLabel}>Payment Reversals</Text>
                <Text style={s.contextValue}>None on record</Text>
              </View>
              <View style={[s.contextItem, s.contextItemLast]}>
                <Text style={s.contextLabel}>Active Disputes</Text>
                <Text style={s.contextValue}>None on record</Text>
              </View>
            </View>

            {/* ── 4. BILLING RECOMMENDATION ── */}
            <Text style={s.sectionTitle}>BILLING RECOMMENDATION</Text>
            <View style={s.recCard}>
              <View style={s.recHeader}>
                <View style={s.recBadge}>
                  <Text style={s.recBadgeText}>Recommendation</Text>
                </View>
              </View>
              <Text style={s.recText}>{data.billingRecommendation}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
