import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  onPress: () => void;
  style?: any;
}

export function IconButton({
  name,
  size = 22,
  color,
  onPress,
  style,
}: IconButtonProps) {
  const { colors } = useTheme();
  const iconColor = color ?? colors.text.inverse;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.accentPrimary },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={name} size={size} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
