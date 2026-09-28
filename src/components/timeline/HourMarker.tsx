import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

export const HOUR_HEIGHT = 60;
export const START_HOUR = 6;
export const END_HOUR = 23;
export const MINUTES_PER_HOUR = 60;
export const HOUR_LABEL_WIDTH = 48;
export const BLOCK_MIN_HEIGHT = 44;
export const BLOCK_MEDIUM_THRESHOLD = HOUR_HEIGHT;
export const BLOCK_LARGE_THRESHOLD = HOUR_HEIGHT * 2;

export function timelineY(minutesSinceStart: number): number {
  return (minutesSinceStart / MINUTES_PER_HOUR) * HOUR_HEIGHT;
}

interface HourMarkerProps {
  hour: number;
}

export function HourMarker({ hour }: HourMarkerProps) {
  const { colors } = useTheme();
  const label = `${hour.toString().padStart(2, '0')}:00`;
  return (
    <View style={{ position: 'relative', height: 0, width: HOUR_LABEL_WIDTH }}>
      <Text style={{ position: 'absolute', right: 0, top: -8, width: HOUR_LABEL_WIDTH, color: colors.text.secondary, textAlign: 'right', paddingRight: 8, fontSize: 12, fontVariant: ['tabular-nums'] }}>
        {label}
      </Text>
    </View>
  );
}
