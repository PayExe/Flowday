import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { HOUR_LABEL_WIDTH } from './HourMarker';

const DOT_SIZE = 9;
const ROW_HEIGHT = 18;

interface NowIndicatorProps {
  top: number;
  label: string;
}

export function NowIndicator({ top, label }: NowIndicatorProps) {
  const { colors, typography } = useTheme();
  const red = colors.system.red;

  const offset = useSharedValue(top);
  const pulse = useSharedValue(0);

  useEffect(() => {
    offset.value = withTiming(top, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [top, offset]);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1);
  }, [pulse]);

  const positionStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value - ROW_HEIGHT / 2 }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 1.6 }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.container, positionStyle]}>
      <View style={styles.labelColumn}>
        <View style={[styles.pill, { backgroundColor: red }]}>
          <Text style={[typography.caption, styles.pillText, { color: colors.text.inverse }]}>
            {label}
          </Text>
        </View>
      </View>
      <View style={styles.dotWrap}>
        <Animated.View style={[styles.dot, { backgroundColor: red }, haloStyle]} />
        <View style={[styles.dot, { backgroundColor: red }]} />
      </View>
      <View style={[styles.rule, { backgroundColor: red }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelColumn: {
    width: HOUR_LABEL_WIDTH - DOT_SIZE / 2,
    alignItems: 'flex-start',
  },
  pill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderCurve: 'continuous',
  },
  pillText: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dotWrap: {
    width: DOT_SIZE,
    height: DOT_SIZE,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  rule: {
    flex: 1,
    height: 1.5,
  },
});
