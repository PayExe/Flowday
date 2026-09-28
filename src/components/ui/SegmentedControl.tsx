import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

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
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.secondary }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[
              styles.segment,
              selected && { backgroundColor: colors.bg.tertiary },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? colors.text.primary : colors.text.secondary },
              ]}
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
    borderRadius: 10,
    padding: 3,
    height: 36,
  },
  segment: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
