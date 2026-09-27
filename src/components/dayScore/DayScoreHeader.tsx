import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

interface DayScoreHeaderProps {
  score: number;
  blocksPercent?: number;
  tasksPercent?: number;
  pomodorosPercent?: number;
  ritualsPercent?: number;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Journée parfaite';
  if (score >= 75) return 'Bonne journée';
  if (score >= 60) return 'Journée correcte';
  if (score >= 45) return 'Journée mitigée';
  if (score >= 30) return 'Journée difficile';
  return 'Ça arrive';
}

export function DayScoreHeader({
  score,
  blocksPercent = 0,
  tasksPercent = 0,
  pomodorosPercent = 0,
  ritualsPercent = 0,
}: DayScoreHeaderProps) {
  const { colors, typography } = useTheme();
  const label = getScoreLabel(score);

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 800;
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

  const bars = [
    { label: 'Blocs', value: blocksPercent, color: colors.system.blue },
    { label: 'Tâches', value: tasksPercent, color: colors.system.green },
    { label: 'Focus', value: pomodorosPercent, color: colors.system.purple },
    { label: 'Rituels', value: ritualsPercent, color: colors.system.orange },
  ];

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
        <Text style={{ fontSize: typography.sizes.score, fontWeight: '700', color: colors.text.primary, letterSpacing: -2 }}>
          {displayScore}
        </Text>
        <Text style={{ fontSize: typography.sizes.lg, color: colors.text.secondary }}>{label}</Text>
      </View>

      {bars.map(({ label: l, value, color }) => (
        <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Text style={{ fontSize: typography.sizes.sm, color: colors.text.quaternary, width: 52 }}>{l}</Text>
          <View style={{ flex: 1, height: 3, backgroundColor: colors.bg.hover, borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', backgroundColor: color, borderRadius: 2 }} />
          </View>
          <Text style={{ fontSize: typography.sizes.sm, color: colors.text.quaternary, width: 36, textAlign: 'right' }}>{Math.round(value)}%</Text>
        </View>
      ))}
    </View>
  );
}
