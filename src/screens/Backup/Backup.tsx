import {useState, useCallback} from 'react';
import {
  View,
  Text,
  Platform,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import DocumentPicker from 'react-native-document-picker';

import COLORS from '../../constants/colors';
import ReusableAlert from '../../components/ReusableAlert';
import {
  exportAllData,
  importAllData,
  type DatabaseBackup,
} from '../../database';

function SectionTitle({title}: {title: string}) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function DataBackupScreen() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const [alert, setAlert] = useState<{
    visible: boolean;
    icon: string;
    title: string;
    message: string;
    buttons: {text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive'}[];
  }>({visible: false, icon: '', title: '', message: '', buttons: []});

  const hideAlert = useCallback(() => setAlert(prev => ({...prev, visible: false})), []);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const backup = await exportAllData();
      const json = JSON.stringify(backup, null, 2);
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(-2);
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const fileName = `Data_Backup_of_Veda_Billing_Book_${dd}${mm}${yy}_${hh}${min}${ss}.json`;
      const basePath = Platform.OS === 'android' ? RNFS.TemporaryDirectoryPath : RNFS.DocumentDirectoryPath;
      const filePath = `${basePath}/${fileName}`;

      await RNFS.writeFile(filePath, json, 'utf8');

      await Share.open({
        urls: [`file://${filePath}`],
        type: 'application/json',
        filename: fileName,
        title: 'Export Database Backup',
        failOnCancel: false,
      });

      setAlert({
        visible: true,
        icon: '✅',
        title: 'Export Complete',
        message: `${fileName} has been exported successfully.`,
        buttons: [{text: 'OK', onPress: hideAlert}],
      });
    } catch (err: any) {
      if (err?.message?.includes('User did not share')) {
      } else {
        setAlert({
          visible: true,
          icon: '❌',
          title: 'Export Failed',
          message: err?.message || 'Something went wrong during export.',
          buttons: [{text: 'OK', onPress: hideAlert}],
        });
      }
    } finally {
      setExporting(false);
    }
  }, [hideAlert]);

  const confirmImport = useCallback(async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.json],
        copyTo: 'cachesDirectory',
      });

      if (!result.fileCopyUri) {
        return;
      }

      const content = await RNFS.readFile(result.fileCopyUri, 'utf8');
      const parsed = JSON.parse(content) as DatabaseBackup;

      if (!parsed.vedabilling_backup || !parsed.tables) {
        setAlert({
          visible: true,
          icon: '⚠️',
          title: 'Invalid File',
          message: 'This is not a valid VedaBilling backup file.',
          buttons: [{text: 'OK', onPress: hideAlert}],
        });
        return;
      }

      const patientCount = parsed.tables.patients?.length || 0;
      const invoiceCount = parsed.tables.invoices?.length || 0;
      const paymentCount = parsed.tables.payments?.length || 0;

      setAlert({
        visible: true,
        icon: '⚠️',
        title: 'Overwrite Existing Data?',
        message: `This backup contains ${patientCount} patients, ${invoiceCount} invoices, and ${paymentCount} payments. Importing will REPLACE all current data. This cannot be undone.`,
        buttons: [
          {text: 'Cancel', style: 'cancel', onPress: hideAlert},
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              hideAlert();
              setImporting(true);
              try {
                const counts = await importAllData(parsed);
                setAlert({
                  visible: true,
                  icon: '✅',
                  title: 'Import Complete',
                  message: `Restored ${counts.patients} patients, ${counts.invoices} invoices, and ${counts.payments} payments. Refresh the app to see changes.`,
                  buttons: [{text: 'OK', onPress: hideAlert}],
                });
              } catch (err: any) {
                setAlert({
                  visible: true,
                  icon: '❌',
                  title: 'Import Failed',
                  message: err?.message || 'Something went wrong during import.',
                  buttons: [{text: 'OK', onPress: hideAlert}],
                });
              } finally {
                setImporting(false);
              }
            },
          },
        ],
      });
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        setAlert({
          visible: true,
          icon: '❌',
          title: 'Error',
          message: err?.message || 'Could not read the selected file.',
          buttons: [{text: 'OK', onPress: hideAlert}],
        });
      }
    }
  }, [hideAlert]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Data & Backup</Text>
        <Text style={styles.headerSub}>Fully offline · manual export & import</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.storageRow}>
            <View style={styles.storageLeft}>
              <Text style={styles.storageTitle}>Local storage</Text>
              <Text style={styles.storageDesc}>
                All invoices & patient data stored on this device
              </Text>
            </View>
            <View style={styles.storageSize}>
              <Text style={styles.storageSizeNum}>100%</Text>
              <Text style={styles.storageSizeUnit}>Offline</Text>
            </View>
          </View>
        </View>

        <SectionTitle title="EXPORT DATABASE" />
        <View style={styles.card}>
          <Text style={styles.exportDesc}>
            Export your complete database (patients, invoices, payments, settings) as
            a JSON backup file. You can share it via Google Drive, WhatsApp, or save
            it locally.
          </Text>
          <TouchableOpacity
            style={[styles.exportBtn, exporting && styles.btnDisabled]}
            activeOpacity={0.85}
            onPress={handleExport}
            disabled={exporting || importing}>
            {exporting ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.exportBtnText}>Exporting...</Text>
              </View>
            ) : (
              <Text style={styles.exportBtnText}>Export Full Database (.json)</Text>
            )}
          </TouchableOpacity>
        </View>

        <SectionTitle title="IMPORT DATABASE" />
        <View style={styles.card}>
          <Text style={styles.exportDesc}>
            Restore a previously exported VedaBilling backup file. This will
            replace all current data on this device.
          </Text>
          <TouchableOpacity
            style={[styles.importBtn, importing && styles.btnDisabled]}
            activeOpacity={0.85}
            onPress={confirmImport}
            disabled={exporting || importing}>
            {importing ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color={COLORS.teal} />
                <Text style={styles.importBtnText}>Importing...</Text>
              </View>
            ) : (
              <Text style={styles.importBtnText}>Import from Backup (.json)</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.importNote}>
            Only .json files exported from VedaBilling are supported.
          </Text>
        </View>

        <View style={styles.infoBanner}>
          <View style={styles.infoBannerBar} />
          <Text style={styles.infoBannerText}>
            PDF copies of every invoice are also saved locally in folders
            organized by year and month, as a second backup layer.
          </Text>
        </View>
      </ScrollView>

      <ReusableAlert
        visible={alert.visible}
        icon={alert.icon}
        title={alert.title}
        message={alert.message}
        buttons={alert.buttons}
        onDismiss={hideAlert}
      />
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
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
    paddingBottom: 90,
    gap: 12,
  },

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
  exportBtn: {
    backgroundColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: COLORS.teal,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  importBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  importBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 0.2,
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
