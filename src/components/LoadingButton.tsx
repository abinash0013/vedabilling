import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import COLORS from '../constants/colors';

interface LoadingButtonProps {
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
  variant?: 'solid' | 'outlined';
  style?: StyleProp<ViewStyle>;
}

export default function LoadingButton({
  label,
  loadingLabel,
  loading,
  disabled,
  onPress,
  variant = 'solid',
  style,
}: LoadingButtonProps) {
  const isSolid = variant === 'solid';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isSolid ? styles.solid : styles.outlined,
        (loading || disabled) && styles.disabled,
        style,
      ]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading || disabled}>
      {loading ? (
        <View style={styles.row}>
          <ActivityIndicator
            size="small"
            color={isSolid ? '#FFFFFF' : COLORS.teal}
          />
          <Text style={isSolid ? styles.solidText : styles.outlinedText}>
            {loadingLabel}
          </Text>
        </View>
      ) : (
        <Text style={isSolid ? styles.solidText : styles.outlinedText}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  solid: {
    backgroundColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.teal,
  },
  disabled: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  solidText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  outlinedText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 0.2,
  },
});
