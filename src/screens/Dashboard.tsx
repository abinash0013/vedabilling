import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import React from 'react';
import {Plus, X} from 'lucide-react-native';

const COLORS = {
  teal: '#2E7D72',
  tealLight: '#D6EAE7',
  tealDark: '#1F5C56',
  tealBorder: '#2E7D72',
  bg: '#EFF5F4',
  card: '#FFFFFF',
  textPrimary: '#1A2E2B',
  textSecondary: '#7A9490',
  label: '#5A8A84',
  sectionLabel: '#2E7D72',
  border: '#E2EDEB',
  inputBg: '#F5F9F8',
  headerText: '#FFFFFF',
  headerSub: 'rgba(255,255,255,0.75)',
  plusBtn: 'rgba(255,255,255,0.25)',
  placeholder: '#AABFBC',
  stepNum: '#7A9490',
  hint: '#7A9490',
  red: '#C0392B',
  amber: '#E67E22',
  green: '#27AE60',
  greenLight: '#E8F5EC',
  amberLight: '#FEF3E2',
  redLight: '#FDECEB',
};

const stats = [
  {label: "TODAY'S BILLS", value: '2', color: COLORS.teal, isNumber: true},
  {label: 'PENDING DUES', value: '₹4,300', color: COLORS.red},
  {label: 'THIS WEEK', value: '₹18,600', color: COLORS.teal},
];

const invoices = [
  {
    id: 'KJ',
    name: 'Kavita Joshi',
    invoice: 'VMC-INV-260621-02',
    type: 'Per-Visit',
    amount: '₹1,200',
    status: 'Paid',
  },
  {
    id: 'RV',
    name: 'Rohit Verma',
    invoice: 'VMC-INV-260621-01',
    type: 'Weekly',
    amount: '₹3,500',
    status: 'Partial',
  },
  {
    id: 'PS',
    name: 'Priya Sharma',
    invoice: 'VMC-INV-260620-04',
    type: 'Package',
    amount: '₹6,000',
    status: 'Unpaid',
    multiLine: true,
  },
  {
    id: 'AC',
    name: 'Anita Choudhary',
    invoice: 'VMC-INV-260620-03',
    type: 'Weekly',
    amount: '₹2,800',
    status: 'Paid',
  },
  {
    id: 'SM',
    name: 'Suresh Mehta',
    invoice: 'VMC-INV-260619-02',
    type: 'Per-Visit',
    amount: '₹1,200',
    status: 'Paid',
  },
];

const PATIENTS = [
  { id: 'PS', name: 'Priya Sharma',    reg: 'VMCPTREG-0124', lastVisit: '18 Jun' },
  { id: 'RV', name: 'Rohit Verma',     reg: 'VMCPTREG-0098', lastVisit: '20 Jun' },
  { id: 'AC', name: 'Anita Choudhary', reg: 'VMCPTREG-0145', lastVisit: '15 Jun' },
  { id: 'SM', name: 'Suresh Mehta',    reg: 'VMCPTREG-0067', lastVisit: '10 Jun' },
  { id: 'KJ', name: 'Kavita Joshi',    reg: 'VMCPTREG-0156', lastVisit: '21 Jun' },
];

const statusStyles = {
  Paid: {
    bg: COLORS.greenLight,
    text: COLORS.green,
  },
  Partial: {
    bg: COLORS.amberLight,
    text: COLORS.amber,
  },
  Unpaid: {
    bg: COLORS.redLight,
    text: COLORS.red,
  },
};

function StatCard({label, value, color}: any) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, {color}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Avatar({initials}: any) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
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

function InvoiceRow({item, isLast}: any) {
  return (
    <View style={[styles.invoiceRow, isLast && styles.invoiceRowLast]}>
      <Avatar initials={item.id} />
      <View style={styles.invoiceInfo}>
        <Text style={styles.invoiceName}>{item.name}</Text>
        <Text style={styles.invoiceMeta}>
          {item.invoice}
          {item.multiLine ? '\n' : ' · '}
          {item.type}
        </Text>
      </View>
      <View style={styles.invoiceRight}>
        <Text style={styles.invoiceAmount}>{item.amount}</Text>
        <StatusBadge status={item.status} />
      </View>
    </View>
  );
}

function PatientRow({item, isLast, onSelect}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.patientRow, isLast && styles.patientRowLast]}
      onPress={() => onSelect(item)}
    >
      <Avatar initials={item.id} />
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientMeta}>
          {item.reg} · Last visit {item.lastVisit}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Dashboard() {
  const [invoiceModal, setInvoiceModal] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('+91');
  const [newAddress, setNewAddress] = React.useState('');

  const filtered = PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.reg.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectPatient = (patient: any) => {
    Alert.alert(
      'Patient Selected',
      `${patient.name} auto-filled. Proceeding to Step 2.`,
      [{ text: 'OK' }]
    );
  };

  const handleUseNewPatient = () => {
    if (!newName.trim()) {
      Alert.alert('Required', 'Please enter the patient\'s full name.');
      return;
    }
    Alert.alert('New Patient', `${newName} added. Proceeding to Step 2.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Good evening, Dr. Yash</Text>
          <Text style={styles.headerSub}>Sunday, 21 June 2026</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </View>

        {/* Recent Invoices */}
        <Text style={styles.sectionTitle}>RECENT INVOICES</Text>

        <View style={styles.invoiceCard}>
          {invoices.map((item, idx) => (
            <InvoiceRow
              key={item.invoice}
              item={item}
              isLast={idx === invoices.length - 1}
            />
          ))}
        </View>
      </ScrollView>

      {/* New Invoice FAB */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={() => setInvoiceModal(true)}>
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

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
              <Text style={styles.stepLabel}>1</Text>

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

              <Text style={styles.hint}>
                Tap a patient to auto-fill their details, or add a new one below.
              </Text>

              {/* Patient list */}
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
                  <Text style={styles.emptyText}>No patients match your search.</Text>
                )}
              </View>

              {/* OR ADD A NEW PATIENT */}
              <Text style={styles.orSectionTitle}>OR ADD A NEW PATIENT</Text>

              <View style={styles.newPatientCard}>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>FULL NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="e.g. Meena Agarwal"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>PHONE (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    value={newPhone}
                    onChangeText={setNewPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={[styles.fieldWrapper, styles.fieldLast]}>
                  <Text style={styles.fieldLabel}>ADDRESS (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    value={newAddress}
                    onChangeText={setNewAddress}
                    placeholder="For insurance documentation"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
              </View>

              {/* Use This New Patient button */}
              <TouchableOpacity
                style={styles.useBtn}
                activeOpacity={0.85}
                onPress={handleUseNewPatient}
              >
                <Text style={styles.useBtnText}>Use This New Patient</Text>
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
    paddingBottom: 32,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // Invoice card container
  invoiceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },

  // Invoice row
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  invoiceRowLast: {
    borderBottomWidth: 0,
  },

  // Avatar
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 0.5,
  },

  // Invoice info
  invoiceInfo: {
    flex: 1,
    gap: 3,
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
    lineHeight: 16,
  },

  // Right side
  invoiceRight: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  invoiceAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
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

  // Step label
  stepLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.stepNum,
    marginBottom: 10,
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

  // Hint
  hint: {
    fontSize: 13,
    color: COLORS.hint,
    lineHeight: 18,
    marginBottom: 12,
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

  // Section title
  orSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.sectionLabel,
    letterSpacing: 1.1,
    marginTop: 16,
    marginBottom: 10,
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
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.tealBorder,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
  },
  useBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 0.1,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
