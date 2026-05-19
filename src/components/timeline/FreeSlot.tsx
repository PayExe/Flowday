import { View, Text, StyleSheet } from 'react-native';

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
  return (
    <View style={[styles.container, { height: Math.max(height, 36) }]}>
      <View style={{ width: 52 }} />
      <View style={styles.content}>
        {duration >= 30 && (
          <Text style={styles.text}>Libre · {formatMinutes(duration)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 2,
    minHeight: 36,
  },
  content: {
    flex: 1,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    color: '#EBEBF54D',
  },
});
