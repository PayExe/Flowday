import { View, Text, StyleSheet } from 'react-native';

export const HOUR_HEIGHT = 60;
export const START_HOUR = 6;
export const END_HOUR = 23;

interface HourMarkerProps {
  hour: number;
}

export function HourMarker({ hour }: HourMarkerProps) {
  const label = `${hour.toString().padStart(2, '0')}:00`;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: HOUR_HEIGHT,
  },
  text: {
    width: 52,
    color: '#EBEBF54D',
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 12,
    letterSpacing: 0,
  },
  line: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#38383A',
  },
});
