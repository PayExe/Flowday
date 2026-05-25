import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

export const HOUR_HEIGHT = 60;
export const START_HOUR = 6;
export const END_HOUR = 23;

interface HourMarkerProps {
  hour: number;
}

export function HourMarker({ hour }: HourMarkerProps) {
  const { colors, typography } = useTheme();
  const label = `${hour.toString().padStart(2, '0')}:00`;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: HOUR_HEIGHT }}>
      <Text style={{ width: 52, color: colors.text.quaternary, textAlign: 'right', paddingRight: 10, fontSize: 12, letterSpacing: 0 }}>
        {label}
      </Text>
      <View style={{ flex: 1, height: 0.5, backgroundColor: colors.separator.hairline }} />
    </View>
  );
}
