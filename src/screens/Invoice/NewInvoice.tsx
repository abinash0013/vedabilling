import {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Alert,
  Modal,
  Platform,
  TextInput,
  StatusBar,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';
import {
  insertInvoice,
  getNextInvoiceNo,
  updateInvoicePayment,
  getFullInvoice,
} from './../../database';

import BASE from './../../constants/colors';

const COLORS = {
  ...BASE,
  tealBg: '#EBF4F2',
  inputBg: '#FFFFFF',
  disabledBg: '#F0F5F4',
  headerSub: 'rgba(255,255,255,0.7)',
  stepActive: '#2E7D72',
  stepInactive: '#B0C8C4',
  amberLight: '#FEF3E2',
};

const BILLING_TYPES = ['Per-Visit', 'Weekly', 'Package'];

const SERVICE_TAGS = [
  'Home Rehab',
  'Cupping',
  'Initial Consultation',
  'Online Consultation',
  'Per-Session Visit',
  '10-Visit Package',
  '15-Visit Package',
  '21-Visit Package',
  '30-Visit Package',
  'Consultation Fee',
  'Package Payment',
];

const SERVICE_PRICES: Record<string, string> = {
  Cupping: '500',
  'Other Therapy': '800',
  'Initial Consultation': '500',
  'Online Consultation': '400',
  'Daily / Per-Session Visit': '1300',
  '10-Visit Package': '5000',
  '15-Visit Package': '7000',
  '21-Visit Package': '9000',
  '30-Visit Package': '12000',
  'Home Physiotherapy Rehabilitation': '1500',
  'Home Rehab': '1500',
  'Consultation Fee': '500',
  'Package Payment': '0',
};

const UNIT_TAGS = [
  'Session',
  'Visit',
  'Package',
  'Month',
  'Week',
  'Day',
  'Hour',
];

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'];

const STATUS_OPTIONS = [
  'Due',
  'Paid',
  'Advance Paid',
  'Partial Paid',
  'Over Paid',
];

const formatDateString = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const generateInvoiceNo = async () => {
  const nextNo = await getNextInvoiceNo();
  return nextNo;
};

const parseDate = (str: string): Date | null => {
  const parts = str.split('/');
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
  }
  return null;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

function FieldLabel({label, sub}: any) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {sub ? <Text style={styles.fieldLabelSub}> {sub}</Text> : null}
    </Text>
  );
}

