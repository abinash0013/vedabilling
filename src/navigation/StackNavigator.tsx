import {createNativeStackNavigator} from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';
import PatientHistoryScreen from '../screens/PatientHistoryScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="PatientHistory" component={PatientHistoryScreen} />
    </Stack.Navigator>
  );
}
