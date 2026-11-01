import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/CustomTabBar';

import Dashboard from '../screens/Dashboard/Dashboard';
import PatientsList from '../screens/Patient/PatientList';
import InvoiceListScreen from '../screens/Invoice/InvoiceListScreen';
import PaymentReceipts from '../screens/Payments/PaymentReceipts';
import SettingsScreen from '../screens/Settings/Settings';
import DataBackupScreen from '../screens/Backup/Backup';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Patients" component={PatientsList} />
      <Tab.Screen name="Invoices" component={InvoiceListScreen} />
      <Tab.Screen name="Payments" component={PaymentReceipts} />
      <Tab.Screen name="Backup" component={DataBackupScreen} />
      <Tab.Screen name="Profile" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
