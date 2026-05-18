import { View, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color: string;
}

export function ProgressBar({ progress, color }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.background}>
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
    height: 6,
    backgroundColor: Colors.gray200,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
