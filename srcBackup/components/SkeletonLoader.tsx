import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet, ViewStyle} from 'react-native';

const PULSE_OPACITY_MIN = 0.3;
const PULSE_OPACITY_MAX = 0.7;
const PULSE_DURATION = 800;

function PulseBlock({width, height, borderRadius = 8}: {width: number | string; height: number; borderRadius?: number}) {
  const anim = useRef(new Animated.Value(PULSE_OPACITY_MIN)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {toValue: PULSE_OPACITY_MAX, duration: PULSE_DURATION, useNativeDriver: true}),
        Animated.timing(anim, {toValue: PULSE_OPACITY_MIN, duration: PULSE_DURATION, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.pulse,
        {width, height, borderRadius} as ViewStyle,
        {opacity: anim},
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <PulseBlock width={44} height={44} borderRadius={22} />
          <View style={{flex: 1, gap: 6}}>
            <PulseBlock width={'70%'} height={14} />
            <PulseBlock width={'45%'} height={12} />
          </View>
          <PulseBlock width={60} height={24} borderRadius={10} />
        </View>
        <View style={styles.divider} />
        <View style={styles.cardMid}>
          <PulseBlock width={100} height={24} borderRadius={10} />
          <PulseBlock width={70} height={14} />
        </View>
        <View style={styles.divider} />
        <View style={styles.cardBottom}>
          <PulseBlock width={90} height={24} borderRadius={10} />
          <View style={styles.bottomRight}>
            <PulseBlock width={50} height={12} />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function SkeletonLoader({count = 5}: {count?: number}) {
  return (
    <View style={styles.container}>
      {Array.from({length: count}).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
    gap: 14,
  },
  pulse: {
    backgroundColor: '#D6DEDD',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardAccent: {
    width: 5,
    backgroundColor: '#D6DEDD',
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
  divider: {
    height: 1,
    backgroundColor: '#EDF2F0',
  },
  cardMid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
