import {
  View,
  Text,
  Modal,
  Alert,
  Platform,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  PermissionsAndroid,
  KeyboardAvoidingView,
} from "react-native";
import { useState, useCallback } from "react";
import { Plus, X, Download } from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import RNFS from "react-native-fs";
import Share from "react-native-share";

import { getAllInvoices, getAllPatients, insertPatient } from "../../database";
import type { InvoiceSummary, PatientListItem } from "../../types";

import BASE from "./../../constants/colors";

const COLORS = {
  ...BASE,
  tealBorder: "#2E7D72",
  plusBtn: "rgba(255,255,255,0.25)",
  stepNum: "#7A9490",
  hint: "#7A9490",
};

const parseAmt = (s: string) => Number(s.replace(/[^0-9]/g, ""));

const statusStyles: Record<string, { bg: string; text: string }> = {
  Paid: { bg: COLORS.greenLight, text: COLORS.green },
  Partial: { bg: COLORS.violetLight, text: COLORS.violet },
  Unpaid: { bg: COLORS.redLight, text: COLORS.red },
  "Over Paid": { bg: COLORS.cyanLight, text: COLORS.cyan },
  "Advance Paid": { bg: COLORS.skyBlueLight, text: COLORS.skyBlue },
  "Partial Paid": { bg: COLORS.violetLight, text: COLORS.violet },
  Due: { bg: COLORS.orangeLight, text: COLORS.orange },
};

function StatCard({ label, value, bgColor, textColor }: any) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: textColor + "D9" }]}>
        {label}
      </Text>
    </View>
  );
}

function Avatar({ name }: any) {
  const parts = (name || "").trim().split(/\s+/);
  const initials =
    parts.length > 1
      ? (parts[0][0] || "") + (parts[parts.length - 1][0] || "")
      : parts[0]?.[0] || "?";
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
  const s = statusStyles[status] || statusStyles.Paid;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{status}</Text>
    </View>
  );
}

function InvoiceRow({ item, isLast }: any) {
  return (
    <View style={[styles.invoiceRow, isLast && styles.invoiceRowLast]}>
      <View style={styles.invoiceRowInner}>
        <Avatar name={item.name} />
        <View style={styles.invRowLeft}>
          <Text style={styles.invoiceName}>{item.name}</Text>
          <Text style={styles.invoiceMeta}>{item.reg}</Text>
          <Text style={styles.invoiceMeta}>{item.invoice}</Text>
        </View>
        <View style={styles.invRowRight}>
          <Text style={styles.invoiceAmount}>{item.amount}</Text>
          <Text style={[styles.invoiceMeta, { textAlign: "right" }]}>
            {item.date}
          </Text>
          <StatusBadge status={item.status} />
        </View>
      </View>
    </View>
  );
}

