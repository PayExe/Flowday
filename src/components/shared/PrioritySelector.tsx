import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Priority } from '../../types/task';

export function PrioritySelector({ selected, onSelect }: { selected: Priority; onSelect: (priority: Priority) => void }) {
  const { colors } = useTheme();

  const PRIORITY_CONFIG = {
    high: { color: colors.system.red },
    medium: { color: colors.system.orange },
    low: { color: colors.system.green },
  };

  return (
    <View style={styles.container}>
      {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
        <TouchableOpacity
          key={priority}
          style={[
            styles.button,
            { borderColor: colors.border },
            selected === priority && {
              backgroundColor: PRIORITY_CONFIG[priority].color + '20',
              borderColor: PRIORITY_CONFIG[priority].color,
            },
          ]}
          onPress={() => onSelect(priority)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: PRIORITY_CONFIG[priority].color },
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
});
