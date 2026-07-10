import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {View} from 'react-native';

import Dashboard from '../screens/Dashboard';
import PatientsList from '../screens/PatientListScreen';
import InvoiceListScreen from '../screens/InvoiceListScreen';
import SettingsScreen from '../screens/Settings';

import {LayoutDashboard, FileText, Settings, Users} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const iconOptions: BottomTabNavigationOptions = {
    tabBarStyle: {
      height: 75,
      paddingBottom: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6',
    },
    tabBarActiveTintColor: '#1A5C52',
    tabBarInactiveTintColor: '#9ca3af',
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '900',
    },
  };

  return (
    <View style={{flex: 1}}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          ...iconOptions,
        }}>
        <Tab.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            tabBarIcon: ({color}: {color: string}) => (
              <LayoutDashboard size={20} color={color} />
            ),
          }}
        />
          <Tab.Screen
            name="Patients"
            component={PatientsList}
            options={{
              tabBarIcon: ({color}: {color: string}) => (
                <Users size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Invoices"
            component={InvoiceListScreen}
            options={{
              tabBarIcon: ({color}: {color: string}) => (
                <FileText size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({color}: {color: string}) => (
                <Settings size={20} color={color} />
              ),
            }}
          />
      </Tab.Navigator>
    </View>
  );
}
