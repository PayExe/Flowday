import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme';

interface DividerProps {
  style?: any;
  indent?: number;
}

export function Divider({ style, indent }: DividerProps) {
  return (
    <View
      style={[
        styles.divider,
        indent !== undefined && { marginLeft: indent },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
