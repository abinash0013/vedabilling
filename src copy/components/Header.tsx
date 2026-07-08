import {Text, TouchableOpacity, View} from 'react-native';
import {Bell} from 'lucide-react-native';

const Header = () => {
  return (
    <View>
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 8,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#0d9488',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: '#fff', fontWeight: '700', fontSize: 16}}>
              Y
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: '#0d9488',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}>
            Vedamotion Care
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Bell size={22} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
