import type { ReactNode } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { IconButton } from './Glass';
import { SymbolNames } from './Symbol';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  children: ReactNode;
}

export function Sheet(props: SheetProps) {
  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={props.onClose}
    >
      <SafeAreaProvider>
        <SheetContent {...props} />
      </SafeAreaProvider>
    </Modal>
  );
}

function SheetContent({
  title,
  onClose,
  onConfirm,
  confirmLabel,
  confirmDisabled,
  children,
}: SheetProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'ios' ? 0 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg.primary }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{ paddingTop: topInset + 76, paddingBottom: insets.bottom + 32 }}
      >
        {children}
      </ScrollView>

      <View pointerEvents="box-none" style={[styles.header, { top: topInset + 16 }]}>
        <IconButton symbol={SymbolNames.close} onPress={onClose} accessibilityLabel={t('Fermer')} />
        <Text style={[typography.headline, styles.title]} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {onConfirm ? (
          <IconButton
            symbol={SymbolNames.checkmark}
            onPress={onConfirm}
            accessibilityLabel={confirmLabel ?? t('Enregistrer')}
            disabled={confirmDisabled}
            prominent
          />
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
}

export function FieldLabel({ children }: { children: string }) {
  const { colors, typography } = useTheme();
  return (
    <Text style={[typography.footnote, styles.fieldLabel, { color: colors.text.secondary }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 44,
  },
  fieldLabel: {
    fontWeight: '600',
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 8,
  },
});
