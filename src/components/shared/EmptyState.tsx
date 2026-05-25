import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.text.tertiary} />
      <Text style={[styles.title, { color: colors.text.primary, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary, fontSize: typography.sizes.sm }]}>{subtitle}</Text>
    </View>
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
