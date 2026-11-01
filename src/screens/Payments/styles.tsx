import {StyleSheet} from 'react-native';
import COLORS from '../../constants/colors';

export const styles = StyleSheet.create({
  // Search
  searchMargin: {
    marginHorizontal: 16,
    marginTop: 12,
  },

  // Filters
  filterBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    gap: 6,
  },
  filterTab: {},
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  filterPillActive: {
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  filterPillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterPillBadge: {
    minWidth: 18,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  filterPillBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // List
  flatList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 90,
    gap: 12,
  },
  listEmpty: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EBF4F2',
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
  resultRow: {
    paddingHorizontal: 20,
    paddingBottom: 2,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Card
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
  topRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  cardMid: {
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
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
    flexShrink: 0,
  },
  methodTag: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  methodTagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Progress
  progressBarBg: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.teal,
    borderRadius: 3,
  },

  // Avatar
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
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
  amount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
    flexShrink: 0,
  },

  // Pay badge
  payBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 2,
  },
  payBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
