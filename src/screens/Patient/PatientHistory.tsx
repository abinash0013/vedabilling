import {useState, useCallback} from 'react';
import {
  View,
  Text,
  Modal,
  Alert,
  Platform,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {
  updatePatient,
  getFullInvoice,
  getPatientByReg,
  getInvoicesByPatient,
} from '../../database';

import type {Patient, InvoiceSummary} from '../../types';
import BASE from '../../constants/colors';
import ScreenWrapper, {BackButton} from '../../components/ScreenWrapper';
import styles from './styles';

const COLORS = {
  ...BASE,
  textSecondary: '#9AAFAC',
  textMuted: '#B0C4C1',
  border: '#E8F0EF',
  headerSub: 'rgba(255,255,255,0.7)',
};

const STATUS_STYLE: Record<string, {bg: string; text: string}> = {
  Paid: {bg: COLORS.greenLight, text: COLORS.green},
  Unpaid: {bg: COLORS.redLight, text: COLORS.red},
  Partial: {bg: COLORS.violetLight, text: COLORS.violet},
  'Over Paid': {bg: COLORS.cyanLight, text: COLORS.cyan},
  'Advance Paid': {bg: COLORS.skyBlueLight, text: COLORS.skyBlue},
  'Partial Paid': {bg: COLORS.violetLight, text: COLORS.violet},
  Due: {bg: COLORS.orangeLight, text: COLORS.orange},
};

function StatusBadge({status}: {status: string}) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Paid;
  return (
    <View style={[styles.badge, {backgroundColor: s.bg}]}>
      <Text style={[styles.badgeText, {color: s.text}]}>{status}</Text>
    </View>
  );
}

function InvoiceRow({item, isLast, onPress}: any) {
  const isPartial = item.status === 'Partial';
  const due = (item.payable ?? 0) - (item.totalPaid ?? 0);
  const hasPayments = (item.paymentCount ?? 0) > 0;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.invoiceRow, isLast && styles.invoiceRowLast]}>
      <View style={styles.invoiceLeft}>
        <Text style={styles.invoiceId}>{item.invoice}</Text>
        {isPartial && hasPayments && item.payments && (
          <Text style={[styles.invoiceMeta, {color: COLORS.violet}]}>
            {item.payments
              .map(
                (p: {amount: number; method: string}, idx: number) =>
                  `P${idx + 1}: ₹${p.amount.toLocaleString('en-IN')}`,
              )
              .join(' · ')}
          </Text>
        )}
        <Text style={styles.invoiceMeta}>{item.date}</Text>
      </View>
      <View style={styles.invoiceRight}>
        <Text style={styles.invoiceAmount}>{item.amount}</Text>
        {isPartial && due > 0 && (
          <Text style={[styles.invoiceMeta, {color: COLORS.red}]}>
            ₹{due.toLocaleString('en-IN')} due
          </Text>
        )}
        <StatusBadge status={item.status} />
      </View>
    </TouchableOpacity>
  );
}

const parseAmt = (s: string) => Number(s.replace(/[^0-9]/g, ''));

