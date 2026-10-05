import type { ReactNode, RefObject } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface ScreenProps {
  title: string;
  /** Small line above the title, usually the date. */
  eyebrow?: string;
  subtitle?: string;
  /** Floating controls pinned to the top right. */
  actions?: ReactNode;
  children: ReactNode;
  scrollRef?: RefObject<ScrollView | null>;
}

const IS_IOS = Platform.OS === 'ios';
const BAR_HEIGHT = 44;

/**
 * Tab screen scaffold: a large title that scrolls with the content and
 * floating glass controls. On iOS the system adjusts the scroll insets for the
 * status bar and the tab bar, so content flows underneath both.
 */
export function Screen({ title, eyebrow, subtitle, actions, children, scrollRef }: ScreenProps) {
  const { colors, typography, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
      <ScrollView
        ref={scrollRef}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: IS_IOS ? 0 : insets.top, paddingBottom: IS_IOS ? 24 : 24 + insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.bar}>
            {eyebrow && <Text style={typography.eyebrow}>{eyebrow}</Text>}
          </View>
          <Text style={typography.largeTitle} accessibilityRole="header">
            {title}
          </Text>
          {subtitle && <Text style={[typography.subheadline, styles.subtitle]}>{subtitle}</Text>}
        </View>
        {children}
      </ScrollView>

      {Platform.OS === 'android' ? (
        <View
          pointerEvents="none"
          style={[styles.scrim, { height: insets.top, backgroundColor: colors.bg.primary }]}
        />
      ) : (
        <BlurView
          pointerEvents="none"
          tint={isDark ? 'dark' : 'light'}
          intensity={40}
          style={[styles.scrim, { height: insets.top }]}
        />
      )}

      {actions && (
        <View pointerEvents="box-none" style={[styles.actions, { top: insets.top + 4 }]}>
          {actions}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  bar: {
    minHeight: BAR_HEIGHT,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 4,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  actions: {
    position: 'absolute',
    right: 16,
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
