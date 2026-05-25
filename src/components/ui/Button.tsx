import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}: ButtonProps) {
  const { colors, typography } = useTheme();

  const variantStyles = {
    primary: { backgroundColor: colors.accentPrimary },
    secondary: { backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    destructive: { backgroundColor: colors.danger + '15' },
  };

  const textStyles = {
    primary: { color: colors.textInverse },
    secondary: { color: colors.textSecondary },
    ghost: { color: colors.accentPrimary },
    destructive: { color: colors.danger },
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        variantStyles[variant],
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={[styles.text, { fontWeight: typography.weights.semibold, fontSize: typography.sizes.base }, textStyles[variant]]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  text: {
    fontWeight: '600',
    fontSize: 15,
  },
});
