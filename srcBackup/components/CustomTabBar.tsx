import React, {memo, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  Receipt,
  DatabaseBackup,
} from 'lucide-react-native';
import COLORS from '../constants/colors';

const ICONS: Record<string, React.ComponentType<any>> = {
  Dashboard: LayoutDashboard,
  Patients: Users,
  Invoices: FileText,
  Payments: Receipt,
  Backup: DatabaseBackup,
  Settings: Settings,
};

const LABELS: Record<string, string> = {
  Dashboard: 'Home',
  Patients: 'Patients',
  Invoices: 'Invoices',
  Payments: 'Payments',
  Backup: 'Backup',
  Settings: 'Settings',
};

const TabItem = memo(function TabItem({
  routeKey,
  name,
  isActive,
  onPress,
}: {
  routeKey: string;
  name: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const Icon = ICONS[name] || LayoutDashboard;
  const label = LABELS[name] || name;

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      onPress={onPress}
      style={[styles.pill, isActive && styles.pillActive]}>
      <Icon
        size={20}
        color={isActive ? '#FFF' : COLORS.textSecondary}
        strokeWidth={isActive ? 2.5 : 2}
      />
      {isActive && <Text style={styles.pillLabel}>{label}</Text>}
    </TouchableOpacity>
  );
});

export default function CustomTabBar({state, navigation}: BottomTabBarProps) {
  const currentIndex = state.index;

  const onPress = useCallback(
    (name: string, index: number) => {
      if (index !== currentIndex) {
        navigation.dispatch(CommonActions.navigate(name));
      }
    },
    [currentIndex, navigation],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {state.routes.map((route, index) => (
          <TabItem
            key={route.key}
            routeKey={route.key}
            name={route.name}
            isActive={index === currentIndex}
            onPress={() => onPress(route.name, index)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 6,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 100,
    backgroundColor: '#F2F4F6',
  },
  pillActive: {
    backgroundColor: COLORS.teal,
    flex: 2.5,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 5,
  },
});
