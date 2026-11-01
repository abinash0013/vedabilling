import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import COLORS from '../constants/colors';

interface ReusableModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  animationType?: 'fade' | 'slide' | 'none';
}

export default function ReusableModal({
  visible,
  onClose,
  children,
  contentStyle,
  animationType = 'fade',
}: ReusableModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    gap: 16,
  },
});
