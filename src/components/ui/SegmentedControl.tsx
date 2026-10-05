import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { hapticLight } from '../../utils/haptics';

interface SegmentedOption<T> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors, typography, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.tertiary }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              selected && [
                styles.selected,
                { backgroundColor: isDark ? colors.system.gray2 : colors.bg.secondary },
              ],
            ]}
            onPress={() => {
              if (selected) return;
              hapticLight();
              onChange(option.value);
            }}
          >
            <Text
              style={[
                typography.footnote,
                { color: colors.text.primary, fontWeight: selected ? '600' : '400' },
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 3,
    height: 36,
  },
  segment: {
    flex: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  selected: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
