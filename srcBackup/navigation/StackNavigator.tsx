import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import PatientHistoryScreen from "../screens/Patient/PatientHistoryScreen";
import NewInvoiceStep2 from "./../screens/Invoice/NewInvoice";
import ReviewInvoiceScreen from "./../screens/Invoice/PreviewIncoice";
import EBillGeneratedScreen from "./../screens/Ebill/EbillgeneratedScreen";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="PatientHistory" component={PatientHistoryScreen} />
      <Stack.Screen name="NewInvoice" component={NewInvoiceStep2} />
      <Stack.Screen name="PreviewInvoice" component={ReviewInvoiceScreen} />
      <Stack.Screen name="EBillGenerated" component={EBillGeneratedScreen} />
    </Stack.Navigator>
  );
}
