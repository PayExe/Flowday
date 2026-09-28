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
    <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.separator.hairline, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
        {duration >= 30 && (
          <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary, backgroundColor: colors.bg.primary, paddingHorizontal: 5 }}>
            Libre · {formatMinutes(duration)}
          </Text>
        )}
      </View>
    </View>
  );
}
