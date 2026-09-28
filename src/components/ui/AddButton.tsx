import { Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { Symbol, SymbolNames } from './Symbol';

interface AddButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
}

export function AddButton({ onPress, accessibilityLabel }: AddButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: pressed ? `${colors.system.blue}CC` : colors.system.blue,
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <Symbol name={SymbolNames.add} size={18} color={colors.text.inverse} />
    </Pressable>
  );
}
