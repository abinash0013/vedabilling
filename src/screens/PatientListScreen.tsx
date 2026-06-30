import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const COLORS = {
  teal: '#2E7D72',
  tealLight: '#D6EAE7',
  tealDark: '#1F5C56',
  bg: '#EFF5F4',
  card: '#FFFFFF',
  textPrimary: '#1A2E2B',
  textSecondary: '#7A9490',
  border: '#E2EDEB',
  inputBg: '#F5F9F8',
  headerText: '#FFFFFF',
  headerSub: 'rgba(255,255,255,0.75)',
  plusBtn: 'rgba(255,255,255,0.25)',
};

const ALL_PATIENTS = [
  {
    id: 'PS',
    name: 'Priya Sharma',
    reg: 'VMCPTREG-0124',
    invoices: 7,
    date: '18 Jun',
  },
  {
    id: 'RV',
    name: 'Rohit Verma',
    reg: 'VMCPTREG-0098',
    invoices: 12,
    date: '20 Jun',
  },
  {
    id: 'AC',
    name: 'Anita Choudhary',
    reg: 'VMCPTREG-0145',
    invoices: 4,
    date: '15 Jun',
  },
  {
    id: 'SM',
    name: 'Suresh Mehta',
    reg: 'VMCPTREG-0067',
    invoices: 9,
    date: '10 Jun',
  },
  {
    id: 'KJ',
    name: 'Kavita Joshi',
    reg: 'VMCPTREG-0156',
    invoices: 2,
    date: '21 Jun',
  },
];

function Avatar({initials}: any) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function PatientRow({item, isLast, onPress}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.row, isLast && styles.rowLast]}
      onPress={onPress}>
      <Avatar initials={item.id} />
      <View style={styles.rowInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientMeta}>
          {item.reg} · {item.invoices} invoices
        </Text>
      </View>
      <Text style={styles.dateText}>{item.date}</Text>
    </TouchableOpacity>
  );
}

export default function PatientsScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState(ALL_PATIENTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  const filtered = patients.filter(
    p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.reg.toLowerCase().includes(query.toLowerCase()),
  );

  const generateReg = () => {
    const lastNum = patients.reduce((max, p) => {
      const n = parseInt(p.reg.replace('VMCPTREG-', ''), 10);
      return n > max ? n : max;
    }, 0);
    return 'VMCPTREG-' + String(lastNum + 1).padStart(4, '0');
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a patient name.');
      return;
    }
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', {month: 'short'});
    const date = `${day} ${month}`;
    setPatients(prev => [
      ...prev,
      {
        id: getInitials(trimmed),
        name: trimmed,
        reg: generateReg(),
        invoices: 0,
        date,
      },
    ]);
    setNewName('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} /> */}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Patients</Text>
          <Text style={styles.headerSub}>{patients.length} records</Text>
        </View>
        <TouchableOpacity
          style={styles.plusBtn}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Search */}
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or patient ID..."
            placeholderTextColor={COLORS.textSecondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Patient list */}
        <View style={styles.listCard}>
          <FlatList
            data={filtered}
            keyExtractor={item => item.reg}
            scrollEnabled={false}
            renderItem={({item, index}) => (
              <PatientRow
                item={item}
                isLast={index === filtered.length - 1}
                onPress={() => navigation.navigate('PatientHistory')}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No patients found.</Text>
            }
          />
        </View>
      </View>

      {/* Add Patient Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Patient</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter patient name"
              placeholderTextColor={COLORS.textSecondary}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setNewName('');
                  setModalVisible(false);
                }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                <Text style={styles.addBtnText}>Add Patient</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.teal,
  },

  // Header
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
  plusBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.plusBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 28,
    fontWeight: '300',
  },

  // Body
  body: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 0,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Search
  searchWrapper: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // List card
  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },

  // Avatar
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
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

  // Info
  rowInfo: {
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

  // Date
  dateText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flexShrink: 0,
  },

  // Empty
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingVertical: 24,
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  addBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
