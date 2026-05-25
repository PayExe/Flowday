import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

interface FreeSlotProps {
  height: number;
  duration?: number;
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h${m}`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

export function FreeSlot({ height, duration = 0 }: FreeSlotProps) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ flexDirection: 'row', marginBottom: 2, minHeight: 36, height: Math.max(height, 36) }}>
      <View style={{ width: 52 }} />
      <View style={{ flex: 1, marginRight: 16, alignItems: 'center', justifyContent: 'center' }}>
        {duration >= 30 && (
            <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary }}>
            Libre · {formatMinutes(duration)}
          </Text>
        )}
      </View>
    </View>
  );
}
