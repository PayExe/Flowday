import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color: string;
}

export function ProgressBar({ progress, color }: ProgressBarProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.background, { backgroundColor: colors.bg.hover }]}>
        <View
          style={[
            styles.fill,
            { width: `${progress * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
