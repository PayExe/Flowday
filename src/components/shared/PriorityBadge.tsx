import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Priority } from '../../types/task';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { colors } = useTheme();

  const PRIORITY_CONFIG = {
    high: { color: colors.system.red, label: 'Haute' },
    medium: { color: colors.system.orange, label: 'Moyenne' },
    low: { color: colors.system.green, label: 'Basse' },
  };

  const config = PRIORITY_CONFIG[priority];
  return (
    <View style={[styles.badge, { backgroundColor: config.color + '18' }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
