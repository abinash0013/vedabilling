import {StyleSheet} from 'react-native';

import COLORS from '../../constants/colors';

const styles = StyleSheet.create({
  scroll: {flex: 1, backgroundColor: COLORS.bg},
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 170,
    gap: 14,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.tealBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.card,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  heroImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginTop: 4,
  },
  heroTagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 48,
  },

  // Display row
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  fieldIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.tealBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  displayValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1.5,
    textAlign: 'right',
  },

  // Display textarea
  displayTextArea: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  clauseText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
    paddingLeft: 40,
  },

  // Edit bar
  editBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 90,
    paddingTop: 10,
    backgroundColor: COLORS.bg,
  },
  editBtn: {
    backgroundColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  footer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  footerBold: {
    fontWeight: '700',
    color: COLORS.tealDark,
  },

  // ---- Modal ----
  modalSafe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalSave: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.teal,
  },
  modalScroll: {flex: 1},
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },

  // Modal logo
  modalLogo: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  modalLogoBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: COLORS.tealBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.card,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  modalLogoImage: {
    width: 68,
    height: 68,
    borderRadius: 20,
  },
  modalCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  modalLogoHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Modal card
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  modalCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 48,
  },

  // Edit field row
  editRow: {
    paddingHorizontal: 14,
    gap: 6,
    paddingVertical: 10,
  },
  editLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.label,
  },
  editInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginLeft: 38,
  },

  // Textarea
  textareaRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  textarea: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textPrimary,
    minHeight: 90,
    marginLeft: 38,
  },
});

export default styles;
