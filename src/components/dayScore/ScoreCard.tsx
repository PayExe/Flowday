import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { hapticSuccess } from '../../utils/haptics';
import { Card } from '../ui/List';
import { ProgressRing } from '../ui/ProgressRing';
import { Celebration } from '../ui/Celebration';

export const CELEBRATION_SCORE = 80;
const HYDRATION_GRACE_MS = 1500;
const RING_SIZE = 96;

interface ScoreCardProps {
  fidelity: number | null;
  balance: number | null;
}

export function getScoreLabel(score: number, t: (key: string) => string): string {
  if (score >= 90) return t('scorePerfect');
  if (score >= 75) return t('scoreGood');
  if (score >= 60) return t('scoreOkay');
  if (score >= 45) return t('scoreMixed');
  if (score >= 30) return t('scoreDifficult');
  return t('scoreIncomplete');
}

function useCountUp(value: number): number {
  const [display, setDisplay] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const duration = 600;
    const startTime = Date.now();
    const startValue = current.current;
    let frame: number;

    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current.current = Math.round(startValue + (value - startValue) * eased);
      setDisplay(current.current);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return display;
}

export function ScoreCard({ fidelity, balance }: ScoreCardProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  const [burst, setBurst] = useState(0);
  const ringScale = useSharedValue(1);
  const mountedAt = useRef(Date.now());
  const previousFidelity = useRef(fidelity ?? 0);
  const displayFidelity = useCountUp(fidelity ?? 0);
  const displayBalance = useCountUp(balance ?? 0);

  useEffect(() => {
    const value = fidelity ?? 0;
    const crossed = previousFidelity.current < CELEBRATION_SCORE && value >= CELEBRATION_SCORE;
    previousFidelity.current = value;
    if (!crossed || Date.now() - mountedAt.current < HYDRATION_GRACE_MS) return;
    hapticSuccess();
    setBurst((n) => n + 1);
    ringScale.value = withSequence(
      withSpring(1.08, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
  }, [fidelity, ringScale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const axis = (
    label: string,
    period: string,
    value: number | null,
    display: number,
    color: string,
    gradientTo: string
  ) => (
    <View style={styles.axis} accessible accessibilityLabel={`${label}, ${period} : ${value === null ? '–' : `${value} %`}`}>
      <ProgressRing value={value ?? 0} size={RING_SIZE} strokeWidth={10} color={color} gradientTo={gradientTo}>
        <Text style={[styles.value, { color: colors.text.primary }]}>{value === null ? '–' : `${display}`}</Text>
        {value !== null && <Text style={typography.caption}>%</Text>}
      </ProgressRing>
      <View style={styles.axisText}>
        <Text style={typography.headline}>{label}</Text>
        <Text style={typography.caption}>{period}</Text>
      </View>
    </View>
  );

  return (
    <Card padded>
      {fidelity !== null && (
        <Text style={[typography.headline, styles.label]}>{getScoreLabel(fidelity, t)}</Text>
      )}
      <View style={styles.row}>
        <Animated.View style={[styles.axisWrap, ringStyle]}>
          {axis(t('Fidélité'), t('aujourd’hui'), fidelity, displayFidelity, colors.accent, colors.system.teal)}
          <Celebration
            trigger={burst}
            radius={54}
            colors={[colors.accent, colors.system.teal, colors.system.yellow, colors.system.pink, colors.system.green]}
          />
        </Animated.View>
        <View style={styles.axisWrap}>
          {axis(t('Équilibre'), t('cette semaine'), balance, displayBalance, colors.system.green, colors.system.teal)}
        </View>
      </View>

      {fidelity === null && balance === null && (
        <Text style={[typography.footnote, styles.hint]}>
          {t('Valide tes blocs à la fin de chaque créneau pour mesurer ta journée.')}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  axisWrap: {
    alignItems: 'center',
  },
  axis: {
    alignItems: 'center',
    gap: 10,
  },
  axisText: {
    alignItems: 'center',
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    marginTop: 14,
    textAlign: 'center',
  },
});
