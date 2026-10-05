import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { Button, IconButton } from '../ui/Glass';
import { SymbolNames } from '../ui/Symbol';

interface RitualScaffoldProps {
  /** 1-based index of the current step. */
  step: number;
  stepCount: number;
  /** Top left control, such as "Later". */
  leading?: ReactNode;
  /** Top right control, usually the help button. */
  trailing?: ReactNode;
  onBack?: () => void;
  primaryTitle: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  /** Quiet action shown above the primary button. */
  secondary?: ReactNode;
  children: ReactNode;
}

const MAX_STEPS = 8;

/** Full screen step-by-step flow shared by the Morning Ritual and the Evening Wrap. */
export function RitualScaffold({
  step,
  stepCount,
  leading,
  trailing,
  onBack,
  primaryTitle,
  onPrimary,
  primaryDisabled,
  secondary,
  children,
}: RitualScaffoldProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const dotWidths = useRef(
    Array.from({ length: MAX_STEPS }, (_, i) => new Animated.Value(i === 0 ? 22 : 7))
  ).current;

  useEffect(() => {
    dotWidths.forEach((dot, i) => {
      Animated.spring(dot, {
        toValue: i === step - 1 ? 22 : 7,
        useNativeDriver: false,
        friction: 8,
      }).start();
    });
  }, [step, dotWidths]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg.primary, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.side}>{leading}</View>
        <View
          style={styles.dots}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: stepCount, now: step }}
        >
          {Array.from({ length: Math.min(stepCount, MAX_STEPS) }, (_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidths[index],
                  backgroundColor: index < step ? colors.accent : colors.bg.tertiary,
                },
              ]}
            />
          ))}
        </View>
        <View style={[styles.side, styles.sideRight]}>{trailing}</View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {children}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {secondary}
        <View style={styles.footerRow}>
          {onBack && (
            <IconButton
              symbol={SymbolNames.chevronLeft}
              onPress={onBack}
              accessibilityLabel={t('Retour')}
              size={50}
            />
          )}
          <Button
            title={primaryTitle}
            onPress={onPrimary}
            disabled={primaryDisabled}
            style={styles.primary}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/** Title block of a step. */
export function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.heading}>
      <Text style={[typography.largeTitle, styles.centered]} accessibilityRole="header">
        {title}
      </Text>
      {subtitle && (
        <Text style={[typography.body, styles.centered, styles.headingSubtitle, { color: colors.text.secondary }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primary: {
    flex: 1,
  },
  heading: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  headingSubtitle: {
    marginTop: 8,
  },
  centered: {
    textAlign: 'center',
  },
});
