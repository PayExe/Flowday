import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../theme';

interface FreeSlotProps {
  height: number;
}

export function FreeSlot({ height }: FreeSlotProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.text}>Libre</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 56,
    marginRight: 16,
    backgroundColor: Colors.bgSurface + '40',
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
});
