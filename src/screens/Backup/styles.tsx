import {StyleSheet} from 'react-native';

import COLORS from '../../constants/colors';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.sectionLabel,
    letterSpacing: 1.1,
    marginTop: 4,
    marginBottom: -2,
  },

  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storageLeft: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  storageDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  storageSize: {
    alignItems: 'center',
  },
  storageSizeNum: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: -1,
    lineHeight: 26,
  },
  storageSizeUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 0.5,
  },

  exportDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },

  importNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },

  infoBanner: {
    backgroundColor: COLORS.amberLight,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  infoBannerBar: {
    width: 3,
    borderRadius: 4,
    backgroundColor: COLORS.amberBorder,
    flexShrink: 0,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.amberText,
    lineHeight: 20,
  },
});

export default styles;
