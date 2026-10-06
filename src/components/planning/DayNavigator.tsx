import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { dateKey, parseDateKey, relativeDay, shiftDateKey } from '../../utils/dates';
import { formatLongDate } from '../../utils/time';
import { hapticLight } from '../../utils/haptics';
import { Symbol, SymbolNames } from '../ui/Symbol';

const RELATIVE_LABELS = {
  today: 'Aujourd’hui',
  tomorrow: 'Demain',
  yesterday: 'Hier',
} as const;

interface DayNavigatorProps {
  date: string;
  onChange: (date: string) => void;
}

export function DayNavigator({ date, onChange }: DayNavigatorProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  const today = dateKey();
  const relative = relativeDay(date, today);
  const isToday = relative === 'today';
  const parsed = parseDateKey(date);

  // The screen header already carries the full date, so this only states where
  // we are relative to today, plus the way back when we have wandered off.
  const label = relative ? t(RELATIVE_LABELS[relative]) : formatLongDate(parsed, t);

  const step = (days: number) => {
    hapticLight();
    onChange(shiftDateKey(date, days));
  };

  const arrow = (symbol: string, days: number, accessibilityLabel: string) => (
    <Pressable
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => step(days)}
      style={({ pressed }) => [
        styles.arrow,
        { backgroundColor: pressed ? colors.bg.hover : colors.bg.tertiary },
      ]}
    >
      <Symbol name={symbol} size={15} weight="semibold" color={colors.text.primary} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {arrow(SymbolNames.chevronLeft, -1, t('Jour précédent'))}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isToday }}
        accessibilityLabel={isToday ? label : `${label} — ${t('Revenir à aujourd’hui')}`}
        disabled={isToday}
        onPress={() => {
          hapticLight();
          onChange(today);
        }}
        style={({ pressed }) => [styles.label, { opacity: pressed && !isToday ? 0.6 : 1 }]}
      >
        <Text style={[typography.subheadline, styles.labelText]} numberOfLines={1}>
          {label}
        </Text>
        {!isToday && (
          <Text style={[typography.caption, { color: colors.accent }]} numberOfLines={1}>
            {t('Revenir à aujourd’hui')}
          </Text>
        )}
      </Pressable>

      {arrow(SymbolNames.chevronRight, 1, t('Jour suivant'))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    alignItems: 'center',
  },
  labelText: {
    fontWeight: '600',
  },
});
