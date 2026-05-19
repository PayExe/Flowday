import { View, Text, StyleSheet } from 'react-native';

export function CurrentTimeLine() {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={{ width: 52, alignItems: 'flex-end', paddingRight: 8 }}>
        <Text style={styles.timeText}>{currentTime}</Text>
      </View>
      <View style={styles.dot} />
      <View style={styles.line} />
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
  timeText: {
    fontSize: 12,
    color: '#FF453A',
    fontWeight: '500',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF453A',
    marginRight: 6,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#FF453A',
    marginRight: 16,
    opacity: 0.8,
  },
});