function NativeDatePicker({
  visible,
  currentDate,
  onSelect,
  onClose,
}: {
  visible: boolean;
  currentDate: string;
  onSelect: (d: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(
    () => parseDate(currentDate) || new Date(),
  );

  useEffect(() => {
    if (visible) {
      setValue(parseDate(currentDate) || new Date());
    }
  }, [currentDate, visible]);

  const handleAndroidChange = useCallback(
    (event: any, date?: Date) => {
      if (event?.type === 'set' && date) {
        setValue(date);
        onSelect(formatDateString(date));
      }
      onClose();
    },
    [onSelect, onClose],
  );

  const handleIOSChange = useCallback(
    (event: any, date?: Date) => {
      if (event?.type === 'set' && date) {
        setValue(date);
        onSelect(formatDateString(date));
      }
    },
    [onSelect],
  );

  if (!visible) return null;

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        onChange={handleAndroidChange}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.datePickerModal}>
          <Text style={styles.datePickerTitle}>Select Date</Text>
          <DateTimePicker
            value={value}
            mode="date"
            display="inline"
            onChange={handleIOSChange}
            style={{width: '100%'}}
          />
          <View style={styles.datePickerActions}>
            <TouchableOpacity
              style={styles.datePickerTodayBtn}
              onPress={() => {
                const t = new Date();
                setValue(t);
                onSelect(formatDateString(t));
                onClose();
              }}
              activeOpacity={0.8}>
              <Text style={styles.datePickerTodayText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerDoneBtn}
              onPress={onClose}
              activeOpacity={0.8}>
              <Text style={styles.datePickerDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function NewInvoiceStep2({navigation, route}: any) {
  const paramsPatient = route?.params?.patient;
  const today = new Date();
  const paramsPaymentStatus = route?.params?.paymentStatus || null;
  const paramsDueAmount = route?.params?.dueAmount || null;
  const paramsPaymentCount = route?.params?.paymentCount || 0;
  const paramsExistingInvoiceNo = route?.params?.existingInvoiceNo || null;
  const paramsExistingInvoiceId = route?.params?.existingInvoiceId || null;
  const paramsExistingTotalPaid = route?.params?.existingTotalPaid || 0;
  const paramsExistingPayable = route?.params?.existingPayable || 0;
  const paramsExistingPayments = route?.params?.existingPayments || [];

  const [invoiceNo, setInvoiceNo] = useState(paramsExistingInvoiceNo || '');

  useEffect(() => {
    if (!paramsExistingInvoiceNo) {
      generateInvoiceNo().then(setInvoiceNo);
    }
  }, []);

  useEffect(() => {
    if (paramsExistingInvoiceId) {
      getFullInvoice(paramsExistingInvoiceId).then(inv => {
        if (inv && inv.items && inv.items.length > 0) {
          setItems(
            inv.items.map(it => ({
              name: it.name,
              amount: String(it.unitPrice || 0),
              qty: String(it.qty || 1),
              unit: it.unit || '',
            })),
          );
        }
      });
    }
  }, [paramsExistingInvoiceId]);

  const [invoiceDate, setInvoiceDate] = useState(formatDateString(today));
  const [dueDate, setDueDate] = useState(formatDateString(addDays(today, 7)));
  const [therapist, setTherapist] = useState('Dr. Yash Pratihasta, PT');
  const [selectedPatient, setSelectedPatient] = useState(paramsPatient || null);
  const [billingType, setBillingType] = useState('Per-Visit');
  const [items, setItems] = useState<
    {name: string; amount: string; qty: string; unit: string}[]
  >([
    {
      name: 'Home Rehab',
      amount: String(paramsExistingPayable || 1000),
      qty: '1',
      unit: 'Session',
    },
  ]);
  const [customTag, setCustomTag] = useState('');
  const [discount, setDiscount] = useState('0');
  const [payments, setPayments] = useState([
    {
      amount:
        paramsDueAmount && parseInt(paramsDueAmount) > 0
          ? paramsDueAmount
          : '0',
      method: 'Cash',
      date: formatDateString(today),
    },
  ]);
  const [showMethodPicker, setShowMethodPicker] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(
    paramsPaymentStatus,
  );
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<
    'invoice' | 'due' | {paymentIdx: number} | null
  >(null);

  const totalAmount = items.reduce(
    (s, it) => s + (parseInt(it.amount) || 0) * (parseInt(it.qty) || 1),
    0,
  );
  const payable = Math.max(0, totalAmount - (parseInt(discount) || 0));
  const currentTotalPaid = payments.reduce(
    (s, p) => s + (parseInt(p.amount) || 0),
    0,
  );
  const totalPaid = currentTotalPaid + (paramsExistingTotalPaid || 0);
  const extraPaid = Math.max(0, totalPaid - payable);
  const balanceDue = Math.max(0, payable - totalPaid);

  useEffect(() => {
    if (totalPaid === 0) {
      setPaymentStatus('Due');
    } else if (totalPaid >= payable) {
      setPaymentStatus('Paid');
    } else {
      setPaymentStatus('Partial Paid');
    }
  }, [totalPaid, payable]);

  const getStatus = () => {
    if (totalPaid === 0) return 'Due';
    if (totalPaid >= payable) return 'Over Paid';
    if (billingType === 'Package') return 'Advance';
    if (totalPaid === totalAmount) return 'Paid';
    return 'Partial Paid';
  };

  const effectiveStatus = paymentStatus || getStatus();

  const description = items.map(it => it.name).join(' + ') || '—';

  const buildInvoiceData = () => ({
    id: invoiceNo,
    invoiceNo,
    invoiceDate,
    dueDate,
    therapist,
    billingType,
    patient: selectedPatient || {name: 'New Patient', reg: 'VMCPTREG-0157'},
    items: items.map(it => ({
      name: it.name,
      unitPrice: parseInt(it.amount) || 0,
      qty: parseInt(it.qty) || 1,
      unit: it.unit || '',
    })),
    total: totalAmount,
    discount: parseInt(discount) || 0,
    payable,
    payments: payments.map(p => ({
      amount: parseInt(p.amount) || 0,
      method: p.method,
      date: p.date,
    })),
    totalPaid,
    extraPaid,
    balanceDue,
    status: paymentStatus || getStatus(),
    note,
    createdAt: new Date().toISOString(),
  });

  const saveInvoice = async () => {
    try {
      const data = buildInvoiceData();
      const dir = RNFS.DocumentDirectoryPath + '/invoices';
      const exists = await RNFS.exists(dir);
      if (!exists) await RNFS.mkdir(dir);
      const path = dir + '/' + invoiceNo.replace(/\//g, '-') + '.json';
      await RNFS.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
      if (paramsExistingInvoiceId) {
        const cumTotalPaid = data.totalPaid;
        const cumExtraPaid = Math.max(0, cumTotalPaid - data.payable);
        const cumBalanceDue = Math.max(0, data.payable - cumTotalPaid);
        const cumStatus =
          cumTotalPaid >= data.payable ? 'Paid' : 'Partial Paid';
        await updateInvoicePayment(
          paramsExistingInvoiceId,
          payments.map(p => ({
            amount: parseInt(p.amount) || 0,
            method: p.method,
            date: p.date,
          })),
          cumTotalPaid,
          cumExtraPaid,
          cumBalanceDue,
          cumStatus,
        );
      } else {
        await insertInvoice({
          id: data.id,
          invoiceNo: data.invoiceNo,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          therapist: data.therapist,
          patientReg: data.patient.reg,
          patientName: data.patient.name,
          billingType: data.billingType,
          items: data.items,
          total: data.total,
          discount: data.discount,
          payable: data.payable,
          payments: data.payments,
          totalPaid: data.totalPaid,
          extraPaid: data.extraPaid,
          balanceDue: data.balanceDue,
          status: data.status,
          note: data.note,
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
        });
      }
      setInvoiceNo(await getNextInvoiceNo());
      Alert.alert('Saved', `Invoice saved successfully.`);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to save invoice.');
    }
  };

  const handlePreview = () => {
    const allPayments = [
      ...paramsExistingPayments.map((p: any) => ({
        ...p,
        date: p.date || invoiceDate,
      })),
      ...payments.map(p => ({
        amount: parseInt(p.amount) || 0,
        method: p.method,
        date: p.date,
      })),
    ];
    const latestPayDate = allPayments.reduce(
      (latest: string, p: any) => (p.date && p.date > latest ? p.date : latest),
      '',
    );
    navigation.navigate('PreviewInvoice', {
      note,
      therapist,
      existingInvoiceId: paramsExistingInvoiceId,
      paymentReceiveDate: latestPayDate || invoiceDate,
      patient: selectedPatient || {
        name: 'New Patient',
        reg: 'VMCPTREG-0157',
      },
      billing: {
        invoiceNo,
        date: invoiceDate,
        due: dueDate,
        type: billingType,
        service: description,
        items: items.map(it => ({
          name: it.name,
          unitPrice: parseInt(it.amount) || 0,
          qty: parseInt(it.qty) || 1,
          unit: it.unit || '',
          amount: (parseInt(it.amount) || 0) * (parseInt(it.qty) || 1),
        })),
      },
      amount: {
        total: totalAmount,
        discount: parseInt(discount) || 0,
        payable,
        payments: allPayments,
        totalPaid,
        extraPaid,
        balanceDue,
        status: paymentStatus || getStatus(),
        previousPaid: paramsExistingTotalPaid || 0,
        previousPaymentCount: paramsExistingPayments.length || 0,
      },
    });
  };

  const addItem = (name: string) => {
    const price = SERVICE_PRICES[name] || '0';
    setItems([...items, {name, amount: price, qty: '1', unit: 'Session'}]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, key: string, val: string) => {
    setItems(items.map((it, i) => (i === idx ? {...it, [key]: val} : it)));
  };

  const addCustomItem = () => {
    const t = customTag.trim();
    if (t) {
      setItems([...items, {name: t, amount: '0', qty: '1', unit: 'Session'}]);
      setCustomTag('');
    }
  };

  // const addPayment = () => {
  //   setPayments([
  //     ...payments,
  //     {amount: '', method: 'Cash', date: formatDateString(new Date())},
  //   ]);
  // };

  const removePayment = (idx: number) => {
    setPayments(payments.filter((_, i) => i !== idx));
  };

  const updatePayment = (idx: number, key: string, val: string) => {
    if (key === 'amount') {
      const numVal = parseInt(val) || 0;
      const isOverPaid = paymentStatus === 'Over Paid';
      if (!isOverPaid) {
        const otherTotal = payments.reduce(
          (s, p, i) => s + (i !== idx ? parseInt(p.amount) || 0 : 0),
          0,
        );
        const dueLimit = paramsDueAmount
          ? parseInt(paramsDueAmount) || 0
          : payable;
        const maxAllowed = dueLimit - otherTotal;
        if (numVal > maxAllowed && maxAllowed > 0) {
          Alert.alert(
            'Limit Exceeded',
            `Payment amount cannot exceed the due amount of ₹${maxAllowed.toLocaleString(
              'en-IN',
            )}.`,
          );
          return;
        }
      }
    }
    setPayments(payments.map((p, i) => (i === idx ? {...p, [key]: val} : p)));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Invoice</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          {/* Step indicators */}
          <View style={styles.stepContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleDone]}>
                <Text style={styles.stepCheckMark}>✓</Text>
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelDone]}>
                Patient
              </Text>
            </View>
            <View style={styles.stepConnector}>
              <View
                style={[styles.stepConnectorFill, styles.stepConnectorActive]}
              />
            </View>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={styles.stepNumberActive}>2</Text>
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelActive]}>
                Details
              </Text>
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

          {/* Patient card */}
          <View style={styles.patientCard}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>
                {selectedPatient
                  ? (() => {
                      const p = (selectedPatient.name || '')
                        .trim()
                        .split(/\s+/);
                      return p.length > 1
                        ? (p[0][0] || '') + (p[p.length - 1][0] || '')
                        : p[0]?.[0] || '?';
                    })().toUpperCase()
                  : 'NP'}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>
                {selectedPatient?.name || 'New Patient'}
              </Text>
              <Text style={styles.patientReg}>
                {selectedPatient?.reg || 'VMCPTREG-0157 (assigned)'}
              </Text>
            </View>
            {/* <TouchableOpacity style={styles.changeBtn} activeOpacity={0.8} onPress={() => navigation.navigate('PatientList')}>
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity> */}
          </View>

          {/* Therapist */}
          <View style={styles.fieldWrapper}>
            <FieldLabel label="TREATING PHYSIOTHERAPIST" />
            <TextInput
              style={styles.input}
              value={therapist}
              onChangeText={setTherapist}
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          {/* Invoice Number + Date */}
          <View style={styles.twoCol}>
            <View style={styles.colWide}>
              <FieldLabel label="INVOICE NUMBER" />
              <TextInput
                style={[
                  styles.input,
                  paramsExistingInvoiceNo && styles.disabledInput,
                ]}
                value={invoiceNo}
                onChangeText={setInvoiceNo}
                editable={!paramsExistingInvoiceNo}
                placeholderTextColor={COLORS.placeholder}
              />
            </View>
            <View style={styles.colHalf}>
              <FieldLabel label="INVOICE DATE" />
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker('invoice')}
                activeOpacity={0.8}>
                <Text style={styles.dateText}>{invoiceDate}</Text>
                <Text style={styles.calIcon}>📅</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Billing Type */}
          {!paramsExistingInvoiceNo && (
            <View style={styles.fieldWrapper}>
              <FieldLabel label="BILLING TYPE" />
              <View style={styles.segmented}>
                {BILLING_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.segBtn,
                      billingType === t && styles.segBtnActive,
                    ]}
                    onPress={() => setBillingType(t)}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.segBtnText,
                        billingType === t && styles.segBtnTextActive,
                      ]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {paramsPaymentStatus && !paramsExistingInvoiceNo && (
            <View style={styles.fieldWrapper}>
              <FieldLabel label="PAYMENT TYPE" />
              {effectiveStatus === 'Partial Paid' && (
                <View style={styles.partialBanner}>
                  <Text style={styles.partialBannerText}>Partial Payment</Text>
                </View>
              )}
              {effectiveStatus === 'Due' && (
                <View style={styles.dueBanner}>
                  <Text style={styles.dueBannerText}>Due</Text>
                </View>
              )}
            </View>
          )}

          {/* Due Date */}
          {!paramsExistingInvoiceNo && (
            <View style={styles.fieldWrapper}>
              <FieldLabel label="DUE DATE" sub="(auto-suggested)" />
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker('due')}
                activeOpacity={0.8}>
                <Text style={styles.dateText}>{dueDate}</Text>
                <Text style={styles.calIcon}>📅</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Service Items */}
          {!paramsExistingInvoiceNo && (
            <View style={styles.fieldWrapper}>
              <FieldLabel label="SERVICE ITEMS" />
              {/* Tag cloud as presets */}
              <View style={styles.tagCloud}>
                {SERVICE_TAGS.map(tag => {
                  const alreadyAdded = items.some(it => it.name === tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tag, alreadyAdded && styles.tagAdded]}
                      onPress={() => addItem(tag)}
                      activeOpacity={0.75}>
                      <Text
                        style={[
                          styles.tagText,
                          alreadyAdded && styles.tagTextAdded,
                        ]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom add */}
              <View style={styles.addTagRow}>
                <TextInput
                  style={styles.addTagInput}
                  placeholder="Type custom item name..."
                  placeholderTextColor={COLORS.placeholder}
                  value={customTag}
                  onChangeText={setCustomTag}
                  returnKeyType="done"
                  onSubmitEditing={addCustomItem}
                />
                <TouchableOpacity
                  style={styles.addTagBtn}
                  onPress={addCustomItem}
                  activeOpacity={0.8}>
                  <Text style={styles.addTagBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {/* Item list */}
              {items.map((item, idx) => (
                <View key={idx} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <TextInput
                      style={[styles.input, styles.itemNameInput]}
                      value={item.name}
                      onChangeText={v => updateItem(idx, 'name', v)}
                      placeholderTextColor={COLORS.placeholder}
                    />
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeItem(idx)}
                      activeOpacity={0.8}>
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.itemMetaRow}>
                    <TextInput
                      style={[styles.input, styles.itemQtyInput]}
                      value={item.qty}
                      onChangeText={v => updateItem(idx, 'qty', v)}
                      keyboardType="numeric"
                      placeholder="Qty"
                      placeholderTextColor={COLORS.placeholder}
                    />
                    <TextInput
                      style={[styles.input, styles.itemUnitInput]}
                      value={item.unit}
                      onChangeText={v => updateItem(idx, 'unit', v)}
                      placeholder="Unit"
                      keyboardType="default"
                      placeholderTextColor={COLORS.placeholder}
                    />
                    <View style={styles.itemAmountWrapper}>
                      <TextInput
                        style={[styles.input, styles.itemAmountInput]}
                        value={item.amount}
                        onChangeText={v => updateItem(idx, 'amount', v)}
                        keyboardType="numeric"
                        placeholder="Amount"
                        placeholderTextColor={COLORS.placeholder}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* AMOUNT section */}
          <View style={styles.amountCard}>
            <Text style={styles.amountTitle}>AMOUNT</Text>

            {/* Total (auto) */}
            <View style={styles.fieldWrapper}>
              <FieldLabel label="TOTAL AMOUNT (₹)" />
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={styles.disabledText}>
                  {totalAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Discount */}
            <View style={styles.fieldWrapper}>
              <FieldLabel label="DISCOUNT (₹)" />
              <TextInput
                style={styles.input}
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
                placeholderTextColor={COLORS.placeholder}
              />
            </View>

            {/* Payable */}
            <View style={styles.fieldWrapper}>
              <FieldLabel label="PAYABLE AMOUNT (₹)" />
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={styles.disabledText}>
                  {payable.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Payment Status */}
            <View style={styles.fieldWrapper}>
              <FieldLabel label="PAYMENT STATUS" />
              <TouchableOpacity
                style={styles.methodPicker}
                onPress={() => setShowStatusPicker(!showStatusPicker)}
                activeOpacity={0.8}>
                <Text style={styles.methodText}>
                  {paymentStatus || getStatus()}
                </Text>
                <Text style={styles.chevron}>⌄</Text>
              </TouchableOpacity>
              {showStatusPicker && (
                <View style={styles.dropdown}>
                  {STATUS_OPTIONS.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPaymentStatus(s);
                        setShowStatusPicker(false);
                      }}>
                      <Text style={styles.dropdownItemText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                  {paymentStatus && (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPaymentStatus(null);
                        setShowStatusPicker(false);
                      }}>
                      <Text
                        style={[
                          styles.dropdownItemText,
                          {color: COLORS.textSecondary},
                        ]}>
                        Auto
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Payments received */}
            <FieldLabel label="PAYMENTS RECEIVED" />

            {/* Previous payments */}
            {paramsExistingPayments.length > 0 &&
              paramsExistingPayments.map((p: any, idx: number) => (
                <View key={`prev-${idx}`} style={styles.prevPaymentCard}>
                  <View style={styles.prevPaymentHeader}>
                    <Text style={styles.prevPaymentBadge}>Paid</Text>
                    <Text style={styles.prevPaymentMethod}>{p.method}</Text>
                  </View>
                  <View style={styles.prevPaymentRow}>
                    <Text style={styles.prevPaymentAmount}>
                      ₹{p.amount.toLocaleString('en-IN')}
                    </Text>
                    {p.date ? (
                      <Text style={styles.prevPaymentDate}>{p.date}</Text>
                    ) : null}
                  </View>
                </View>
              ))}

            {/* Current payment */}
            {payments.map((p, idx) => (
              <View key={idx} style={styles.paymentCard}>
                <View style={styles.paymentCardHeader}>
                  <Text style={styles.paymentCardTitle}>Payment</Text>
                  {payments.length > 1 && (
                    <TouchableOpacity
                      style={styles.paymentRemoveBtn}
                      onPress={() => removePayment(idx)}
                      activeOpacity={0.7}>
                      <Text style={styles.paymentRemoveBtnText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.paymentCardRow}>
                  <View style={styles.paymentCardField}>
                    <FieldLabel label="AMOUNT (₹)" />
                    <TextInput
                      style={styles.input}
                      value={p.amount}
                      onChangeText={v => updatePayment(idx, 'amount', v)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={COLORS.placeholder}
                    />
                  </View>
                  <View style={styles.paymentCardField}>
                    <FieldLabel label="METHOD" />
                    <TouchableOpacity
                      style={styles.methodPicker}
                      onPress={() =>
                        setShowMethodPicker(
                          showMethodPicker === idx ? null : idx,
                        )
                      }
                      activeOpacity={0.8}>
                      <Text style={styles.methodText}>{p.method}</Text>
                      <Text style={styles.chevron}>⌄</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.paymentCardField}>
                  <FieldLabel label="RECEIVED DATE" />
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker({paymentIdx: idx})}
                    activeOpacity={0.8}>
                    <Text style={styles.dateText}>
                      {p.date || 'Select date'}
                    </Text>
                    <Text style={styles.calIcon}>📅</Text>
                  </TouchableOpacity>
                </View>

                {showMethodPicker === idx && (
                  <View style={styles.methodDropdown}>
                    {PAYMENT_METHODS.map(m => (
                      <TouchableOpacity
                        key={m}
                        style={styles.methodDropdownItem}
                        onPress={() => {
                          updatePayment(idx, 'method', m);
                          setShowMethodPicker(null);
                        }}>
                        <Text
                          style={[
                            styles.methodDropdownText,
                            p.method === m && styles.methodDropdownTextActive,
                          ]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {/* Add Payment */}
            {/* <TouchableOpacity
              style={styles.addPaymentBtn}
              onPress={addPayment}
              activeOpacity={0.8}>
              <Text style={styles.addPaymentText}>+ Add Payment</Text>
            </TouchableOpacity> */}

            {/* Total Paid + Extra Paid + Balance Due */}
            <View style={styles.twoCol}>
              <View style={styles.colHalf}>
                <FieldLabel label="TOTAL PAID (₹)" />
                <View style={[styles.input, styles.disabledInput]}>
                  <Text style={styles.disabledText}>
                    {totalPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
              <View style={styles.colHalf}>
                <FieldLabel
                  label={
                    billingType === 'Package'
                      ? 'ADVANCE PAID (₹)'
                      : 'EXTRA PAID (₹)'
                  }
                />
                <View style={[styles.input, styles.disabledInput]}>
                  <Text style={styles.disabledText}>
                    {billingType === 'Package'
                      ? totalPaid.toLocaleString('en-IN')
                      : extraPaid.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <FieldLabel label="BALANCE DUE (₹)" />
              <View style={[styles.input, styles.disabledInput]}>
                <Text style={styles.disabledText}>
                  {balanceDue.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Note / Remarks */}
            <TextInput
              style={styles.noteInput}
              placeholder="Enter note or remarks..."
              placeholderTextColor={COLORS.placeholder}
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {/* <TouchableOpacity
              style={styles.draftBtn}
              activeOpacity={0.8}
              onPress={saveInvoice}>
              <Text style={styles.draftBtnText}>Save Draft</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.85}
              onPress={handlePreview}>
              <Text style={styles.shareBtnText}>Preview</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Every field above stays editable later — before or after the bill is
            shared.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      <NativeDatePicker
        visible={showDatePicker !== null}
        currentDate={
          showDatePicker === 'invoice'
            ? invoiceDate
            : showDatePicker === 'due'
            ? dueDate
            : showDatePicker && typeof showDatePicker === 'object'
            ? payments[showDatePicker.paymentIdx]?.date ||
              formatDateString(new Date())
            : formatDateString(new Date())
        }
        onSelect={(d: string) => {
          if (showDatePicker === 'invoice') {
            setInvoiceDate(d);
            const parsed = parseDate(d);
            if (parsed) setDueDate(formatDateString(addDays(parsed, 7)));
          } else if (showDatePicker === 'due') {
            setDueDate(d);
          } else if (showDatePicker && typeof showDatePicker === 'object') {
            const idx = showDatePicker.paymentIdx;
            setPayments(
              payments.map((p, i) => (i === idx ? {...p, date: d} : p)),
            );
          }
        }}
        onClose={() => setShowDatePicker(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.teal},

  // Header
  header: {
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {fontSize: 18, color: '#FFF', lineHeight: 22},
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.headerText,
    letterSpacing: -0.4,
  },

  // Scroll
  scroll: {flex: 1, backgroundColor: COLORS.bg},
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 14,
  },

  // Step indicator
  stepContainer: {
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.stepInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  stepCircleDone: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  stepCircleActive: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  stepCheckMark: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepNumberActive: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.teal,
  },
  stepNumberInactive: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.stepInactive,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.stepInactive,
    letterSpacing: 0.2,
  },
  stepLabelDone: {
    color: COLORS.teal,
  },
  stepLabelActive: {
    color: COLORS.teal,
    fontWeight: '700',
  },
  stepConnector: {
    flex: 1,
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 1.5,
    marginTop: 10,
    marginHorizontal: -4,
    overflow: 'hidden',
  },
  stepConnectorFill: {
    width: '0%',
    height: '100%',
    backgroundColor: COLORS.teal,
    borderRadius: 1.5,
  },
  stepConnectorActive: {
    width: '100%',
  },

  // Patient card
  patientCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {fontSize: 13, fontWeight: '700', color: COLORS.teal},
  patientInfo: {flex: 1},
  patientName: {fontSize: 15, fontWeight: '700', color: COLORS.textPrimary},
  patientReg: {fontSize: 12, color: COLORS.textSecondary},
  partialBanner: {
    backgroundColor: COLORS.violetLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  partialBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.violet,
  },
  dueBanner: {
    backgroundColor: COLORS.orangeLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  dueBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.orange,
  },
  changeBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeBtnText: {fontSize: 13, fontWeight: '700', color: COLORS.teal},

  // Two col
  twoCol: {flexDirection: 'row', gap: 10},
  colWide: {flex: 12, gap: 6},
  colHalf: {flex: 8, gap: 6},

  // Fields
  fieldWrapper: {gap: 8},
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.label,
    letterSpacing: 0.8,
  },
  fieldLabelSub: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },

  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  disabledInput: {
    backgroundColor: COLORS.disabledBg,
    justifyContent: 'center',
  },
  disabledText: {fontSize: 14, color: COLORS.textSecondary},

  // Date input
  dateInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {fontSize: 14, color: COLORS.textPrimary},
  calIcon: {fontSize: 16},

  // Billing type segmented
  segmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.tealBg,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segBtnActive: {backgroundColor: COLORS.teal},
  segBtnText: {fontSize: 13, fontWeight: '600', color: COLORS.teal},
  segBtnTextActive: {color: '#FFF'},

  // Tag cloud
  tagCloud: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  tag: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
  },
  tagAdded: {backgroundColor: COLORS.tealLight, borderColor: COLORS.teal},
  tagText: {fontSize: 13, fontWeight: '600', color: COLORS.textPrimary},
  tagTextAdded: {color: COLORS.teal},

  // Add tag row
  addTagRow: {flexDirection: 'row', gap: 8, marginTop: 4},
  addTagInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  addTagBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagBtnText: {fontSize: 13, fontWeight: '700', color: COLORS.teal},

  // Item card
  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  itemNameInput: {flex: 1},
  itemMetaRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  itemQtyInput: {width: 100, textAlign: 'center'},
  itemUnitInput: {width: 100, textAlign: 'center'},
  itemAmountWrapper: {flex: 1},
  itemAmountInput: {textAlign: 'right'},

  // Remove btn
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.redLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {fontSize: 14, color: COLORS.red, fontWeight: '700'},

  // Amount card
  amountCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  amountTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: 0.8,
    marginBottom: -2,
  },

  // Payment row
  prevPaymentCard: {
    backgroundColor: COLORS.tealBg || '#EBF4F2',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  prevPaymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prevPaymentBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    backgroundColor: COLORS.teal,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  prevPaymentMethod: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  prevPaymentAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  prevPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevPaymentDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  paymentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.teal,
  },
  paymentRemoveBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.redLight,
  },
  paymentRemoveBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.red,
  },
  paymentCardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentCardField: {
    flex: 1,
    gap: 6,
  },
  methodPicker: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
  },
  methodText: {fontSize: 14, color: COLORS.textPrimary, flex: 1},
  chevron: {fontSize: 14, color: COLORS.textSecondary},
  dropdown: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginTop: 6,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  methodDropdown: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  methodDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  methodDropdownText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  methodDropdownTextActive: {
    color: COLORS.teal,
    fontWeight: '700',
  },

  // Add payment
  addPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
  },
  addPaymentText: {fontSize: 14, fontWeight: '700', color: COLORS.teal},

  // Status row
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: COLORS.tealLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusBadgeText: {fontSize: 12, fontWeight: '700', color: COLORS.teal},

  // Note button
  noteBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  noteBtnText: {fontSize: 14, fontWeight: '700', color: COLORS.teal},
  noteInput: {
    marginHorizontal: 0,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteDisplay: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 12,
    fontSize: 13,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.tealLight,
    borderRadius: 10,
    lineHeight: 18,
  },

  // Actions
  actionRow: {flexDirection: 'row', gap: 10},
  draftBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  draftBtnText: {fontSize: 15, fontWeight: '700', color: COLORS.teal},
  shareBtn: {
    flex: 1.4,
    backgroundColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: COLORS.teal,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  shareBtnText: {fontSize: 15, fontWeight: '700', color: '#FFF'},
  generateBtn: {
    backgroundColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  generateBtnText: {fontSize: 16, fontWeight: '800', color: '#FFF'},

  // Footer
  footer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },

  // Date picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    gap: 16,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  datePickerActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  datePickerTodayBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  datePickerTodayText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.teal,
  },
  datePickerDoneBtn: {
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  datePickerDoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
