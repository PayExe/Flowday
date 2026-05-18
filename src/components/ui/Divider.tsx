import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../theme';

interface DividerProps {
  style?: any;
}

export function Divider({ style }: DividerProps) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginHorizontal: Spacing.xl,
  },
});
