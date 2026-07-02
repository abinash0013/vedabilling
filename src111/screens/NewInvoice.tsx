import {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';

const COLORS = {
  teal: '#2E7D72',
  tealDark: '#1F5C56',
  tealLight: '#D6EAE7',
  tealBg: '#EBF4F2',
  bg: '#EFF5F4',
  card: '#FFFFFF',
  textPrimary: '#1A2E2B',
  textSecondary: '#7A9490',
  label: '#5A8A84',
  sectionLabel: '#2E7D72',
  border: '#E2EDEB',
  inputBg: '#FFFFFF',
  disabledBg: '#F0F5F4',
  placeholder: '#AABFBC',
  red: '#C0392B',
  redLight: '#FDECEB',
  headerText: '#FFFFFF',
  headerSub: 'rgba(255,255,255,0.7)',
  stepActive: '#2E7D72',
  stepInactive: '#B0C8C4',
  green: '#27AE60',
  greenLight: '#E8F5EC',
  amber: '#E67E22',
  amberLight: '#FEF3E2',
};

const BILLING_TYPES = ['Per-Visit', 'Weekly', 'Package'];

const SERVICE_TAGS = [
  'Cupping',
  'Other Therapy',
  'Initial Consultation',
  'Online Consultation',
  'Daily / Per-Session Visit',
  '10-Visit Package',
  '15-Visit Package',
  '21-Visit Package',
  '30-Visit Package',
  'Home Physiotherapy Rehabilitation',
  'Home Rehab',
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

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'];

const STATUS_OPTIONS = ['Paid', 'Partial', 'Pending'];

const formatDateString = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const generateInvoiceNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const fyStart = month >= 4 ? year : year - 1;
  const fy = String(fyStart).slice(-2);
  const fyEnd = String(fyStart + 1).slice(-2);
  return `VMC/INV/${fy}-${fyEnd}/0001`;
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

function DatePickerModal({visible, currentDate, onSelect, onClose}: any) {
  const parsed = parseDate(currentDate) || new Date();
  const [day, setDay] = useState(String(parsed.getDate()).padStart(2, '0'));
  const [month, setMonth] = useState(
    String(parsed.getMonth() + 1).padStart(2, '0'),
  );
  const [year, setYear] = useState(String(parsed.getFullYear()));

  useEffect(() => {
    const d = parseDate(currentDate) || new Date();
    setDay(String(d.getDate()).padStart(2, '0'));
    setMonth(String(d.getMonth() + 1).padStart(2, '0'));
    setYear(String(d.getFullYear()));
  }, [currentDate, visible]);

  const handleDone = () => {
    const dd = day.padStart(2, '0');
    const mm = month.padStart(2, '0');
    const yyyy = year;
    const d = parseInt(dd, 10);
    const m = parseInt(mm, 10);
    const y = parseInt(yyyy, 10);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
      onSelect(`${dd}/${mm}/${yyyy}`);
      onClose();
    } else {
      Alert.alert('Invalid Date', 'Please enter a valid date (DD/MM/YYYY).');
    }
  };

  const setToday = () => {
    const t = new Date();
    setDay(String(t.getDate()).padStart(2, '0'));
    setMonth(String(t.getMonth() + 1).padStart(2, '0'));
    setYear(String(t.getFullYear()));
  };

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
        <TouchableOpacity style={styles.datePickerModal} activeOpacity={1}>
          <Text style={styles.datePickerTitle}>Select Date</Text>
          <View style={styles.datePickerRow}>
            <TextInput
              style={styles.datePickerInput}
              value={day}
              onChangeText={setDay}
              placeholder="DD"
              maxLength={2}
              keyboardType="numeric"
              placeholderTextColor={COLORS.placeholder}
            />
            <Text style={styles.datePickerSep}>/</Text>
            <TextInput
              style={styles.datePickerInput}
              value={month}
              onChangeText={setMonth}
              placeholder="MM"
              maxLength={2}
              keyboardType="numeric"
              placeholderTextColor={COLORS.placeholder}
            />
            <Text style={styles.datePickerSep}>/</Text>
            <TextInput
              style={[styles.datePickerInput, {flex: 1.5}]}
              value={year}
              onChangeText={setYear}
              placeholder="YYYY"
              maxLength={4}
              keyboardType="numeric"
              placeholderTextColor={COLORS.placeholder}
            />
          </View>
          <View style={styles.datePickerActions}>
            <TouchableOpacity
              style={styles.datePickerTodayBtn}
              onPress={setToday}
              activeOpacity={0.8}>
              <Text style={styles.datePickerTodayText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerDoneBtn}
              onPress={handleDone}
              activeOpacity={0.8}>
              <Text style={styles.datePickerDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function NewInvoiceStep2({navigation}: any) {
  const today = new Date();
  const [invoiceNo, setInvoiceNo] = useState(generateInvoiceNo());
  const [invoiceDate, setInvoiceDate] = useState(formatDateString(today));
  const [dueDate, setDueDate] = useState(formatDateString(addDays(today, 7)));
  const [therapist, setTherapist] = useState('Dr. Yash Pratihasta, PT');
  const [billingType, setBillingType] = useState('Per-Visit');
  const [items, setItems] = useState<{name: string; amount: string}[]>([
    {name: 'Cupping', amount: '500'},
    {name: 'Other Therapy', amount: '800'},
  ]);
  const [customTag, setCustomTag] = useState('');
  const [discount, setDiscount] = useState('0');
  const [payments, setPayments] = useState([{amount: '0', method: 'Cash'}]);
  const [showMethodPicker, setShowMethodPicker] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<
    'invoice' | 'due' | null
  >(null);

  const totalAmount = items.reduce(
    (s, it) => s + (parseInt(it.amount) || 0),
    0,
  );
  const payable = Math.max(0, totalAmount - (parseInt(discount) || 0));
  const totalPaid = payments.reduce((s, p) => s + (parseInt(p.amount) || 0), 0);
  const extraPaid = Math.max(0, totalPaid - payable);
  const balanceDue = Math.max(0, payable - totalPaid);

  const getStatus = () => {
    if (totalPaid >= payable && payable > 0) return 'Paid';
    if (totalPaid > 0) return 'Partial';
    return 'Pending';
  };

  const description = items.map(it => it.name).join(' + ') || '—';

  const addItem = (name: string) => {
    const price = SERVICE_PRICES[name] || '0';
    setItems([...items, {name, amount: price}]);
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
      setItems([...items, {name: t, amount: '0'}]);
      setCustomTag('');
    }
  };

  const addPayment = () => {
    setPayments([...payments, {amount: '', method: 'Cash'}]);
  };

  const removePayment = (idx: number) => {
    setPayments(payments.filter((_, i) => i !== idx));
  };

  const updatePayment = (idx: number, key: string, val: string) => {
    setPayments(payments.map((p, i) => (i === idx ? {...p, [key]: val} : p)));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          keyboardShouldPersistTaps="handled">
          {/* Step indicators */}
          <View style={styles.stepRow}>
            <Text style={styles.stepDone}>1</Text>
            <View style={styles.stepLine} />
            <Text style={styles.stepActive}>2</Text>
            <View style={styles.stepLine} />
            <Text style={styles.stepInactive}>3</Text>
          </View>

          {/* Patient card */}
          <View style={styles.patientCard}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>NP</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>New Patient</Text>
              <Text style={styles.patientReg}>VMCPTREG-0157 (assigned)</Text>
            </View>
            <TouchableOpacity style={styles.changeBtn} activeOpacity={0.8}>
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
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
            <View style={styles.colHalf}>
              <FieldLabel label="INVOICE NUMBER" />
              <TextInput
                style={styles.input}
                value={invoiceNo}
                onChangeText={setInvoiceNo}
                placeholderTextColor={COLORS.placeholder}
              />
              {/* <Text style={{color: COLORS.placeholder, fontSize: 9}}>
                VMC/INV/26-27/0001
              </Text> */}
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

          {/* Due Date */}
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

          {/* Service Items */}
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
              <View key={idx} style={styles.itemRow}>
                <TextInput
                  style={[styles.input, styles.itemNameInput]}
                  value={item.name}
                  onChangeText={v => updateItem(idx, 'name', v)}
                  placeholderTextColor={COLORS.placeholder}
                />
                <View style={styles.itemAmountWrapper}>
                  <TextInput
                    style={[styles.input, styles.itemAmountInput]}
                    value={item.amount}
                    onChangeText={v => updateItem(idx, 'amount', v)}
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeItem(idx)}
                  activeOpacity={0.8}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

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

            {/* Payments received */}
            <FieldLabel label="PAYMENTS RECEIVED" />
            {payments.map((p, idx) => (
              <View key={idx} style={styles.paymentRow}>
                <TextInput
                  style={[styles.input, styles.paymentAmountInput]}
                  value={p.amount}
                  onChangeText={v => updatePayment(idx, 'amount', v)}
                  keyboardType="numeric"
                  placeholder="Amount"
                  placeholderTextColor={COLORS.placeholder}
                />
                <TouchableOpacity
                  style={styles.methodPicker}
                  onPress={() =>
                    setShowMethodPicker(showMethodPicker === idx ? null : idx)
                  }
                  activeOpacity={0.8}>
                  <Text style={styles.methodText}>{p.method}</Text>
                  <Text style={styles.chevron}>⌄</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removePayment(idx)}
                  activeOpacity={0.8}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Method dropdown */}
            {showMethodPicker !== null && (
              <View style={styles.dropdown}>
                {PAYMENT_METHODS.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updatePayment(showMethodPicker, 'method', m);
                      setShowMethodPicker(null);
                    }}>
                    <Text style={styles.dropdownItemText}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Add Payment */}
            <TouchableOpacity
              style={styles.addPaymentBtn}
              onPress={addPayment}
              activeOpacity={0.8}>
              <Text style={styles.addPaymentText}>+ Add Payment</Text>
            </TouchableOpacity>

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
                  label={extraPaid > 0 ? 'EXTRA PAID (₹)' : 'ADVANCE PAID (₹)'}
                />
                <View style={[styles.input, styles.disabledInput]}>
                  <Text style={styles.disabledText}>
                    {extraPaid > 0
                      ? extraPaid.toLocaleString('en-IN')
                      : totalPaid.toLocaleString('en-IN')}
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
            <TouchableOpacity
              style={styles.draftBtn}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Saved', 'Invoice saved as draft.')}>
              <Text style={styles.draftBtnText}>Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('PreviewInvoice', {
                  note,
                  therapist,
                  patient: {name: 'New Patient', reg: 'VMCPTREG-0157'},
                  billing: {
                    invoiceNo,
                    date: invoiceDate,
                    due: dueDate,
                    type: billingType,
                    service: description,
                    items: items.map(it => ({
                      name: it.name,
                      amount: parseInt(it.amount) || 0,
                    })),
                  },
                  amount: {
                    total: totalAmount,
                    discount: parseInt(discount) || 0,
                    payable,
                    payments: payments.map(p => ({
                      amount: parseInt(p.amount) || 0,
                      method: p.method,
                    })),
                    totalPaid,
                    extraPaid,
                    balanceDue,
                    status: paymentStatus || getStatus(),
                  },
                })
              }>
              <Text style={styles.shareBtnText}>Preview & Share</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Every field above stays editable later — before or after the bill is
            shared.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker !== null}
        currentDate={showDatePicker === 'invoice' ? invoiceDate : dueDate}
        onSelect={(d: string) => {
          if (showDatePicker === 'invoice') {
            setInvoiceDate(d);
            const parsed = parseDate(d);
            if (parsed) setDueDate(formatDateString(addDays(parsed, 7)));
          } else {
            setDueDate(d);
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
    paddingBottom: 18,
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
    color: '#FFF',
    letterSpacing: -0.4,
  },

  // Scroll
  scroll: {flex: 1, backgroundColor: COLORS.bg},
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 14,
  },

  // Step indicator
  stepRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 2},
  stepDone: {fontSize: 14, fontWeight: '700', color: COLORS.stepInactive},
  stepActive: {fontSize: 14, fontWeight: '700', color: COLORS.teal},
  stepInactive: {fontSize: 14, fontWeight: '700', color: COLORS.stepInactive},
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
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
  patientReg: {fontSize: 12, color: COLORS.textSecondary, marginTop: 2},
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
  colHalf: {flex: 1, gap: 6},

  // Fields
  fieldWrapper: {gap: 8},
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.label,
    letterSpacing: 0.8,
  },
  fieldLabelSub: {fontSize: 11, fontWeight: '400', color: COLORS.textSecondary},

  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  disabledInput: {backgroundColor: COLORS.disabledBg, justifyContent: 'center'},
  disabledText: {fontSize: 14, color: COLORS.textSecondary},

  // Date input
  dateInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
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

  // Item row
  itemRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  itemNameInput: {flex: 2},
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
  paymentRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  paymentAmountInput: {flex: 1},
  methodPicker: {
    flex: 1.2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  methodText: {fontSize: 14, color: COLORS.textPrimary},
  chevron: {fontSize: 14, color: COLORS.textSecondary},

  // Dropdown
  dropdown: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginTop: -6,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemText: {fontSize: 14, color: COLORS.textPrimary},

  // Add payment
  addPaymentBtn: {alignSelf: 'flex-start'},
  addPaymentText: {fontSize: 13, fontWeight: '700', color: COLORS.teal},

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
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  datePickerInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  datePickerSep: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: '700',
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
