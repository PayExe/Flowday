import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../../theme';
import { Priority } from '../../types/task';

const PRIORITY_CONFIG = {
  high: { color: Colors.danger },
  medium: { color: Colors.warning },
  low: { color: Colors.success },
};

interface PrioritySelectorProps {
  selected: Priority;
  onSelect: (priority: Priority) => void;
}

export function PrioritySelector({ selected, onSelect }: PrioritySelectorProps) {
  return (
    <View style={styles.container}>
      {(['high', 'medium', 'low'] as Priority[]).map((priority) => (
        <TouchableOpacity
          key={priority}
          style={[
            styles.button,
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
    gap: Spacing.sm,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
});
