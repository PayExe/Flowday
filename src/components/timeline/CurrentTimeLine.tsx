import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../theme';

export function CurrentTimeLine() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.line} />
      <View style={styles.timeBadge}>
        <Text style={styles.timeText}>MAINTENANT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    left: 56,
    right: 16,
    height: 1,
    backgroundColor: Colors.nowLine,
  },
  timeBadge: {
    position: 'absolute',
    left: 60,
    backgroundColor: Colors.bgPrimary,
    paddingHorizontal: Spacing.sm,
    zIndex: 1,
  },
  timeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.nowLine,
    letterSpacing: 1,
  },
});
