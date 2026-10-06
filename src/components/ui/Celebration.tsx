import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const PARTICLES = 18;
const DURATION = 1100;

interface ParticleProps {
  angle: number;
  distance: number;
  size: number;
  color: string;
}

function Particle({ angle, distance, size, color }: ParticleProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const style = useAnimatedStyle(() => {
    const travelled = distance * progress.value;
    return {
      opacity: progress.value < 0.6 ? 1 : 1 - (progress.value - 0.6) / 0.4,
      transform: [
        { translateX: Math.cos(angle) * travelled },
        // A touch of gravity once the burst slows down.
        { translateY: Math.sin(angle) * travelled + 18 * progress.value * progress.value },
        { scale: 1 - 0.5 * progress.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, borderRadius: size / 2, marginLeft: -size / 2, marginTop: -size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

interface CelebrationProps {
  /** Increment to fire a new burst; 0 renders nothing. */
  trigger: number;
  colors: readonly string[];
  /** How far particles fly from the center, in points. */
  radius: number;
}

/** A one-shot particle burst from the center of its parent. */
export function Celebration({ trigger, colors, radius }: CelebrationProps) {
  if (trigger === 0) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      {Array.from({ length: PARTICLES }, (_, i) => {
        // Spread evenly with a little jitter so the burst does not look mechanical.
        const angle = (i / PARTICLES) * Math.PI * 2 + ((i * 37) % 10) / 25;
        return (
          <Particle
            key={`${trigger}-${i}`}
            angle={angle}
            distance={radius * (0.75 + ((i * 53) % 10) / 25)}
            size={i % 3 === 0 ? 8 : 6}
            color={colors[i % colors.length]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'visible',
  },
  particle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
});
