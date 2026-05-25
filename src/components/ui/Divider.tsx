import { View } from 'react-native';
import { useTheme } from '../../theme';

interface DividerProps {
  style?: any;
  indent?: number;
}

export function Divider({ style, indent }: DividerProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        { height: 1, backgroundColor: colors.separator.hairline },
        indent !== undefined && { marginLeft: indent },
        style,
      ]}
    />
  );
}
