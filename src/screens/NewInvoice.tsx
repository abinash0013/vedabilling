import {useState} from 'react';
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
};

const BILLING_TYPES = ['Per-Visit', 'Weekly', 'Package'];

const SERVICE_TAGS = [
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

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'];

function FieldLabel({label, sub}: any) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {sub ? <Text style={styles.fieldLabelSub}> {sub}</Text> : null}
    </Text>
  );
}

export default function NewInvoiceStep2({navigation}: any) {
  const [billingType, setBillingType] = useState('Per-Visit');
  const [selectedService, setSelectedService] = useState(
    'Daily / Per-Session Visit',
  );
  const [customTag, setCustomTag] = useState('');
  const [tags, setTags] = useState(SERVICE_TAGS);
  const [description, setDescription] = useState(
    'Daily / Per-Session Visit — Knee Rehab',
  );
  const [totalAmount, setTotalAmount] = useState('1300');
  const [discount, setDiscount] = useState('100');
  const [isAdvance, setIsAdvance] = useState(true);
  const [payments, setPayments] = useState([{amount: '500', method: 'UPI'}]);
  const [showMethodPicker, setShowMethodPicker] = useState<number | null>(null);

  const payable = Math.max(
    0,
    (parseInt(totalAmount) || 0) - (parseInt(discount) || 0),
  );
  const totalPaid = payments.reduce((s, p) => s + (parseInt(p.amount) || 0), 0);
  const balanceDue = Math.max(0, payable - totalPaid);

  const getStatus = () => {
    if (isAdvance && totalPaid > 0 && balanceDue > 0) return 'Advance Paid';
    if (balanceDue === 0 && totalPaid > 0) return 'Paid';
    if (totalPaid > 0) return 'Partial';
    return 'Unpaid';
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setSelectedService(t);
      setDescription(t);
    }
    setCustomTag('');
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
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.8}>
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

          {/* Invoice Number + Date */}
          <View style={styles.twoCol}>
            <View style={styles.colHalf}>
              <FieldLabel label="INVOICE NUMBER" />
              <TextInput
                style={[styles.input, {color: COLORS.textSecondary}]}
                value="VMC-INV-260621-03"
                editable={false}
              />
            </View>
            <View style={styles.colHalf}>
              <FieldLabel label="INVOICE DATE" />
              <View style={styles.dateInput}>
                <Text style={styles.dateText}>21/06/2026</Text>
                <Text style={styles.calIcon}>📅</Text>
              </View>
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
            <View style={styles.dateInput}>
              <Text style={styles.dateText}>21/06/2026</Text>
              <Text style={styles.calIcon}>📅</Text>
            </View>
          </View>

          {/* Service / Description */}
          <View style={styles.fieldWrapper}>
            <FieldLabel label="SERVICE / DESCRIPTION" />
            <View style={styles.tagCloud}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    selectedService === tag && styles.tagActive,
                  ]}
                  onPress={() => {
                    setSelectedService(tag);
                    setDescription(tag);
                  }}
                  activeOpacity={0.75}>
                  <Text
                    style={[
                      styles.tagText,
                      selectedService === tag && styles.tagTextActive,
                    ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom tag input */}
            <View style={styles.addTagRow}>
              <TextInput
                style={styles.addTagInput}
                placeholder="Type a new one to add..."
                placeholderTextColor={COLORS.placeholder}
                value={customTag}
                onChangeText={setCustomTag}
                returnKeyType="done"
                onSubmitEditing={addCustomTag}
              />
              <TouchableOpacity
                style={styles.addTagBtn}
                onPress={addCustomTag}
                activeOpacity={0.8}>
                <Text style={styles.addTagBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Description editable */}
          <View style={styles.fieldWrapper}>
            <FieldLabel label="SELECTED DESCRIPTION (EDITABLE)" />
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          {/* AMOUNT section */}
          <View style={styles.amountCard}>
            <Text style={styles.amountTitle}>AMOUNT</Text>

            {/* Total + Discount */}
            <View style={styles.twoCol}>
              <View style={styles.colHalf}>
                <FieldLabel label="TOTAL AMOUNT (₹)" />
                <TextInput
                  style={styles.input}
                  value={totalAmount}
                  onChangeText={setTotalAmount}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.colHalf}>
                <FieldLabel label="DISCOUNT (₹)" />
                <TextInput
                  style={styles.input}
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                />
              </View>
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

            {/* Advance checkbox */}
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setIsAdvance(!isAdvance)}
              activeOpacity={0.8}>
              <View
                style={[styles.checkbox, isAdvance && styles.checkboxChecked]}>
                {isAdvance && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>
                This is an advance — service not yet delivered
              </Text>
            </TouchableOpacity>

            {/* Total Paid + Balance Due */}
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
                <FieldLabel label="BALANCE DUE (₹)" />
                <View style={[styles.input, styles.disabledInput]}>
                  <Text style={styles.disabledText}>
                    {balanceDue.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payment Status */}
            <View style={styles.statusRow}>
              <Text style={styles.fieldLabel}>PAYMENT STATUS</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{getStatus()}</Text>
              </View>
            </View>
          </View>

          {/* Note / Remarks */}
          <TouchableOpacity style={styles.noteBtn} activeOpacity={0.8}>
            <Text style={styles.noteBtnText}>+ Add note / remarks</Text>
          </TouchableOpacity>

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
                  patient: {name: 'New Patient', reg: 'VMCPTREG-0157'},
                  billing: {
                    invoiceNo: 'VMC-INV-260621-03',
                    date: '21/06/2026',
                    due: '21/06/2026',
                    type: billingType,
                    service: description,
                  },
                  amount: {
                    total: parseInt(totalAmount) || 0,
                    discount: parseInt(discount) || 0,
                    payable,
                    payments: payments.map(p => ({
                      amount: parseInt(p.amount) || 0,
                      method: p.method,
                      mode: isAdvance ? 'advance' : 'regular',
                    })),
                    totalPaid,
                    balanceDue,
                    status: getStatus(),
                    isAdvance,
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
  tagActive: {backgroundColor: COLORS.teal, borderColor: COLORS.teal},
  tagText: {fontSize: 13, fontWeight: '600', color: COLORS.textPrimary},
  tagTextActive: {color: '#FFF'},

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
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.redLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {fontSize: 14, color: COLORS.red, fontWeight: '700'},

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

  // Checkbox
  checkRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 10},
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {backgroundColor: COLORS.teal},
  checkmark: {fontSize: 11, color: '#FFF', fontWeight: '800'},
  checkLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

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
});
