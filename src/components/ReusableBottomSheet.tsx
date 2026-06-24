import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  Pressable,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {X} from 'lucide-react-native';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

export type SheetItemConfig = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  onPress?: () => void;
};

interface ReusableBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  items: SheetItemConfig[][];
  title?: string;
  showCloseButton?: boolean;
  onItemPress?: (item: SheetItemConfig) => void;
}

const ReusableBottomSheet: React.FC<ReusableBottomSheetProps> = ({
  visible,
  onClose,
  items,
  title = 'MORE OPTIONS2',
  showCloseButton = true,
  onItemPress,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 62,
          friction: 11,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, overlayOpacity]);

  const handleItemPress = (item: SheetItemConfig) => {
    if (onItemPress) {
      onItemPress(item);
    }
    item.onPress?.();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      {/* Dimmed backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, {opacity: overlayOpacity}]}
        pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet panel */}
      <Animated.View style={[styles.panel, {transform: [{translateY}]}]}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Grid rows */}
        {items.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.cell}
                activeOpacity={0.75}
                onPress={() => handleItemPress(item)}>
                {/* Icon tile */}
                <View style={styles.iconTile}>
                  {item.icon}

                  {/* Red notification badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <View style={styles.badgeDot}>
                      <Text style={styles.badgeDotText}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.cellLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Close button */}
        {showCloseButton && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingBottom: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: -6},
    elevation: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 2.5,
    marginBottom: 28,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  iconTile: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#EEF0EE',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  badgeDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cellLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#1C1917',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  closeBtn: {
    alignSelf: 'center',
    marginTop: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ReusableBottomSheet;
