import {StyleSheet} from 'react-native';

import BASE from '../../constants/colors';

const COLORS = BASE;
const PLUS_BTN = 'rgba(255,255,255,0.25)';

const styles = StyleSheet.create({
  plusBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PLUS_BTN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 28,
    fontWeight: '300',
  },

  // Search
  searchBar: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },

  // List card
  listCard: {
    gap: 12,
  },

  // Patient Card
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
    backgroundColor: COLORS.teal,
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
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 0,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 17,
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

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    gap: 8,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.tealBg,
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

  // Edit button
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  editIcon: {
    fontSize: 18,
    color: COLORS.headerText,
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 14,
  },

  // Contact card
  contactCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactRowLast: {
    borderBottomWidth: 0,
  },
  contactLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  contactValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statCardBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  statValueNeutral: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginTop: 4,
  },

  // Section title
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.sectionLabel,
    letterSpacing: 1.1,
    marginBottom: -2,
  },

  // Invoice card
  invoiceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  invoiceRowLast: {
    borderBottomWidth: 0,
  },
  invoiceLeft: {
    flex: 1,
    gap: 4,
  },
  invoiceId: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  invoiceMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  invoiceRight: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  invoiceAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },

  // Badge
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Footer
  footer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  footerBold: {
    fontWeight: '700',
    color: COLORS.tealDark,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingVertical: 24,
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.headerText,
  },

  // Account Payment History button
  billingHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.teal,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: COLORS.tealDark,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 4,
  },
  billingHistoryBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  billingHistoryBtnIcon: {
    fontSize: 18,
    color: COLORS.headerText,
  },
  billingHistoryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.headerText,
    letterSpacing: 0.2,
  },
  billingHistoryBtnArrow: {
    fontSize: 16,
    color: COLORS.headerText,
    opacity: 0.7,
  },
});

export default styles;
