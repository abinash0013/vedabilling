import {useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {ChevronRight, FileText} from 'lucide-react-native';
import {getAllPatients, insertPatient} from '../../database';
import type {PatientListItem} from '../../types';
import FilterableList from '../../components/FilterableList';
import ScreenWrapper from '../../components/ScreenWrapper';
import ModalForm from '../../components/ModalForm';

import BASE from '../../constants/colors';
import styles from './styles';

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
    <ScreenWrapper
      title="Patients"
      subtitle={`${patients.length} records`}
      scrollable={false}
      headerRight={
        <TouchableOpacity
          style={styles.plusBtn}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>
      }>
      <FilterableList
        data={patients}
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name or patient ID..."
        searchStyle={styles.searchBar}
        searchKeys={['name', 'reg']}
        renderItem={item => (
          <PatientCard
            item={item}
            onPress={() =>
              navigation.navigate('PatientHistory', {patient: item})
            }
          />
        )}
        loading={loading}
        emptyIcon={
          <FileText size={40} color={COLORS.dashed} strokeWidth={1.5} />
        }
        emptyTitle="No patients found"
        emptySub="Tap + to add your first patient"
      />

      <ModalForm
        visible={modalVisible}
        onClose={() => {
          setNewName('');
          setModalVisible(false);
        }}
        title="Add New Patient"
        cancelLabel="Cancel"
        submitLabel="Add Patient"
        onSubmit={handleAdd}
        fields={[
          {key: 'name', placeholder: 'Enter patient name', value: newName, onChangeText: setNewName, autoFocus: true},
          {key: 'reg', placeholder: '1234', value: newRegNumber, onChangeText: setNewRegNumber, prefix: 'VMCPTREG-', keyboardType: 'number-pad'},
          {key: 'phone', placeholder: 'Phone number (10 digits)', value: newPhone, onChangeText: setNewPhone, keyboardType: 'phone-pad', maxLength: 10},
          {key: 'address', placeholder: 'Address', value: newAddress, onChangeText: setNewAddress},
        ]}
      />
    </ScreenWrapper>
  );
}