function PatientRow({ item, isLast, onSelect }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.patientRow, isLast && styles.patientRowLast]}
      onPress={() => onSelect(item)}
    >
      <Avatar name={item.name} />
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientMeta}>
          {item.reg} · Last visit {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Dashboard() {
  const navigation = useNavigation<any>();
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newRegNumber, setNewRegNumber] = useState("");
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [patients, setPatients] = useState<PatientListItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [invList, patList] = await Promise.all([
        getAllInvoices(),
        getAllPatients(),
      ]);
      setInvoices(invList);
      setPatients(patList);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const paidTotal = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + parseAmt(i.amount), 0);
  const partialTotal = invoices
    .filter((i) => i.status === "Partial")
    .reduce(
      (sum, i) =>
        sum + ((i.payable ?? parseAmt(i.amount)) - (i.totalPaid ?? 0)),
      0,
    );
  const unpaidTotal = invoices
    .filter((i) => i.status === "Unpaid")
    .reduce((sum, i) => sum + parseAmt(i.amount), 0);

  const stats = [
    {
      label: "PAID",
      value: `${
        invoices.filter((i) => i.status === "Paid").length
      } · ₹${paidTotal.toLocaleString("en-IN")}`,
      bgColor: COLORS.greenLight,
      textColor: COLORS.green,
    },
    {
      label: "PARTIAL",
      value: `${
        invoices.filter((i) => i.status === "Partial").length
      } · ₹${partialTotal.toLocaleString("en-IN")}`,
      bgColor: COLORS.violetLight,
      textColor: COLORS.violet,
    },
    {
      label: "UNPAID",
      value: `${
        invoices.filter((i) => i.status === "Unpaid").length
      } · ₹${unpaidTotal.toLocaleString("en-IN")}`,
      bgColor: COLORS.redLight,
      textColor: COLORS.red,
    },
  ];

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.reg.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelectPatient = (patient: PatientListItem) => {
    navigation.navigate("NewInvoice", { patient });
    setInvoiceModal(false);
  };

  const handleUseNewPatient = async () => {
    if (!newName.trim()) {
      Alert.alert("Required", "Please enter the patient's full name.");
      return;
    }
    const phoneDigits = newPhone.replace(/\D/g, "");
    if (newPhone.trim() && phoneDigits.length !== 10) {
      Alert.alert("Error", "Phone number must be exactly 10 digits.");
      return;
    }
    try {
      const reg = newRegNumber.trim()
        ? `VMCPTREG-${newRegNumber.trim()}`
        : undefined;
      const saved = await insertPatient({
        name: newName.trim(),
        phone: newPhone.trim(),
        address: newAddress,
        reg,
      });
      await loadData();
      navigation.navigate("NewInvoice", { patient: saved });
      setInvoiceModal(false);
      setNewName("");
      setNewPhone("");
      setNewAddress("");
      setNewRegNumber("");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to create patient.");
    }
  };

  const handleExport = async () => {
    if (Platform.OS === "android" && (Platform.Version as number) < 29) {
      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "VedaBill needs storage access to export invoices.",
            buttonPositive: "Allow",
            buttonNegative: "Deny",
          },
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Permission Required",
            "Storage permission is required to export invoices.",
          );
          return;
        }
      } catch {
        return;
      }
    }
    const csvHeader = "Name,Patient ID,Date,Invoice ID,Amount,Payment Status\n";
    const csvRows = invoices
      .map(
        (i) =>
          `${i.name},${i.reg},${i.date},${i.invoice},${i.amount.replace(
            "₹",
            "",
          )},${i.status}`,
      )
      .join("\n");
    const csv = csvHeader + csvRows;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const fyStart = currentMonth >= 4 ? currentYear : currentYear - 1;
    const fyEnd = fyStart + 1;
    const fy = `${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`;
    const fileName = `Invoice_VMC_${fy}_${dd}_${mm}_${hh}${min}${ss}.csv`;
    try {
      const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      await RNFS.writeFile(destPath, csv, "utf8");
      try {
        await RNFS.scanFile(destPath);
      } catch {}
      Alert.alert(
        "Exported",
        `CSV saved to ${
          Platform.OS === "android" ? "Downloads" : "Documents"
        } as ${fileName}.`,
      );
    } catch (error: any) {
      // Direct write to Downloads failed (Android 11+ scoped storage).
      // Fall back to app-external directory + share sheet.
      try {
        const fallbackPath = `${RNFS.ExternalDirectoryPath}/${fileName}`;
        await RNFS.writeFile(fallbackPath, csv, "utf8");
        await Share.open({
          urls: [`file://${fallbackPath}`],
          type: "text/csv",
          failOnCancel: false,
        });
        Alert.alert(
          "Exported",
          "CSV saved. Use Save to Files from the share sheet to store it in Downloads.",
        );
      } catch (shareError: any) {
        if (shareError?.message !== "User did not share") {
          Alert.alert("Error", shareError?.message || "Failed to export.");
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Good evening, Dr. Yash</Text>
          <Text style={styles.headerSub}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <StatCard
              key={s.label}
              bgColor={s.bgColor}
              textColor={s.textColor}
              label={s.label}
              value={s.value}
            />
          ))}
        </View>

        {/* Recent Invoices */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT INVOICES</Text>
          {invoices.length > 0 && (
            <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
              <Download size={14} color={COLORS.teal} strokeWidth={2.5} />
              <Text style={styles.exportBtnText}>Export</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.invoiceCard}>
          {invoices.slice(0, 5).map((item, idx) => (
            <InvoiceRow
              key={item.invoice}
              item={item}
              isLast={idx === Math.min(invoices.length, 5) - 1}
            />
          ))}
          {invoices.length > 5 && (
            <TouchableOpacity onPress={() => navigation.navigate("Invoices")}>
              <Text style={styles.viewAll}>View all invoices...</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* New Invoice FAB */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fab}
        onPress={() => setInvoiceModal(true)}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>New Invoice</Text>
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      {/* New Invoice Modal */}
      <Modal
        visible={invoiceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setInvoiceModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Invoice</Text>
              <TouchableOpacity onPress={() => setInvoiceModal(false)}>
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Step indicator */}
              <Text style={styles.stepLabel}>1</Text>

              {/* Search */}
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or patient ID..."
                placeholderTextColor={COLORS.placeholder}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />

              <Text style={styles.hint}>
                Tap a patient to auto-fill their details, or add a new one
                below.
              </Text>

              {/* Patient list */}
              <View style={styles.listCard}>
                {filtered.length > 0 ? (
                  filtered.map((item, idx) => (
                    <PatientRow
                      key={item.reg}
                      item={item}
                      isLast={idx === filtered.length - 1}
                      onSelect={handleSelectPatient}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    No patients match your search.
                  </Text>
                )}
              </View>

              {/* OR ADD A NEW PATIENT */}
              <Text style={styles.orSectionTitle}>OR ADD A NEW PATIENT</Text>

              <View style={styles.newPatientCard}>
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>FULL NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="e.g. Meena Agarwal"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>PATIENT ID (OPTIONAL)</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: COLORS.textSecondary,
                      }}
                    >
                      VMCPTREG-
                    </Text>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={newRegNumber}
                      onChangeText={setNewRegNumber}
                      keyboardType="number-pad"
                      placeholder="1234"
                      placeholderTextColor={COLORS.placeholder}
                    />
                  </View>
                </View>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>PHONE (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    value={newPhone}
                    onChangeText={setNewPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={[styles.fieldWrapper, styles.fieldLast]}>
                  <Text style={styles.fieldLabel}>ADDRESS (OPTIONAL)</Text>
                  <TextInput
                    style={styles.input}
                    value={newAddress}
                    onChangeText={setNewAddress}
                    placeholder="For insurance documentation"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>
              </View>

              {/* Use This New Patient button */}
              <TouchableOpacity
                style={styles.useBtn}
                activeOpacity={0.85}
                onPress={handleUseNewPatient}
              >
                <Text style={styles.useBtnText}>Use This New Patient</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.headerText,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.headerSub,
    marginTop: 2,
  },
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },

  // avatar
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 100,
    backgroundColor: COLORS.tealLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 21,
    fontWeight: "700",
    color: COLORS.teal,
    letterSpacing: 0.5,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 4,
    textAlign: "center",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.4,
    textAlign: "center",
  },

  // Section title
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.teal,
    letterSpacing: 1.2,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.teal,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.teal,
  },

  // Invoice card container
  invoiceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  viewAll: {
    textAlign: "center",
    color: COLORS.teal,
    paddingVertical: 12,
    fontWeight: "600",
    fontSize: 13,
  },

  invoiceRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  invoiceRowLast: { borderBottomWidth: 0 },
  invoiceRowInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  invRowLeft: { flex: 1, gap: 4 },
  invRowRight: { alignItems: "flex-end", gap: 4, flexShrink: 0 },

  invoiceName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  invoiceMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  invoiceAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  modalHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  modalBody: {
    flexGrow: 0,
  },

  // Step label
  stepLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.stepNum,
    marginBottom: 10,
  },

  // Search
  searchInput: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },

  // Hint
  hint: {
    fontSize: 13,
    color: COLORS.hint,
    lineHeight: 18,
    marginBottom: 12,
  },

  // Patient list
  listCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  patientRowLast: {
    borderBottomWidth: 0,
  },
  patientInfo: {
    flex: 1,
    gap: 3,
  },
  patientName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  patientMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    paddingVertical: 20,
    fontSize: 13,
  },

  // Section title
  orSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.sectionLabel,
    letterSpacing: 1.1,
    marginTop: 16,
    marginBottom: 10,
  },

  // New patient card
  newPatientCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLast: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.label,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  // Use button
  useBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.tealBorder,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 14,
  },
  useBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.teal,
    letterSpacing: 0.1,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 15,
    bottom: 4,
    // width: 56,
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 28,
    backgroundColor: COLORS.teal,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
});
