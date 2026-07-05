import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import { StatusBar, Platform, Alert, PermissionsAndroid } from "react-native";
import { useEffect } from "react";

async function requestStoragePermission() {
  if (Platform.OS !== "android") return true;
  // Android 10+ (API 29+) uses scoped storage — no WRITE_EXTERNAL_STORAGE needed
  if ((Platform.Version as number) >= 29) return true;
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Storage Permission",
        message:
          "VedaBill needs storage access to download and save PDF invoices.",
        buttonPositive: "Allow",
        buttonNegative: "Deny",
      },
    );
    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        "Permission Required",
        "Storage permission is permanently denied. Please enable it in your device Settings > Apps > VedaBill > Permissions.",
      );
    }
    return false;
  } catch {
    return false;
  }
}

export default function App() {
  useEffect(() => {
    requestStoragePermission();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#2E7D72" />
        <StackNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
