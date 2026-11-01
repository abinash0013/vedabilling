import React from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import ReusableModal from './ReusableModal';
import COLORS from '../constants/colors';

export interface ModalField {
  key: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  prefix?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  maxLength?: number;
  autoFocus?: boolean;
}

interface ModalFormProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  fields: ModalField[];
  cancelLabel?: string;
  submitLabel?: string;
  onSubmit: () => void;
}

export default function ModalForm({
  visible,
  onClose,
  title,
  fields,
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
  onSubmit,
}: ModalFormProps) {
  return (
    <ReusableModal visible={visible} onClose={onClose}>
      <Text style={styles.title}>{title}</Text>
      {fields.map(field =>
        field.prefix ? (
          <View key={field.key} style={styles.row}>
            <Text style={styles.prefix}>{field.prefix}</Text>
            <TextInput
              style={[styles.input, styles.rowInput]}
              placeholder={field.placeholder}
              placeholderTextColor={COLORS.textSecondary}
              value={field.value}
              onChangeText={field.onChangeText}
              keyboardType={field.keyboardType}
              autoFocus={field.autoFocus}
            />
          </View>
        ) : (
          <TextInput
            key={field.key}
            style={styles.input}
            placeholder={field.placeholder}
            placeholderTextColor={COLORS.textSecondary}
            value={field.value}
            onChangeText={field.onChangeText}
            keyboardType={field.keyboardType}
            maxLength={field.maxLength}
            autoFocus={field.autoFocus}
          />
        ),
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={onClose}>
          <Text style={styles.cancelText}>{cancelLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.7} onPress={onSubmit}>
          <Text style={styles.submitText}>{submitLabel}</Text>
        </TouchableOpacity>
      </View>
    </ReusableModal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prefix: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingVertical: 12,
  },
  rowInput: {
    flex: 1,
  },
  actions: {
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
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
