import {useState, useCallback} from 'react';
import {View, Text, Platform} from 'react-native';

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import DocumentPicker from 'react-native-document-picker';

import ScreenWrapper from '../../components/ScreenWrapper';
import LoadingButton from '../../components/LoadingButton';
import ReusableAlert from '../../components/ReusableAlert';
import {
  exportAllData,
  importAllData,
  type DatabaseBackup,
} from '../../database';

import styles from './styles';

function SectionTitle({title}: {title: string}) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const DataBackupScreen = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const [alert, setAlert] = useState<{
    visible: boolean;
    icon: string;
    title: string;
    message: string;
    buttons: {
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }[];
  }>({visible: false, icon: '', title: '', message: '', buttons: []});

  const hideAlert = useCallback(
    () => setAlert(prev => ({...prev, visible: false})),
    [],
  );

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
      const basePath =
        Platform.OS === 'android'
          ? RNFS.TemporaryDirectoryPath
          : RNFS.DocumentDirectoryPath;
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
                  message:
                    err?.message || 'Something went wrong during import.',
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
    <ScreenWrapper
      title="Data & Backup"
      subtitle="Fully offline · manual export & import"
      footer={
        <ReusableAlert
          visible={alert.visible}
          icon={alert.icon}
          title={alert.title}
          message={alert.message}
          buttons={alert.buttons}
          onDismiss={hideAlert}
        />
      }>
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
          Export your complete database (patients, invoices, payments, settings)
          as a JSON backup file. You can share it via Google Drive, WhatsApp, or
          save it locally.
        </Text>
        <LoadingButton
          label="Export Full Database (.json)"
          loadingLabel="Exporting..."
          loading={exporting}
          disabled={importing}
          onPress={handleExport}
        />
      </View>

      <SectionTitle title="IMPORT DATABASE" />
      <View style={styles.card}>
        <Text style={styles.exportDesc}>
          Restore a previously exported VedaBilling backup file. This will
          replace all current data on this device.
        </Text>
        <LoadingButton
          label="Import from Backup (.json)"
          loadingLabel="Importing..."
          loading={importing}
          disabled={exporting}
          onPress={confirmImport}
          variant="outlined"
        />
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
    </ScreenWrapper>
  );
};

export default DataBackupScreen;
