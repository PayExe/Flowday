import { Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveBlockColor, useTheme, withAlpha } from '../../theme';
import { useTranslation } from '../../i18n';
import { WEEK_DAY_KEYS, WEEK_DAY_SHORT_KEYS, WHOLE_WEEK } from '../../utils/dates';
import { hapticLight } from '../../utils/haptics';

const MAX_DOTS = 4;

interface WeekDayStripProps {
  colorsByDay: string[][];
  selected: number;
  today: number;
  onSelect: (day: number) => void;
}

export function WeekDayStrip({ colorsByDay, selected, today, onSelect }: WeekDayStripProps) {
  const { colors, typography, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {WHOLE_WEEK.map((day) => {
        const isSelected = day === selected;
        const dayColors = colorsByDay[day] ?? [];
        const labelColor = isSelected
          ? colors.text.inverse
          : day === today
            ? colors.accent
            : colors.text.primary;

        return (
          <Pressable
            key={day}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={t(WEEK_DAY_KEYS[day])}
            accessibilityHint={t('plannedBlocksCount', { count: dayColors.length })}
            onPress={() => {
              if (isSelected) return;
              hapticLight();
              onSelect(day);
            }}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: isSelected
                  ? colors.accent
                  : pressed
                    ? colors.bg.hover
                    : colors.bg.secondary,
              },
            ]}
          >
            <Text style={[typography.footnote, styles.label, { color: labelColor }]}>
              {t(WEEK_DAY_SHORT_KEYS[day])}
            </Text>
            <View style={styles.dots}>
              {dayColors.slice(0, MAX_DOTS).map((color, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isSelected
                        ? withAlpha(colors.text.inverse, 0.9)
                        : resolveBlockColor(color, isDark),
                    },
                  ]}
                />
              ))}
              {dayColors.length === 0 && (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: isSelected ? withAlpha(colors.text.inverse, 0.4) : colors.text.quaternary },
                  ]}
                />
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  pill: {
    flex: 1,
    minHeight: 56,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
    height: 5,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
