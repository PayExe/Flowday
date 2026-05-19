import { View, Text, StyleSheet } from 'react-native';

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
  const label = getScoreLabel(score);

  const bars = [
    { label: 'Blocs', value: blocksPercent, color: '#0A84FF' },
    { label: 'Tâches', value: tasksPercent, color: '#30D158' },
    { label: 'Focus', value: pomodorosPercent, color: '#BF5AF2' },
    { label: 'Rituels', value: ritualsPercent, color: '#FF9F0A' },
  ];

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
      {/* Score + label en ligne */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
        <Text style={{ fontSize: 56, fontWeight: '700', color: '#FFFFFF', letterSpacing: -2 }}>
          {score}
        </Text>
        <Text style={{ fontSize: 17, color: '#EBEBF599' }}>{label}</Text>
      </View>

      {/* 4 mini barres horizontales */}
      {bars.map(({ label: l, value, color }) => (
        <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: '#EBEBF54D', width: 52 }}>{l}</Text>
          <View style={{ flex: 1, height: 3, backgroundColor: '#2C2C2E', borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', backgroundColor: color, borderRadius: 2 }} />
          </View>
          <Text style={{ fontSize: 13, color: '#EBEBF54D', width: 36, textAlign: 'right' }}>{Math.round(value)}%</Text>
        </View>
      ))}
    </View>
  );
}
