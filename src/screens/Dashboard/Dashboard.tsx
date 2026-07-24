import {
  View,
  Text,
  Modal,
  Alert,
  Platform,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  PermissionsAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import {useState, useCallback} from 'react';
import {
  Plus,
  X,
  Download,
  ChevronRight,
  FileText,
  IndianRupee,
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import * as XLSX from 'xlsx';

import {getAllInvoices, getAllPatients, insertPatient} from '../../database';
import type {InvoiceSummary, PatientListItem} from '../../types';

import BASE from './../../constants/colors';

const COLORS = {
  ...BASE,
  tealBorder: '#2E7D72',
  plusBtn: 'rgba(255,255,255,0.25)',
  stepNum: '#7A9490',
  hint: '#7A9490',
};

const parseAmt = (s: string) => Number(s.replace(/[^0-9]/g, ''));

const statusStyles: Record<string, {bg: string; text: string}> = {
  Paid: {bg: COLORS.greenLight, text: COLORS.green},
  Partial: {bg: COLORS.violetLight, text: COLORS.violet},
  Unpaid: {bg: COLORS.redLight, text: COLORS.red},
  'Over Paid': {bg: COLORS.cyanLight, text: COLORS.cyan},
  'Advance Paid': {bg: COLORS.skyBlueLight, text: COLORS.skyBlue},
  'Partial Paid': {bg: COLORS.violetLight, text: COLORS.violet},
  Due: {bg: COLORS.orangeLight, text: COLORS.orange},
};

function StatCard({
  label,
  count,
  amount,
  color,
  icon,
  total,
}: {
  label: string;
  count: number;
  amount: string;
  color: string;
  icon: React.ReactNode;
  total: number;
}) {
  const pct = total > 0 ? Math.min((count / total) * 100, 100) : 0;
  return (
    <View style={[styles.statCard, {backgroundColor: color}]}>
      {/* Decorative circles */}
      <View style={[styles.decoCircle1, {backgroundColor: 'rgba(255,255,255,0.12)'}]} />
      <View style={[styles.decoCircle2, {backgroundColor: 'rgba(255,255,255,0.08)'}]} />
      <View style={[styles.decoCircle3, {backgroundColor: 'rgba(255,255,255,0.06)'}]} />

      {/* Icon */}
      <View style={styles.statIconRow}>
        <View style={styles.statIconBg}>
          {icon}
        </View>
        <Text style={styles.statPct}>{Math.round(pct)}%</Text>
      </View>

      {/* Count */}
      <Text style={styles.statBigCount}>{count}</Text>

      {/* Label */}
      <Text style={styles.statWhiteLabel}>{label}</Text>

      {/* Bottom bar */}
      <View style={styles.statBottomRow}>
        <View style={styles.statBarBg}>
          <View style={[styles.statBarFill2, {backgroundColor: '#FFFFFF', width: `${pct}%`}]} />
        </View>
        <Text style={styles.statAmountWhite}>{amount}</Text>
      </View>
    </View>
  );
}

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

function StatusBadge({status}: {status: keyof typeof statusStyles}) {
  const s = statusStyles[status] || statusStyles.Paid;
  return (
    <View style={[styles.badge, {backgroundColor: s.bg}]}>
      <Text style={[styles.badgeText, {color: s.text}]}>{status}</Text>
    </View>
  );
}

const accentColors: Record<string, string> = {
  Paid: COLORS.green,
  Partial: COLORS.violet,
  Unpaid: COLORS.red,
  'Over Paid': COLORS.cyan,
  'Advance Paid': COLORS.skyBlue,
  'Partial Paid': COLORS.violet,
  Due: COLORS.orange,
};

function InvoiceCard({item}: {item: InvoiceSummary}) {
  const isPartial = item.status === 'Partial';
  const hasPayments = (item.paymentCount ?? 0) > 0;
  const accent = accentColors[item.status] || COLORS.teal;
  return (
    <View style={styles.invoiceCard}>
      <View style={[styles.invoiceAccent, {backgroundColor: accent}]} />
      <View style={styles.invoiceBody}>
        <View style={styles.invoiceTop}>
          <Avatar name={item.name} />
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.invoiceMeta}>
              {item.invoice} · {item.date}
            </Text>
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
          </View>
          <View style={styles.invoiceRight}>
            <Text style={styles.invoiceAmount}>{item.amount}</Text>
            <StatusBadge status={item.status as keyof typeof statusStyles} />
          </View>
        </View>
      </View>
    </View>
  );
}

function PatientRow({item, isLast, onSelect}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.patientRow, isLast && styles.patientRowLast]}
      onPress={() => onSelect(item)}>
      <Avatar name={item.name} />
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientMeta}>
          {item.reg} · Last visit {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Dashboard() {
  const navigation = useNavigation<any>();
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [query, setQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newRegNumber, setNewRegNumber] = useState('');
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [patients, setPatients] = useState<PatientListItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [invList, patList] = await Promise.all([
        getAllInvoices(),
        getAllPatients(),
      ]);
      setInvoices(invList);
      setPatients(patList);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const paidTotal =
    invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + parseAmt(i.amount), 0) +
    invoices
      .filter(i => i.status === 'Partial')
      .reduce((sum, i) => sum + (i.totalPaid ?? 0), 0);
  const partialTotal = invoices
    .filter(i => i.status === 'Partial')
    .reduce(
      (sum, i) =>
        sum + ((i.payable ?? parseAmt(i.amount)) - (i.totalPaid ?? 0)),
      0,
    );
  const unpaidTotal = invoices
    .filter(i => i.status === 'Unpaid')
    .reduce((sum, i) => sum + parseAmt(i.amount), 0);

  const stats = [
    {
      label: 'PAID',
      count: invoices.filter(i => i.status === 'Paid' || i.status === 'Partial')
        .length,
      amount: `₹${paidTotal.toLocaleString('en-IN')}`,
      color: '#4DB6A4',
      icon: <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.5} />,
    },
    {
      label: 'PARTIAL',
      count: invoices.filter(i => i.status === 'Partial').length,
      amount: `₹${partialTotal.toLocaleString('en-IN')}`,
      color: '#7BA4C7',
      icon: <AlertCircle size={18} color="#FFFFFF" strokeWidth={2.5} />,
    },
    {
      label: 'UNPAID',
      count: invoices.filter(i => i.status === 'Unpaid').length,
      amount: `₹${unpaidTotal.toLocaleString('en-IN')}`,
      color: '#D48B7A',
      icon: <XCircle size={18} color="#FFFFFF" strokeWidth={2.5} />,
    },
  ];

  const filtered = patients.filter(
    p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.reg.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelectPatient = (patient: PatientListItem) => {
    navigation.navigate('NewInvoice', {patient});
    setInvoiceModal(false);
  };

  const handleUseNewPatient = async () => {
    if (!newName.trim()) {
      Alert.alert('Required', "Please enter the patient's full name.");
      return;
    }
    const phoneDigits = newPhone.replace(/\D/g, '');
    if (newPhone.trim() && phoneDigits.length !== 10) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits.');
      return;
    }
    try {
      const reg = newRegNumber.trim()
        ? `VMCPTREG-${newRegNumber.trim()}`
        : undefined;
      const saved = await insertPatient({
        name: newName.trim(),
        phone: newPhone.trim(),
        address: newAddress,
        reg,
      });
      await loadData();
      navigation.navigate('NewInvoice', {patient: saved});
      setInvoiceModal(false);
      setNewName('');
      setNewPhone('');
      setNewAddress('');
      setNewRegNumber('');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create patient.');
    }
  };

  const handleExport = async () => {
    if (Platform.OS === 'android' && (Platform.Version as number) < 29) {
      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'VedaBill needs storage access to export invoices.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Storage permission is required to export invoices.',
          );
          return;
        }
      } catch {
        return;
      }
    }
    const rows = invoices.map(i => ({
      Name: i.name,
      'Patient ID': i.reg,
      Date: i.date,
      'Invoice ID': i.invoice,
      'Total Amount': i.payable || 0,
      'Received Amount': i.totalPaid || 0,
      'Due Amount': (i.payable || 0) - (i.totalPaid || 0),
      'Payment Status': i.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    const wbOut = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const fyStart = currentMonth >= 4 ? currentYear : currentYear - 1;
    const fyEnd = fyStart + 1;
    const fy = `${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`;
    const fileName = `Invoice_VMC_${fy}_${dd}_${mm}_${hh}${min}${ss}.xlsx`;
    try {
      const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      await RNFS.writeFile(destPath, wbOut, 'base64');
      try {
        await RNFS.scanFile(destPath);
      } catch {}
      Alert.alert(
        'Exported',
        `Excel file saved to ${
          Platform.OS === 'android' ? 'Downloads' : 'Documents'
        } as ${fileName}.`,
      );
    } catch (error: any) {
      try {
        const fallbackPath = `${RNFS.ExternalDirectoryPath}/${fileName}`;
        await RNFS.writeFile(fallbackPath, wbOut, 'base64');
        await Share.open({
          urls: [`file://${fallbackPath}`],
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          failOnCancel: false,
        });
        Alert.alert(
          'Exported',
          'Excel file saved. Use Save to Files from the share sheet to store it in Downloads.',
        );
      } catch (shareError: any) {
        if (shareError?.message !== 'User did not share') {
          Alert.alert('Error', shareError?.message || 'Failed to export.');
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Good evening, Dr. Yash</Text>
          <Text style={styles.headerSub}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}>
          {stats.map(s => (
            <StatCard
              key={s.label}
              label={s.label}
              count={s.count}
              amount={s.amount}
              color={s.color}
              icon={s.icon}
              total={invoices.length}
            />
          ))}
        </ScrollView>

        {/* Recent Invoices */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT INVOICES</Text>
          <View style={styles.sectionActions}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setInvoiceModal(true)}>
              <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addBtnText}>Add Invoice</Text>
            </TouchableOpacity>
            {invoices.length > 0 && (
              <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
                <Download size={14} color={COLORS.teal} strokeWidth={2.5} />
                <Text style={styles.exportBtnText}>Export</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.invoiceListContainer}>
          {invoices.slice(0, 5).map((item, idx) => (
            <InvoiceCard key={item.invoice} item={item} />
          ))}
          {invoices.length > 5 && (
            <TouchableOpacity onPress={() => navigation.navigate('Invoices')}>
              <Text style={styles.viewAll}>View all invoices...</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* New Invoice Modal */}
      <Modal
        visible={invoiceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setInvoiceModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Invoice</Text>
              <TouchableOpacity onPress={() => setInvoiceModal(false)}>
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* Step indicator */}
              <View style={styles.stepIndicator}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, styles.stepCircleActive]}>
                    <Text style={styles.stepNumberActive}>1</Text>
                  </View>
                  <Text style={[styles.stepLabel, styles.stepLabelActive]}>
                    Patient
                  </Text>
                </View>
                <View style={styles.stepConnector}>
                  <View style={styles.stepConnectorFill} />
                </View>
                <View style={styles.stepItem}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepNumberInactive}>2</Text>
                  </View>
                  <Text style={styles.stepLabel}>Details</Text>
                </View>
                <View style={styles.stepConnector}>
                  <View style={styles.stepConnectorFill} />
                </View>
                <View style={styles.stepItem}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepNumberInactive}>3</Text>
                  </View>
                  <Text style={styles.stepLabel}>Preview</Text>
                </View>
              </View>

              {/* Search */}
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or patient ID..."
                placeholderTextColor={COLORS.placeholder}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />

              {/* Select Existing Patient Section */}
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[styles.sectionDot, {backgroundColor: COLORS.teal}]}
                />
                <Text style={styles.sectionHeading}>
                  SELECT EXISTING PATIENT
                </Text>
              </View>

              <View style={styles.listCard}>
                {filtered.length > 0 ? (
                  filtered.map((item, idx) => (
                    <PatientRow
                      key={item.reg}
                      item={item}
                      isLast={idx === filtered.length - 1}
                      onSelect={handleSelectPatient}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    No patients match your search.
                  </Text>
                )}
              </View>

              {/* OR Divider */}
              <View style={styles.orDivider}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              {/* Add New Patient Section */}
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[styles.sectionDot, {backgroundColor: COLORS.orange}]}
                />
                <Text style={[styles.sectionHeading, {color: COLORS.orange}]}>
                  ADD NEW PATIENT
                </Text>
              </View>

              <View style={styles.newPatientCard}>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>FULL NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Veda Motion Care"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>PATIENT ID (OPTIONAL)</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: COLORS.textSecondary,
                      }}>
                      VMCPTREG-
                    </Text>
                    <TextInput
                      style={[styles.input, {flex: 1}]}
                      value={newRegNumber}
                      onChangeText={setNewRegNumber}
                      keyboardType="number-pad"
                      placeholder="####"
                      placeholderTextColor={COLORS.placeholder}
                    />
                  </View>
                </View>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>PHONE (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    value={newPhone}
                    onChangeText={setNewPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholder="1234567890"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={[styles.fieldWrapper, styles.fieldLast]}>
                  <Text style={styles.fieldLabel}>ADDRESS (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    value={newAddress}
                    onChangeText={setNewAddress}
                    placeholder="For Insurance Documentation"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
              </View>

              {/* Use This New Patient button */}
              <TouchableOpacity
                style={styles.useBtn}
                activeOpacity={0.85}
                onPress={handleUseNewPatient}>
                <UserPlus size={18} color={COLORS.bg} strokeWidth={2.5} />
                <Text style={styles.useBtnText}>Create & Continue</Text>
              </TouchableOpacity>

              <View style={{height: 20}} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 90,
  },

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

  // Stats
  statsRow: {
    gap: 12,
    marginBottom: 28,
    paddingRight: 16,
  },
  statCard: {
    width: 185,
    borderRadius: 22,
    padding: 14,
    paddingHorizontal: 16,
    overflow: 'hidden',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 6,
  },
  decoCircle1: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 38,
    top: -16,
    right: -16,
  },
  decoCircle2: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    bottom: -8,
    left: -12,
  },
  decoCircle3: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    top: 28,
    right: 36,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statPct: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  statBigCount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 28,
  },
  statWhiteLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  statBottomRow: {
    marginTop: 2,
    gap: 4,
  },
  statBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  statBarFill2: {
    height: '100%',
    borderRadius: 2,
  },
  statAmountWhite: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  // Section title
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 1.2,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.teal,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.teal,
  },

  // Invoice card container
  invoiceListContainer: {
    gap: 12,
  },

  // Individual invoice card
  invoiceCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  invoiceAccent: {
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  invoiceBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  invoiceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  invoiceInfo: {
    flex: 1,
    gap: 2,
  },
  invoiceRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  invoiceMid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  invoiceBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  invoiceBottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invoiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.tealBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  invoiceChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.teal,
  },
  invoiceDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  partialPayments: {
    fontSize: 12,
    color: COLORS.violet,
    fontWeight: '500',
    marginTop: -4,
  },
  viewAll: {
    textAlign: 'center',
    color: COLORS.teal,
    paddingVertical: 12,
    fontWeight: '600',
    fontSize: 13,
  },

  invoiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  invoiceMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: -0.3,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalBody: {
    flexGrow: 0,
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    width: 64,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  stepNumberActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepNumberInactive: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginTop: 11,
    marginHorizontal: -4,
    borderRadius: 1,
  },
  stepConnectorFill: {
    flex: 1,
    borderRadius: 1,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  stepLabelActive: {
    color: COLORS.teal,
    fontWeight: '700',
  },

  // Section headers in modal
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: 0.8,
  },

  // OR divider
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 18,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },

  // Search
  searchInput: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },

  // Patient list
  listCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  patientRowLast: {
    borderBottomWidth: 0,
  },
  patientInfo: {
    flex: 1,
    gap: 3,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  patientMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingVertical: 20,
    fontSize: 13,
  },

  // New patient card
  newPatientCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLast: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.label,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  // Use button
  useBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 14,
    shadowColor: COLORS.teal,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  useBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  // Badge
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
