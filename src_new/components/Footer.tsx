import {View, Text, TouchableOpacity} from 'react-native';
import {Home, Activity, Settings, Plus} from 'lucide-react-native';

export default function Footer({activeTab, navigation}: any) {
  return (
    <View className="absolute bottom-0 w-full items-center">
      {/* Container */}
      <View className="w-[100%] bg-white rounded-[20px] px-6 py-4 flex-row justify-between items-center shadow-lg">
        {/* HOME */}
        <TabItem
          icon={Home}
          label="Home"
          active={activeTab === 'home'}
          onPress={() => navigation.navigate('home')}
        />

        {/* CLINICAL */}
        <TabItem
          icon={Activity}
          label="Clinical"
          active={activeTab === 'clinical'}
          onPress={() => navigation.navigate('clinical')}
        />

        {/* CENTER BUTTON */}
        <View className="absolute -top-4 left-[50%]">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-teal-600 items-center justify-center shadow-xl"
            onPress={() => navigation.navigate('logSession')}>
            <Plus color="white" size={18} />
          </TouchableOpacity>
        </View>

        {/* SETTINGS */}
        <TabItem
          icon={Settings}
          label="Settings"
          active={activeTab === 'settings'}
          onPress={() => navigation.navigate('settings')}
        />
      </View>
    </View>
  );
}

const TabItem = ({icon: Icon, label, active, onPress}: any) => (
  <TouchableOpacity onPress={onPress} className="items-center">
    <Icon size={22} color={active ? '#0f766e' : '#9ca3af'} />
    <Text
      className={`text-xs mt-1 ${active ? 'text-teal-700' : 'text-gray-400'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);
