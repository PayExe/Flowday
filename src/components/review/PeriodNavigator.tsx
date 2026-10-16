import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight, LayoutAnimationConfig } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { PeriodRange, ReviewPeriod } from '../../features/review/review';
import { parseDateKey } from '../../utils/dates';
import { formatDayMonth, formatMonthYear } from '../../utils/time';
import { hapticLight } from '../../utils/haptics';
import { Symbol, SymbolNames } from '../ui/Symbol';

const CURRENT_LABELS: Record<ReviewPeriod, Record<number, string>> = {
  week: { 0: 'Cette semaine', [-1]: 'Semaine dernière' },
  month: { 0: 'Ce mois-ci', [-1]: 'Le mois dernier' },
};

interface PeriodNavigatorProps {
  period: ReviewPeriod;
  offset: number;
  range: PeriodRange;
  onChange: (offset: number) => void;
}

export function PeriodNavigator({ period, offset, range, onChange }: PeriodNavigatorProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [movedForward, setMovedForward] = useState(true);

  const isCurrent = offset === 0;
  const dates =
    period === 'week'
      ? `${formatDayMonth(parseDateKey(range.from), t)} – ${formatDayMonth(parseDateKey(range.to), t)}`
      : formatMonthYear(parseDateKey(range.from), t);
  const relative = CURRENT_LABELS[period][offset];

  const step = (next: number) => {
    hapticLight();
    setMovedForward(next > offset);
    onChange(next);
  };

  const arrow = (symbol: string, next: number, accessibilityLabel: string, disabled = false) => (
    <Pressable
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => step(next)}
      style={({ pressed }) => [
        styles.arrow,
        { backgroundColor: pressed ? colors.bg.hover : colors.bg.tertiary, opacity: disabled ? 0.35 : 1 },
      ]}
    >
      <Symbol name={symbol} size={15} weight="semibold" color={colors.text.primary} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {arrow(SymbolNames.chevronLeft, offset - 1, t('Période précédente'))}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isCurrent }}
        accessibilityLabel={isCurrent ? dates : `${dates} — ${t('Revenir à la période en cours')}`}
        disabled={isCurrent}
        onPress={() => step(0)}
        style={({ pressed }) => [styles.label, { opacity: pressed && !isCurrent ? 0.6 : 1 }]}
      >
        <LayoutAnimationConfig skipEntering>
          <Animated.View
            key={`${period}${offset}`}
            entering={(movedForward ? FadeInRight : FadeInLeft).duration(220)}
            style={styles.labelContent}
          >
            <Text style={[typography.subheadline, styles.labelText]} numberOfLines={1}>
              {relative ? t(relative) : dates}
            </Text>
            <Text
              style={[typography.caption, { color: isCurrent || relative ? colors.text.secondary : colors.accent }]}
              numberOfLines={1}
            >
              {relative ? dates : t('Revenir à la période en cours')}
            </Text>
          </Animated.View>
        </LayoutAnimationConfig>
      </Pressable>

      {arrow(SymbolNames.chevronRight, offset + 1, t('Période suivante'), isCurrent)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
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
  labelContent: {
    alignItems: 'center',
  },
  labelText: {
    fontWeight: '600',
  },
});
