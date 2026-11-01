import { createNativeStackNavigator } from "@react-navigation/native-stack";

import BottomTabs from "./BottomTabs";
import NewInvoiceStep2 from "../screens/Invoice/NewInvoice";
import ReviewInvoiceScreen from "../screens/Invoice/PreviewIncoice";
import EBillGeneratedScreen from "../screens/Ebill/EbillgeneratedScreen";
import PatientHistory from "../screens/Patient/PatientHistory";
import AccountPaymentHistory from "../screens/Patient/AccountPaymentHistory";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen name="PatientHistory" component={PatientHistory} />
      <Stack.Screen
        name="AccountPaymentHistory"
        component={AccountPaymentHistory}
      />
      <Stack.Screen name="NewInvoice" component={NewInvoiceStep2} />
      <Stack.Screen name="PreviewInvoice" component={ReviewInvoiceScreen} />
      <Stack.Screen name="EBillGenerated" component={EBillGeneratedScreen} />
    </Stack.Navigator>
  );
}
