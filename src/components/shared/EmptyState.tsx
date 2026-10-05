import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { Symbol } from '../ui/Symbol';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Symbol name={icon} size={52} weight="regular" color={colors.text.tertiary} />
      <Text style={[typography.title2, styles.title]}>{title}</Text>
      <Text style={[typography.subheadline, styles.subtitle]}>{subtitle}</Text>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 56,
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 21,
  },
  action: {
    marginTop: 24,
  },
});
