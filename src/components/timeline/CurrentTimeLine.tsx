import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

export function CurrentTimeLine() {
  const { colors } = useTheme();
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center' }} pointerEvents="none">
      <View style={{ width: 52, alignItems: 'flex-end', paddingRight: 8 }}>
        <Text style={{ fontSize: 12, color: colors.nowLine, fontWeight: '500' }}>{currentTime}</Text>
      </View>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.nowLine, marginRight: 6 }} />
      <View style={{ flex: 1, height: 1, backgroundColor: colors.nowLine, marginRight: 16, opacity: 0.8 }} />
    </View>
  );
}
