import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import {
  WEEKEND,
  WEEK_DAY_KEYS,
  WEEK_DAY_SHORT_KEYS,
  WHOLE_WEEK,
  WORK_WEEK,
} from '../../utils/dates';
import { hapticLight } from '../../utils/haptics';
import { Chip } from '../ui/List';

interface DayPickerProps {
  selected: number[];
  onChange: (days: number[]) => void;
  /** Picks a single day, for moving an existing slot instead of creating several. */
  single?: boolean;
  /** Days that cannot be picked, such as the source day of a copy. */
  locked?: number[];
}

/** Seven day toggles with week / weekend shortcuts. */
export function DayPicker({ selected, onChange, single, locked = [] }: DayPickerProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  const toggle = (day: number) => {
    hapticLight();
    if (single) {
      onChange([day]);
      return;
    }
    onChange(
      selected.includes(day)
        ? selected.filter((d) => d !== day)
        : [...selected, day].sort((a, b) => a - b)
    );
  };

  const presets: { label: string; days: number[] }[] = [
    { label: t('Jours de semaine'), days: WORK_WEEK },
    { label: t('Week-end'), days: WEEKEND },
    { label: t('Tous les jours'), days: WHOLE_WEEK },
  ];

  const applyPreset = (days: number[]) => {
    hapticLight();
    onChange(days.filter((day) => !locked.includes(day)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.days}>
        {WHOLE_WEEK.map((day) => {
          const isSelected = selected.includes(day);
          const isLocked = locked.includes(day);

          return (
            <Pressable
              key={day}
              disabled={isLocked}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: isLocked }}
              accessibilityLabel={t(WEEK_DAY_KEYS[day])}
              onPress={() => toggle(day)}
              style={({ pressed }) => [
                styles.day,
                {
                  opacity: isLocked ? 0.35 : pressed ? 0.7 : 1,
                  backgroundColor: isSelected ? colors.accent : colors.bg.tertiary,
                },
              ]}
            >
              <Text
                style={[
                  typography.subheadline,
                  styles.dayLabel,
                  { color: isSelected ? colors.text.inverse : colors.text.primary },
                ]}
              >
                {t(WEEK_DAY_SHORT_KEYS[day])}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!single && (
        <View style={styles.presets}>
          {presets.map((preset) => (
            <Chip
              key={preset.label}
              label={preset.label}
              selected={
                preset.days.every((day) => selected.includes(day) || locked.includes(day)) &&
                selected.every((day) => preset.days.includes(day))
              }
              onPress={() => applyPreset(preset.days)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginHorizontal: 16,
  },
  days: {
    flexDirection: 'row',
    gap: 6,
  },
  day: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontWeight: '600',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
