import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'ghost';
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
    borderRadius: Radius.full,
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
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.gray200,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.base,
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.black,
  },
  ghostText: {
    color: Colors.primary,
  },
});
