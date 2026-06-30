import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';
import {StatusBar} from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#F5F6FA" />
        <StackNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
