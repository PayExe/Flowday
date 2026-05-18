import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../theme';

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
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        styles[variant],
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  lg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
  },
  primary: {
    backgroundColor: Colors.accentCyan,
  },
  secondary: {
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: Colors.accentRed + '15',
  },
  text: {
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.base,
  },
  primaryText: {
    color: Colors.bgPrimary,
  },
  secondaryText: {
    color: Colors.textSecondary,
  },
  ghostText: {
    color: Colors.accentCyan,
  },
  destructiveText: {
    color: Colors.accentRed,
  },
});
