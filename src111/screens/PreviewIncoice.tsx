import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const COLORS = {
  teal: '#2E7D72',
  tealDark: '#1F5C56',
  tealLight: '#D6EAE7',
  bg: '#EFF5F4',
  card: '#FFFFFF',
  placeholder: '#AABFBC',
  textPrimary: '#1A2E2B',
  textSecondary: '#7A9490',
  textMuted: '#9AAFAC',
  border: '#E8F0EF',
  dashed: '#C8DEDA',
  amber: '#A07820',
  amberBg: '#FEF8EC',
  amberBorder: '#D4A82A',
  headerText: '#FFFFFF',
  headerSub: 'rgba(255,255,255,0.75)',
  tealBg: '#EBF4F2',
};

function SectionCard({title, onEdit, children}: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Row({label, value, bold, dimLabel}: any) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, dimLabel && styles.rowLabelDim]}>
        {label}
      </Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>
        {value}
      </Text>
    </View>
  );
}

function DashedDivider() {
  return <View style={styles.dashedDivider} />;
}

export default function ReviewInvoiceScreen({navigation, route}: any) {
  const {patient, billing, amount, note, therapist} = route.params || {
    note: '',
    therapist: '',
    patient: {name: '', reg: ''},
    billing: {
      invoiceNo: '',
      date: '',
      due: '',
      type: '',
      service: '',
      items: [],
    },
    amount: {
      total: 0,
      discount: 0,
      payable: 0,
      payments: [],
      totalPaid: 0,
      extraPaid: 0,
      balanceDue: 0,
      status: 'Pending',
    },
  };
  const handleEdit = () => {
    navigation.goBack();
  };

  const handleGenerate = async () => {
    try {
      const fmt = (n: number) => '\u20B9' + Number(n).toLocaleString('en-IN');
      const paymentsHtml = (amount.payments || [])
        .map(
          (p: any) =>
            `<tr><td style="padding:8px 12px;color:#7A9490;font-size:13px">Paid — ${
              p.method
            }</td><td style="padding:8px 12px;text-align:right;font-size:13px;color:#1A2E2B">${fmt(
              p.amount,
            )}</td></tr>`,
        )
        .join('');

      const h = [
        '<html><head><style>',
        'body{font-family:Helvetica Neue,Helvetica,Arial,sans-serif;margin:0;padding:0;color:#1A2E2B;background:#EFF5F4}',
        '.card{max-width:400px;margin:20px auto;background:#FFF;border-radius:16px;overflow:hidden}',
        '.clinic-hdr{background:#2E7D72;padding:16px;display:flex;gap:12px;align-items:flex-start}',
        '.logo{width:52px;height:52px;border-radius:12px;background:#FFF;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}',
        '.clinic-info{flex:1}',
        '.clinic-name{font-size:18px;font-weight:800;color:#FFF;letter-spacing:-0.3px;margin:0}',
        '.tagline{font-size:12px;color:rgba(255,255,255,0.8);font-style:italic;margin:2px 0 0}',
        '.contact{font-size:11px;color:rgba(255,255,255,0.7);margin:5px 0 0;line-height:16px}',
        '.label-row{background:#1F5C56;padding:10px 16px;display:flex;justify-content:space-between;align-items:center}',
        '.label{font-size:11px;font-weight:800;color:#FFF;letter-spacing:1px}',
        '.inv-no{font-size:12px;font-weight:700;color:rgba(255,255,255,0.85)}',
        '.dates{padding:12px 16px;display:flex;justify-content:space-between;border-bottom:1px solid #E2EDEB}',
        '.date-text{font-size:12px;color:#7A9490}',
        '.patient-box{margin:12px;background:#F0F7F6;border-radius:10px;padding:12px}',
        '.patient-name{font-size:15px;font-weight:800;color:#1A2E2B;margin:0}',
        '.patient-id{font-size:12px;color:#7A9490;margin:3px 0 0}',
        'table{width:100%;border-collapse:collapse;margin:0 12px;width:calc(100% - 24px)}',
        'th{padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#2E7D72;letter-spacing:0.5px;background:#E8F2F0;border-radius:8px}',
        '.amt-cell{text-align:right}',
        '.center{text-align:center}',
        'td{padding:12px;font-size:13px;color:#1A2E2B;border-bottom:1px solid #E2EDEB}',
        '.amount-box{margin:12px;border:1px solid #E2EDEB;border-radius:10px;padding:14px}',
        '.amt-row{display:flex;justify-content:space-between;padding:5px 0}',
        '.amt-label{font-size:13px;color:#7A9490}',
        '.amt-val{font-size:13px;color:#1A2E2B}',
        '.amt-bold{font-size:15px;font-weight:800;color:#1A2E2B}',
        '.dashed{height:1px;border-top:1px dashed #C8DEDA;margin:8px 0}',
        '.status-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0}',
        '.badge{background:#FDECEB;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;color:#C0392B}',
        '.note-section{margin:12px 16px;background:#F0F9F7;border-radius:10px;padding:12px}',
        '.note-label{font-size:11px;font-weight:700;color:#1A7866;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}',
        '.note-text{font-size:13px;color:#1A2E2B;line-height:18px}',
        '.insurance{margin:12px;background:#FEF8EC;border-radius:10px;padding:12px;display:flex;gap:8px}',
        '.ins-bar{width:3px;border-radius:4px;background:#D4A82A;flex-shrink:0}',
        '.ins-text{flex:1;font-size:12px;color:#7A5C10;line-height:18px;font-style:italic}',
        '.footer{font-size:11px;color:#9AAFAC;text-align:center;padding:8px 12px 16px;line-height:16px}',
        '</style></head><body>',
        '<div class="card">',

        // Clinic header
        '<div class="clinic-hdr">',
        '<div class="logo">🌿</div>',
        '<div class="clinic-info">',
        '<p class="clinic-name">VedaMotion Care</p>',
        '<p class="tagline">Where Every Move Heals</p>',
        '<p class="contact">+91 8875115254 · vedamotioncare@gmail.com ·<br>www.vedamotioncare.in</p>',
        '</div></div>',

        // E-Bill label row
        '<div class="label-row">',
        '<span class="label">E-BILL / INVOICE</span>',
        '<span class="inv-no">' + billing.invoiceNo + '</span></div>',

        // Dates
        '<div class="dates">',
        '<span class="date-text">Invoice Date: ' + billing.date + '</span>',
        '<span class="date-text">Due Date: ' + billing.due + '</span></div>',

        // Patient
        '<div class="patient-box">',
        '<p class="patient-name">' + patient.name + '</p>',
        '<p class="patient-id">Patient ID: ' + patient.reg + '</p>',
        '<p class="patient-id" style="margin-top:3px">' +
          (therapist || 'Dr. Yash Pratihasta, PT') +
          '</p></div>',

        // Service items table
        '<table><tr>',
        '<th style="width:50%">DESCRIPTION</th>',
        '<th class="center" style="width:25%">TYPE</th>',
        '<th class="amt-cell" style="width:25%">AMOUNT</th>',
        '</tr>' +
          (billing.items && billing.items.length > 0
            ? billing.items
                .map(
                  (it: any) =>
                    `<tr><td style="width:50%">${
                      it.name
                    }</td><td class="center" style="width:25%;color:#7A9490">${
                      billing.type
                    }</td><td class="amt-cell" style="width:25%">${fmt(
                      it.amount,
                    )}</td></tr>`,
                )
                .join('')
            : `<tr><td style="width:50%">${
                billing.service
              }</td><td class="center" style="width:25%;color:#7A9490">${
                billing.type
              }</td><td class="amt-cell" style="width:25%">${fmt(
                amount.total,
              )}</td></tr>`) +
          '</table>',

        // Amount breakdown
        '<div class="amount-box">',
        '<div class="amt-row"><span class="amt-label">Total Amount</span><span class="amt-val">' +
          fmt(amount.total) +
          '</span></div>',
        amount.discount > 0
          ? '<div class="amt-row"><span class="amt-label">Discount</span><span class="amt-val">– ' +
            fmt(amount.discount) +
            '</span></div>'
          : '',
        '<div class="dashed"></div>',
        '<div class="amt-row"><span class="amt-bold">Payable Amount</span><span class="amt-bold">' +
          fmt(amount.payable) +
          '</span></div>',
        paymentsHtml,
        '<div class="amt-row"><span class="amt-label">Total Paid</span><span class="amt-val">' +
          fmt(amount.totalPaid) +
          '</span></div>',
        amount.extraPaid > 0
          ? '<div class="amt-row"><span class="amt-label">Extra Paid</span><span class="amt-val">' +
            fmt(amount.extraPaid) +
            '</span></div>'
          : amount.totalPaid > 0
          ? '<div class="amt-row"><span class="amt-label">Advance Paid</span><span class="amt-val">' +
            fmt(amount.totalPaid) +
            '</span></div>'
          : '',
        '<div class="amt-row"><span class="amt-label">Balance Due</span><span class="amt-val">' +
          fmt(amount.balanceDue) +
          '</span></div>',
        '<div class="status-row"><span class="amt-label">Payment Status</span><span class="badge">' +
          amount.status +
          '</span></div>',
        '</div>',

        // Note / Remarks
        note
          ? '<div class="note-section"><div class="note-label">Note / Remarks</div><div class="note-text">' +
            note +
            '</div></div>'
          : '',
        // Insurance clause
        '<div class="insurance">',
        '<div class="ins-bar"></div>',
        '<div class="ins-text">This is a valid e-bill generated by VedaMotion Care. To verify its authenticity, please email vedamotioncare@gmail.com quoting the invoice number. A confirmation will be sent after the bill is verified against our records.</div>',
        '</div>',

        // Footer
        '<div class="footer">VedaMotion Care · Service & Payment Policy applies · Where Every Move Heals</div>',

        '</div></body></html>',
      ].join('');

      const pdf = await RNHTMLtoPDF.convert({
        html: h,
        fileName: `Invoice_${billing.invoiceNo.replace(/\//g, '-')}`,
      });

      if (!pdf.filePath) {
        Alert.alert('Error', 'Failed to generate PDF. Please try again.');
        return;
      }

      navigation.navigate('EBillGenerated', {
        pdfPath: pdf.filePath,
        patient,
        billing,
        amount,
        note,
        therapist,
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        Alert.alert(
          'Error',
          error?.message || 'Something went wrong while generating PDF.',
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Review Invoice</Text>
          <Text style={styles.headerSub}>Before generating PDF</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Info banner */}
        <View style={styles.banner}>
          <View style={styles.bannerBar} />
          <Text style={styles.bannerText}>
            This is the in-app summary before the e-bill is generated. Tap any
            section's pencil to jump back and edit — nothing is final until you
            tap Generate PDF.
          </Text>
        </View>

        {/* Patient section */}
        <SectionCard title="Patient">
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientReg}>{patient.reg}</Text>
        </SectionCard>

        {/* Therapist section */}
        {therapist ? (
          <SectionCard title="Physiotherapist">
            <Text style={styles.patientName}>{therapist}</Text>
          </SectionCard>
        ) : null}

        {/* Billing section */}
        <SectionCard title="Invoice Details">
          <Row label="Invoice No." value={billing.invoiceNo} dimLabel />
          <Row label="Invoice Date" value={billing.date} dimLabel />
          <Row label="Due Date" value={billing.due} dimLabel />
          <Row label="Billing Type" value={billing.type} dimLabel />
          <View style={styles.spacer} />
          <Text style={styles.sectionSubLabel}>SERVICES</Text>
          {(billing.items && billing.items.length > 0
            ? billing.items
            : [{name: billing.service, amount: amount.total}]
          ).map((it: any, idx: number) => (
            <Row
              key={idx}
              label={it.name}
              value={`₹${(it.amount || 0).toLocaleString('en-IN')}`}
              dimLabel
            />
          ))}
        </SectionCard>

        {/* Amount section */}
        <SectionCard title="Amount">
          <Row
            label="Total Amount"
            value={`₹${amount.total.toLocaleString('en-IN')}`}
            dimLabel
          />
          {amount.discount > 0 && (
            <Row
              label="Discount"
              value={`– ₹${amount.discount.toLocaleString('en-IN')}`}
              dimLabel
            />
          )}

          <DashedDivider />

          <Row
            label="Payable Amount"
            value={`₹${amount.payable.toLocaleString('en-IN')}`}
            bold
          />

          <View style={styles.spacer} />

          {amount.payments.map((p: any, i: any) => (
            <Row
              key={i}
              label={`Paid — ${p.method}`}
              value={`₹${p.amount.toLocaleString('en-IN')}`}
              dimLabel
            />
          ))}
          <Row
            label="Total Paid"
            value={`₹${amount.totalPaid.toLocaleString('en-IN')}`}
            dimLabel
          />
          {amount.extraPaid > 0 ? (
            <Row
              label="Extra Paid"
              value={`₹${amount.extraPaid.toLocaleString('en-IN')}`}
              dimLabel
            />
          ) : amount.totalPaid > 0 ? (
            <Row
              label="Advance Paid"
              value={`₹${amount.totalPaid.toLocaleString('en-IN')}`}
              dimLabel
            />
          ) : null}
          <Row
            label="Balance Due"
            value={`₹${amount.balanceDue.toLocaleString('en-IN')}`}
            dimLabel
          />

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Payment Status</Text>
            <View
              style={[
                styles.statusBadge,
                amount.status === 'Paid' && {backgroundColor: '#E8F5EC'},
                amount.status === 'Partial' && {backgroundColor: '#FEF3E2'},
                amount.status === 'Pending' && {backgroundColor: '#FDECEB'},
              ]}>
              <Text
                style={[
                  styles.statusBadgeText,
                  amount.status === 'Paid' && {color: '#27AE60'},
                  amount.status === 'Partial' && {color: '#E67E22'},
                  amount.status === 'Pending' && {color: '#C0392B'},
                ]}>
                {amount.status}
              </Text>
            </View>
          </View>
        </SectionCard>

        {note ? (
          <SectionCard title="Remarks">
            <Text style={styles.remarksText}>{note}</Text>
          </SectionCard>
        ) : null}
      </ScrollView>

      {/* Sticky bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.editInvoiceBtn}
          activeOpacity={0.8}
          onPress={handleEdit}>
          <Text style={styles.editInvoiceBtnText}>Edit Invoice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.generateBtn}
          activeOpacity={0.85}
          onPress={handleGenerate}>
          <Text style={styles.generateBtnText}>Generate PDF & Share</Text>
        </TouchableOpacity>
        <Text style={styles.bottomNote}>
          You can still edit and re-share after this step.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.teal},

  // Header
  header: {
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backArrow: {fontSize: 18, color: '#FFF', lineHeight: 22},
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.headerText,
    letterSpacing: -0.4,
  },
  headerSub: {fontSize: 13, color: COLORS.headerSub, marginTop: 2},

  // Scroll
  scroll: {flex: 1, backgroundColor: COLORS.bg},
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 12,
  },

  // Banner
  banner: {
    backgroundColor: COLORS.amberBg,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  bannerBar: {
    width: 3,
    borderRadius: 4,
    backgroundColor: COLORS.amberBorder,
    flexShrink: 0,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.amber,
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  editBtn: {flexDirection: 'row', alignItems: 'center', gap: 4},
  editIcon: {fontSize: 14},
  editText: {fontSize: 13, fontWeight: '700', color: COLORS.teal},

  // Patient
  patientName: {fontSize: 15, fontWeight: '700', color: COLORS.textPrimary},
  patientReg: {fontSize: 13, color: COLORS.textSecondary},

  // Row
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {fontSize: 14, color: COLORS.textPrimary, flex: 1},
  rowLabelDim: {color: COLORS.textSecondary},
  rowValue: {fontSize: 14, color: COLORS.textPrimary, textAlign: 'right'},
  rowValueBold: {fontWeight: '800', fontSize: 16},

  // Dashed divider
  dashedDivider: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.dashed,
    marginVertical: 2,
  },

  spacer: {height: 4},
  sectionSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 0.8,
    marginBottom: 2,
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusLabel: {fontSize: 14, color: COLORS.textSecondary},
  statusBadge: {
    backgroundColor: COLORS.tealLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusBadgeText: {fontSize: 12, fontWeight: '700', color: COLORS.teal},

  // Note
  noteBtn: {
    marginHorizontal: 0,
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  noteBtnText: {fontSize: 14, fontWeight: '700', color: COLORS.teal},

  // Bottom bar
  bottomBar: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editInvoiceBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editInvoiceBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.teal,
  },
  generateBtn: {
    backgroundColor: COLORS.teal,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: COLORS.teal,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.1,
  },
  bottomNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  remarksText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
});
