import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { getPatientByReg, getInvoicesByPatient } from "../database";
import type { Patient, InvoiceSummary } from "../types";

import BASE from "../constants/colors";

const COLORS = {
  ...BASE,
  textSecondary: "#9AAFAC",
  textMuted: "#B0C4C1",
  border: "#E8F0EF",
  headerSub: "rgba(255,255,255,0.7)",
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Paid: { bg: COLORS.greenLight, text: COLORS.green },
  Unpaid: { bg: COLORS.redLight, text: COLORS.red },
  Partial: { bg: "#FEF3E2", text: "#E67E22" },
  "Over Paid": { bg: COLORS.greenLight, text: COLORS.green },
  "Advance Paid": { bg: COLORS.greenLight, text: COLORS.green },
  "Partial Paid": { bg: "#FEF3E2", text: "#E67E22" },
  Due: { bg: COLORS.redLight, text: COLORS.red },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Paid;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{status}</Text>
    </View>
  );
}

function InvoiceRow({ item, isLast }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.invoiceRow, isLast && styles.invoiceRowLast]}
    >
      <View style={styles.invoiceLeft}>
        <Text style={styles.invoiceId}>{item.invoice}</Text>
        <Text style={styles.invoiceMeta}>{item.date}</Text>
      </View>
      <View style={styles.invoiceRight}>
        <Text style={styles.invoiceAmount}>{item.amount}</Text>
        <StatusBadge status={item.status} />
      </View>
    </TouchableOpacity>
  );
}

const parseAmt = (s: string) => Number(s.replace(/[^0-9]/g, ""));

export default function PatientHistoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const routePatient = route?.params?.patient;
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);

  const loadData = useCallback(async () => {
    if (!routePatient?.reg) return;
    try {
      const [pat, invList] = await Promise.all([
        getPatientByReg(routePatient.reg),
        getInvoicesByPatient(routePatient.reg),
      ]);
      setPatientInfo(pat);
      setInvoices(invList);
    } catch {}
  }, [routePatient?.reg]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const displayPatient = patientInfo || routePatient;
  const patientName = displayPatient?.name || "Unknown";
  const patientReg = displayPatient?.reg || "";

  const totalInvoiceCount = invoices.length;
  const paidAmt = invoices
    .filter(
      (i) =>
        i.status === "Paid" ||
        i.status === "Over Paid" ||
        i.status === "Advance Paid",
    )
    .reduce((s, i) => s + parseAmt(i.amount), 0);
  const dueAmt = invoices
    .filter(
      (i) =>
        i.status === "Unpaid" ||
        i.status === "Due" ||
        i.status === "Partial Paid" ||
        i.status === "Partial",
    )
    .reduce((s, i) => s + parseAmt(i.amount), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{patientName}</Text>
          <Text style={styles.headerReg}>{patientReg}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact card */}
        {patientInfo?.phone || patientInfo?.address ? (
          <View style={styles.contactCard}>
            {patientInfo.phone ? (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{patientInfo.phone}</Text>
              </View>
            ) : null}
            {patientInfo.address ? (
              <View style={[styles.contactRow, styles.contactRowLast]}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>{patientInfo.address}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBorder]}>
            <Text style={styles.statValueNeutral}>{totalInvoiceCount}</Text>
            <Text style={styles.statLabel}>INVOICES</Text>
          </View>
          <View style={[styles.statCard, styles.statCardBorder]}>
            <Text style={[styles.statValue, { color: COLORS.green }]}>
              ₹{paidAmt.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.statLabel}>PAID</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.red }]}>
              ₹{dueAmt.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.statLabel}>DUE</Text>
          </View>
        </View>

        {/* Invoice History */}
        <Text style={styles.sectionTitle}>INVOICE HISTORY</Text>

        <View style={styles.invoiceCard}>
          {invoices.length > 0 ? (
            invoices.map((item, idx) => (
              <InvoiceRow
                key={item.id}
                item={item}
                isLast={idx === invoices.length - 1}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No invoices yet.</Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          <Text style={styles.footerBold}>Patient History</Text>
          {" — totals and past invoices for one patient."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.teal,
  },

  // Header
  header: {
    backgroundColor: COLORS.teal,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  backArrow: {
    fontSize: 18,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  headerCenter: {
    flex: 1,
  },
  headerName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.headerText,
    letterSpacing: -0.4,
  },
  headerReg: {
    fontSize: 13,
    color: COLORS.headerSub,
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  editIcon: {
    fontSize: 16,
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
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  statCardBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  statValueNeutral: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginTop: 4,
  },

  // Section title
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.sectionLabel,
    letterSpacing: 1.1,
    marginBottom: -2,
  },

  // Invoice card
  invoiceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  invoiceRow: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  invoiceMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  invoiceRight: {
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  invoiceAmount: {
    fontSize: 15,
    fontWeight: "700",
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
    fontWeight: "600",
  },

  // Footer
  footer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  footerBold: {
    fontWeight: "700",
    color: COLORS.tealDark,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    paddingVertical: 24,
    fontSize: 14,
  },
});
