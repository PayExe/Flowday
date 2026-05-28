import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const { colors, typography } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Ionicons name={icon} size={48} color={colors.text.tertiary} />
      </Animated.View>
      <Text style={[styles.title, { color: colors.text.primary, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary, fontSize: typography.sizes.sm }]}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 16,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
});
