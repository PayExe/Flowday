import React, { useCallback, useRef } from 'react';
import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface FlowdayBottomSheetProps extends Omit<BottomSheetModalProps, 'backdropComponent'> {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

/**
 * Backdrop flouté iOS avec expo-blur
 */
function BlurBackdrop(props: BottomSheetBackdropProps) {
  const { isDark } = useTheme();
  return (
    <BottomSheetBackdrop
      {...props}
      opacity={0.5}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      style={[
        props.style,
        { backgroundColor: isDark ? '#00000080' : '#00000040' },
      ]}
    />
  );
}

/**
 * FlowdayBottomSheet
 * Wrapper natif iOS-style avec :
 * - Backdrop flouté / dimmed
 * - Radius 20 (sheet Apple)
 * - Handle indicator
 * - Couleurs adaptées au thème
 */
export const FlowdayBottomSheet = React.forwardRef<
  BottomSheetModal,
  FlowdayBottomSheetProps
>(({ children, contentStyle, ...rest }, ref) => {
  const { colors } = useTheme();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BlurBackdrop {...props} />,
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['50%', '85%']}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: colors.text.tertiary,
        width: 36,
        height: 4,
        borderRadius: 2,
      }}
      backgroundStyle={{
        backgroundColor: colors.bg.elevated,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      {...rest}
    >
      <BottomSheetView style={[styles.content, contentStyle]}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

FlowdayBottomSheet.displayName = 'FlowdayBottomSheet';

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
});
