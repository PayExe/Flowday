import { Children, isValidElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, LayoutAnimationConfig, LinearTransition } from 'react-native-reanimated';
import { radius, resolveBlockColor, useTheme, withAlpha } from '../../theme';
import { Symbol, SymbolNames, type SymbolProps } from './Symbol';
import { symbolForEmoji } from './blockIcons';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export function Card({ children, style, padded }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.bg.secondary },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface ListProps {
  children: ReactNode;
  separatorInset?: number;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
}

export const ROW_TRANSITION = LinearTransition.springify().damping(22).stiffness(220);

export function List({ children, separatorInset = 16, style, animated }: ListProps) {
  const { colors } = useTheme();
  const rows = Children.toArray(children).filter(isValidElement);

  if (animated) {
    return (
      <LayoutAnimationConfig skipEntering>
          <Animated.View
            layout={ROW_TRANSITION}
            style={[styles.card, { backgroundColor: colors.bg.secondary }, style]}
          >
            {rows.map((row, index) => (
              <Animated.View
                key={row.key ?? index}
                entering={FadeIn.duration(220)}
                exiting={FadeOut.duration(160)}
                layout={ROW_TRANSITION}
              >
                {index > 0 && (
                  <View
                    style={{
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: colors.separator.hairline,
                      marginLeft: separatorInset,
                    }}
                  />
                )}
                {row}
              </Animated.View>
            ))}
          </Animated.View>
      </LayoutAnimationConfig>
    );
  }

  return (
    <Card style={style}>
      {rows.map((row, index) => (
        <View key={row.key ?? index}>
          {index > 0 && (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: colors.separator.hairline,
                marginLeft: separatorInset,
              }}
            />
          )}
          {row}
        </View>
      ))}
    </Card>
  );
}

interface RowProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  value?: string;
  trailing?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  tint?: string;
  accessibilityLabel?: string;
}

export function Row({
  title,
  subtitle,
  leading,
  value,
  trailing,
  chevron,
  onPress,
  tint,
  accessibilityLabel,
}: RowProps) {
  const { colors, typography } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed && onPress ? colors.bg.hover : 'transparent' },
      ]}
    >
      {leading}
      <View style={styles.rowText}>
        <Text style={[typography.body, tint ? { color: tint } : null]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[typography.footnote, styles.rowSubtitle]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {value && <Text style={[typography.body, { color: colors.text.secondary }]}>{value}</Text>}
      {trailing}
      {chevron && (
        <Symbol name={SymbolNames.chevronRight} size={13} weight="semibold" color={colors.text.tertiary} />
      )}
    </Pressable>
  );
}

interface SectionHeaderProps {
  title: string;
  variant?: 'prominent' | 'plain';
  trailing?: ReactNode;
}

export function SectionHeader({ title, variant = 'prominent', trailing }: SectionHeaderProps) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.sectionHeader, variant === 'plain' && styles.sectionHeaderPlain]}>
      <Text
        accessibilityRole="header"
        style={
          variant === 'prominent'
            ? typography.title3
            : [typography.footnote, { fontWeight: '600', color: colors.text.secondary }]
        }
      >
        {title}
      </Text>
      {trailing}
    </View>
  );
}

export function SectionFooter({ children }: { children: string }) {
  const { typography } = useTheme();
  return <Text style={[typography.footnote, styles.sectionFooter]}>{children}</Text>;
}

interface IconTileProps {
  color: string;
  emoji?: string;
  symbol?: string;
  size?: number;
  solid?: boolean;
  animationSpec?: SymbolProps['animationSpec'];
}

export function IconTile({ color, emoji, symbol, size = 36, solid, animationSpec }: IconTileProps) {
  const { colors, isDark } = useTheme();
  const resolved = resolveBlockColor(color, isDark);
  const symbolName = symbol ?? symbolForEmoji(emoji);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        borderCurve: 'continuous',
        backgroundColor: solid ? resolved : withAlpha(resolved, isDark ? 0.26 : 0.16),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {symbolName ? (
        <Symbol
          name={symbolName}
          size={size * 0.56}
          weight="medium"
          color={solid ? colors.text.inverse : resolved}
          animationSpec={animationSpec}
        />
      ) : emoji ? (
        <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
      ) : null}
    </View>
  );
}

interface ProgressBarProps {
  value: number;
  color: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 6 }: ProgressBarProps) {
  const { colors, isDark } = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: colors.bg.tertiary,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: resolveBlockColor(color, isDark),
        }}
      />
    </View>
  );
}

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
  emoji?: string;
}

export function Chip({ label, selected, onPress, color, emoji }: ChipProps) {
  const { colors, typography, isDark } = useTheme();
  const resolved = color ? resolveBlockColor(color, isDark) : colors.accent;
  const symbolName = symbolForEmoji(emoji);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        { backgroundColor: selected ? withAlpha(resolved, isDark ? 0.3 : 0.16) : colors.bg.tertiary },
      ]}
    >
      {symbolName ? (
        <Symbol name={symbolName} size={15} weight="medium" color={resolved} />
      ) : emoji ? (
        <Text style={{ fontSize: 15 }}>{emoji}</Text>
      ) : color ? (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: resolved }} />
      ) : null}
      <Text
        style={[
          typography.subheadline,
          { color: colors.text.primary, fontWeight: selected ? '600' : '400' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  padded: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
  },
  rowSubtitle: {
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 10,
  },
  sectionHeaderPlain: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionFooter: {
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
});
