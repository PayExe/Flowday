import { useRef } from 'react';
import { Animated, Pressable, type GestureResponderEvent } from 'react-native';
import { useTheme } from '../../theme';
import { hapticLight } from '../../utils/haptics';
import { Symbol, SymbolNames } from './Symbol';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  /** Ring color while unchecked. */
  color?: string;
  accessibilityLabel: string;
  size?: number;
}

/** Round checkbox, as in Reminders. */
export function Checkbox({ checked, onToggle, color, accessibilityLabel, size = 24 }: CheckboxProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    hapticLight();
    onToggle();
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, speed: 30 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: checked ? 0 : 1.5,
          borderColor: color ?? colors.system.gray3,
          backgroundColor: checked ? colors.accent : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale }],
        }}
      >
        {checked && (
          <Symbol name={SymbolNames.checkmark} size={size * 0.54} weight="bold" color={colors.text.inverse} />
        )}
      </Animated.View>
    </Pressable>
  );
}
