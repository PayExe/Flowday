import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme } from '../../theme';
import { hapticLight } from '../../utils/haptics';
import { Symbol } from './Symbol';

export const LIQUID_GLASS = isLiquidGlassAvailable();

interface GlassSurfaceProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  tint?: string;
  interactive?: boolean;
}

export function GlassSurface({ children, style, tint, interactive }: GlassSurfaceProps) {
  const { colors, isDark } = useTheme();

  if (LIQUID_GLASS) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={isDark ? 'dark' : 'light'}
        tintColor={tint}
        isInteractive={interactive}
        style={style}
      >
        {children}
      </GlassView>
    );
  }

  if (tint) {
    return <View style={[style, { backgroundColor: tint }]}>{children}</View>;
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint={isDark ? 'systemThinMaterialDark' : 'systemThinMaterialLight'}
        intensity={80}
        style={[styles.clip, style]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        style,
        {
          backgroundColor: colors.bg.secondary,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.separator.hairline,
        },
      ]}
    >
      {children}
    </View>
  );
}

interface IconButtonProps {
  symbol: string;
  onPress: () => void;
  accessibilityLabel: string;
  prominent?: boolean;
  disabled?: boolean;
  size?: number;
}

export function IconButton({
  symbol,
  onPress,
  accessibilityLabel,
  prominent,
  disabled,
  size = 44,
}: IconButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => ({ opacity: disabled ? 0.4 : pressed && !LIQUID_GLASS ? 0.6 : 1 })}
    >
      <GlassSurface
        interactive
        tint={prominent ? colors.accent : undefined}
        style={[styles.iconButton, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Symbol
          name={symbol}
          size={Math.round(size * 0.43)}
          weight="semibold"
          color={prominent ? colors.text.inverse : colors.text.primary}
        />
      </GlassSurface>
    </Pressable>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'plain' | 'destructive';
  disabled?: boolean;
  symbol?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, variant = 'primary', disabled, symbol, style }: ButtonProps) {
  const { colors, typography } = useTheme();

  const textColor =
    variant === 'primary'
      ? colors.text.inverse
      : variant === 'destructive'
        ? colors.system.red
        : colors.accent;

  const content = (
    <>
      {symbol && <Symbol name={symbol} size={18} weight="semibold" color={textColor} />}
      <Text style={[typography.headline, { color: textColor }]} numberOfLines={1}>
        {title}
      </Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [{ opacity: disabled ? 0.4 : pressed ? 0.7 : 1 }, style]}
    >
      {variant === 'primary' ? (
        <GlassSurface interactive tint={colors.accent} style={styles.button}>
          {content}
        </GlassSurface>
      ) : (
        <View
          style={[
            styles.button,
            variant !== 'plain' && { backgroundColor: colors.bg.tertiary },
          ]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    minHeight: 50,
    borderRadius: 25,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
