import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { Card, ProgressBar } from '../ui/List';
import { ProgressRing } from '../ui/ProgressRing';

interface ScoreCardProps {
  score: number;
  blocksPercent?: number;
  tasksPercent?: number;
  pomodorosPercent?: number;
  ritualsPercent?: number;
}

export function getScoreLabel(score: number, t: (key: string) => string): string {
  if (score >= 90) return t('scorePerfect');
  if (score >= 75) return t('scoreGood');
  if (score >= 60) return t('scoreOkay');
  if (score >= 45) return t('scoreMixed');
  if (score >= 30) return t('scoreDifficult');
  return t('scoreIncomplete');
}

export function ScoreCard({
  score,
  blocksPercent = 0,
  tasksPercent = 0,
  pomodorosPercent = 0,
  ritualsPercent = 0,
}: ScoreCardProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 600;
    const startTime = Date.now();
    const startValue = displayScore;
    let frame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startValue + (score - startValue) * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const metrics = [
    { label: t('Blocs'), value: blocksPercent, color: colors.system.blue },
    { label: t('Tâches'), value: tasksPercent, color: colors.system.green },
    { label: t('Focus'), value: pomodorosPercent, color: colors.system.purple },
    { label: t('Rituels'), value: ritualsPercent, color: colors.system.orange },
  ];

  const hasData = score > 0 || metrics.some((m) => m.value > 0);

  return (
    <Card padded>
      <View style={styles.row}>
        <ProgressRing value={score} size={116} strokeWidth={11} color={colors.accent}>
          <Text
            style={[styles.score, { color: colors.text.primary }]}
            accessibilityLabel={`${score} ${t('/100')}`}
          >
            {displayScore}
          </Text>
          <Text style={typography.caption}>{t('/100')}</Text>
        </ProgressRing>

        <View style={styles.metrics}>
          <Text style={typography.headline}>{getScoreLabel(score, t)}</Text>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.metric}>
              <View style={styles.metricLabels}>
                <Text style={typography.footnote}>{metric.label}</Text>
                <Text style={[typography.footnote, styles.tabular]}>{Math.round(metric.value)}%</Text>
              </View>
              <ProgressBar value={metric.value} color={metric.color} height={4} />
            </View>
          ))}
        </View>
      </View>

      {!hasData && (
        <Text style={[typography.footnote, styles.hint]}>
          {t('Complète tes blocs, tâches et rituels pour remplir ton score.')}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  score: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  metrics: {
    flex: 1,
    gap: 8,
  },
  metric: {
    gap: 4,
  },
  metricLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  hint: {
    marginTop: 14,
  },
});
