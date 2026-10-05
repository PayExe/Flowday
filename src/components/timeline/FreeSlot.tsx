import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { formatDuration } from '../../utils/time';

interface FreeSlotProps {
  height: number;
  duration?: number;
}

export function FreeSlot({ height, duration = 0 }: FreeSlotProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
      {duration >= 60 && (
        <Text style={[typography.caption, { color: colors.text.tertiary }]}>
          {t('Libre')} · {formatDuration(duration)}
        </Text>
      )}
    </View>
  );
}