export default function PatientHistory() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const routePatient = route?.params?.patient;
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editReg, setEditReg] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const openEdit = () => {
    if (!patientInfo) return;
    setEditName(patientInfo.name);
    setEditReg(patientInfo.reg);
    setEditPhone(patientInfo.phone);
    setEditAddress(patientInfo.address);
    setEditModal(true);
  };

  const handleEditSave = async () => {
    if (!patientInfo) return;
    const trimmedName = editName.trim();
    const trimmedReg = editReg.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Name is required.');
      return;
    }
    if (!trimmedReg) {
      Alert.alert('Error', 'Patient ID is required.');
      return;
    }
    try {
      await updatePatient(patientInfo.reg, {
        name: trimmedName,
        phone: editPhone.trim(),
        address: editAddress.trim(),
        reg: trimmedReg,
      });
      setEditModal(false);
      navigation.navigate('Tabs', {screen: 'Patients'});
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update patient.');
    }
  };

  const loadData = useCallback(async () => {
    if (!routePatient?.reg) return;
    try {
      const [pat, invList] = await Promise.all([
        getPatientByReg(routePatient.reg),
        getInvoicesByPatient(routePatient.reg),
      ]);
      setPatientInfo(pat);
      setInvoices(invList);
    } catch {}
  }, [routePatient?.reg]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

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

  const displayPatient = patientInfo || routePatient;
  const patientName = displayPatient?.name || 'Unknown';
  const patientReg = displayPatient?.reg || '';

  const totalInvoiceCount = invoices.length;
  const paidAmt =
    invoices
      .filter(
        i =>
          i.status === 'Paid' ||
          i.status === 'Over Paid' ||
          i.status === 'Advance Paid',
      )
      .reduce((s, i) => s + parseAmt(i.amount), 0) +
    invoices
      .filter(i => i.status === 'Partial' || i.status === 'Partial Paid')
      .reduce((s, i) => s + (i.totalPaid ?? 0), 0);
  const dueAmt = invoices
    .filter(
      i =>
        i.status === 'Unpaid' ||
        i.status === 'Due' ||
        i.status === 'Partial Paid' ||
        i.status === 'Partial',
    )
    .reduce((s, i) => {
      if (i.status === 'Partial Paid' || i.status === 'Partial') {
        return s + ((i.payable ?? parseAmt(i.amount)) - (i.totalPaid ?? 0));
      }
      return s + parseAmt(i.amount);
    }, 0);

  return (
    <ScreenWrapper
      title={patientName}
      subtitle={patientReg}
      headerLeft={<BackButton onPress={() => navigation.goBack()} />}
      headerRight={
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.8}
          onPress={openEdit}>
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
      }>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Contact card */}
        {patientInfo && (
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Patient ID</Text>
              <Text style={styles.contactValue}>{patientInfo.reg}</Text>
            </View>
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>
                {patientInfo.phone || '-'}
              </Text>
            </View>
            <View style={[styles.contactRow, styles.contactRowLast]}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>
                {patientInfo.address || '-'}
              </Text>
            </View>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBorder]}>
            <Text style={styles.statValueNeutral}>{totalInvoiceCount}</Text>
            <Text style={styles.statLabel}>INVOICES</Text>
          </View>
          <View style={[styles.statCard, styles.statCardBorder]}>
            <Text style={[styles.statValue, {color: COLORS.green}]}>
              ₹{paidAmt.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statLabel}>PAID</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: COLORS.red}]}>
              ₹{dueAmt.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statLabel}>DUE</Text>
          </View>
        </View>

        {/* Account Payment History */}
        <TouchableOpacity
          style={styles.billingHistoryBtn}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('AccountPaymentHistory', {
              patientReg,
              patientName,
            })
          }>
          <View style={styles.billingHistoryBtnLeft}>
            <Text style={styles.billingHistoryBtnIcon}>₹</Text>
            <Text style={styles.billingHistoryBtnText}>
              View Account Payment History
            </Text>
          </View>
          <Text style={styles.billingHistoryBtnArrow}>›</Text>
        </TouchableOpacity>

        {/* Invoice History */}
        <Text style={styles.sectionTitle}>INVOICE HISTORY</Text>

        <View style={styles.invoiceCard}>
          {invoices.length > 0 ? (
            invoices.map((item, idx) => (
              <InvoiceRow
                key={item.id}
                item={item}
                isLast={idx === invoices.length - 1}
                onPress={() => openInvoice(item)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No invoices yet.</Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          <Text style={styles.footerBold}>Patient History</Text>
          {' — totals and past invoices for one patient.'}
        </Text>
      </ScrollView>
      {/* Edit Patient Modal */}
      <Modal
        visible={editModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Patient</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Patient name"
              placeholderTextColor={COLORS.textSecondary}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Patient ID"
              placeholderTextColor={COLORS.textSecondary}
              value={editReg}
              onChangeText={setEditReg}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Phone number"
              placeholderTextColor={COLORS.textSecondary}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Address"
              placeholderTextColor={COLORS.textSecondary}
              value={editAddress}
              onChangeText={setEditAddress}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleEditSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}
