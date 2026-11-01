import {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {
  ChevronRight,
  UserPlus,
  FileText,
  Phone,
  MapPin,
} from 'lucide-react-native';
import {getAllPatients, insertPatient} from '../../database';
import type {PatientListItem, NewPatientInput} from '../../types';
import SearchBar from './../../components/SearchBar';
import SkeletonLoader from './../../components/SkeletonLoader';

import BASE from './../../constants/colors';

const PLUS_BTN = 'rgba(255,255,255,0.25)';
const COLORS = BASE;

function Avatar({name, size = 48}: {name: string; size?: number}) {
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

function PatientCard({
  item,
  onPress,
}: {
  item: PatientListItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.card} onPress={onPress}>
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Avatar name={item.name} />
          <View style={styles.cardInfo}>
            <Text style={styles.patientName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.patientReg}>{item.reg}</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} strokeWidth={2.5} />
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          <View style={styles.cardChip}>
            <FileText size={13} color={COLORS.teal} strokeWidth={2.5} />
            <Text style={styles.cardChipText}>
              {item.invoices} {item.invoices === 1 ? 'invoice' : 'invoices'}
            </Text>
          </View>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PatientsScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newRegNumber, setNewRegNumber] = useState('');

  const loadPatients = useCallback(async () => {
    try {
      const list = await getAllPatients();
      setPatients(list);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, [loadPatients]),
  );

  const filtered = patients.filter(
    p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.reg.toLowerCase().includes(query.toLowerCase()),
  );

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a patient name.');
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
      await insertPatient({
        name: trimmed,
        phone: newPhone.trim(),
        address: newAddress.trim(),
        reg,
      });
      await loadPatients();
      setNewName('');
      setNewPhone('');
      setNewAddress('');
      setNewRegNumber('');
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to add patient.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />

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
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or patient ID..."
          style={styles.searchBar}
        />

        {/* Patient list */}
        {loading ? (
          <SkeletonLoader count={5} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.reg}
            style={{flex: 1}}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 12,
              paddingVertical: 4,
              paddingBottom: 90,
              flexGrow: filtered.length === 0 ? 1 : undefined,
            }}
            renderItem={({item}) => (
              <PatientCard
                item={item}
                onPress={() =>
                  navigation.navigate('PatientHistory', {patient: item})
                }
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <FileText size={40} color={COLORS.dashed} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No patients found</Text>
                <Text style={styles.emptySub}>
                  {query.trim()
                    ? 'Try a different search term'
                    : 'Tap + to add your first patient'}
                </Text>
              </View>
            }
          />
        )}
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
            <View style={styles.regRow}>
              <Text style={styles.regPrefix}>VMCPTREG-</Text>
              <TextInput
                style={[styles.modalInput, styles.regInput]}
                placeholder="1234"
                placeholderTextColor={COLORS.textSecondary}
                value={newRegNumber}
                onChangeText={setNewRegNumber}
                keyboardType="number-pad"
              />
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Phone number (10 digits)"
              placeholderTextColor={COLORS.textSecondary}
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Address"
              placeholderTextColor={COLORS.textSecondary}
              value={newAddress}
              onChangeText={setNewAddress}
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
    backgroundColor: PLUS_BTN,
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
  },

  // Search
  searchBar: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },

  // List card
  listCard: {
    gap: 12,
  },

  // Patient Card
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
    backgroundColor: COLORS.teal,
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
    marginHorizontal: 0,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 17,
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

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
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

  // Reg row
  regRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regPrefix: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingVertical: 12,
  },
  regInput: {
    flex: 1,
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
