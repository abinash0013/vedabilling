import React from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
  type ScrollViewProps,
} from 'react-native';

import COLORS from '../constants/colors';

interface ScreenWrapperProps {
  title: string;
  subtitle?: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  scrollViewProps?: Partial<ScrollViewProps>;
  contentStyle?: StyleProp<ViewStyle>;
  bottomPadding?: number;
}

export function BackButton({onPress}: {onPress: () => void}) {
  return (
    <TouchableOpacity
      style={styles.backBtn}
      activeOpacity={0.8}
      onPress={onPress}>
      <Text style={styles.backArrow}>←</Text>
    </TouchableOpacity>
  );
}

export default function ScreenWrapper({
  title,
  subtitle,
  headerLeft,
  headerRight,
  children,
  footer,
  scrollable = true,
  scrollViewProps,
  contentStyle,
  bottomPadding = 90,
}: ScreenWrapperProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />

      <View style={styles.header}>
        {headerLeft}
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
        </View>
        {headerRight}
      </View>

      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.container,
            {paddingBottom: bottomPadding},
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, contentStyle]}>{children}</View>
      )}

      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.teal,
  },
  header: {
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
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
  scroll: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 18,
    color: '#FFF',
    lineHeight: 22,
  },
});
