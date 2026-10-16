import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeOutDown, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { hapticLight } from '../../utils/haptics';
import { useToastStore } from '../../features/toast/store';
import { GlassSurface } from './Glass';
import { Symbol } from './Symbol';

const VISIBLE_MS = 4000;
const TAB_BAR_CLEARANCE = 64;

export function ToastHost() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToastStore((state) => state.toast);
  const hide = useToastStore((state) => state.hide);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => hide(toast.id), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast, hide]);

  if (!toast) return null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { bottom: insets.bottom + TAB_BAR_CLEARANCE }]}>
      <Animated.View
        key={toast.id}
        entering={SlideInDown.springify().damping(20).stiffness(220)}
        exiting={FadeOutDown.duration(180)}
        accessibilityLiveRegion="polite"
      >
        <GlassSurface style={styles.toast}>
          {toast.symbol && <Symbol name={toast.symbol} size={18} weight="semibold" color={colors.text.secondary} />}
          <Text style={[typography.subheadline, styles.message, { color: colors.text.primary }]} numberOfLines={2}>
            {toast.message}
          </Text>
          {toast.action && (
            <Pressable
              hitSlop={10}
              accessibilityRole="button"
              onPress={() => {
                hapticLight();
                toast.action?.onPress();
                hide(toast.id);
              }}
            >
              <Text style={[typography.subheadline, styles.action, { color: colors.accent }]}>
                {toast.action.label}
              </Text>
            </Pressable>
          )}
        </GlassSurface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  message: {
    flex: 1,
  },
  action: {
    fontWeight: '600',
  },
});
