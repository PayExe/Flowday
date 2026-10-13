import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, Switch, Linking, Pressable, Share } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../src/features/theme/store';
import { useRitualStore } from '../../src/features/rituals/store';
import { useDayScoreStore } from '../../src/features/dayScore/store';
import { IconButton } from '../../src/components/ui/Glass';
import { useTheme, type ThemePreference } from '../../src/theme';
import { SymbolNames } from '../../src/components/ui/Symbol';
import { SegmentedControl } from '../../src/components/ui/SegmentedControl';
import { PageInfo } from '../../src/components/ui/PageInfo';
import { IconTile, List, Row, SectionFooter, SectionHeader } from '../../src/components/ui/List';
import { Screen } from '../../src/components/ui/Screen';
import { TimeField } from '../../src/components/ui/TimeField';
import { useLanguageStore } from '../../src/features/language/store';
import {
  BLOCK_LEAD_CHOICES,
  useNotificationStore,
} from '../../src/features/notifications/store';
import {
  countOwnedNotifications,
  requestPermission,
} from '../../src/features/notifications/service';
import { useTranslation } from '../../src/i18n';
import { buildExport } from '../../src/features/backup/export';
import { useToastStore } from '../../src/features/toast/store';

const MAX_POMODORO_GOAL = 12;

export default function SettingsScreen() {
  const { colors, typography } = useTheme();
  const router = useRouter();
  const themePreference = useThemeStore((state) => state.themeName);
  const setTheme = useThemeStore((state) => state.setTheme);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { t } = useTranslation();

  const morningConfig = useRitualStore((state) => state.morningConfig);
  const updateMorningConfig = useRitualStore((state) => state.updateMorningConfig);
  const eveningConfig = useRitualStore((state) => state.eveningConfig);
  const updateEveningConfig = useRitualStore((state) => state.updateEveningConfig);

  const ritualsEnabled = useNotificationStore((state) => state.ritualsEnabled);
  const blocksEnabled = useNotificationStore((state) => state.blocksEnabled);
  const blockEndsEnabled = useNotificationStore((state) => state.blockEndsEnabled);
  const blockLeadMinutes = useNotificationStore((state) => state.blockLeadMinutes);
  const focusEnabled = useNotificationStore((state) => state.focusEnabled);
  const permissionGranted = useNotificationStore((state) => state.permissionGranted);
  const setRitualsEnabled = useNotificationStore((state) => state.setRitualsEnabled);
  const setBlocksEnabled = useNotificationStore((state) => state.setBlocksEnabled);
  const setBlockEndsEnabled = useNotificationStore((state) => state.setBlockEndsEnabled);
  const setBlockLeadMinutes = useNotificationStore((state) => state.setBlockLeadMinutes);
  const setFocusEnabled = useNotificationStore((state) => state.setFocusEnabled);
  const setPermission = useNotificationStore((state) => state.setPermission);
  const markPermissionRequested = useNotificationStore((state) => state.markPermissionRequested);

  const pomodoroGoal = useDayScoreStore((state) => state.pomodoroGoal);
  const setPomodoroGoal = useDayScoreStore((state) => state.setPomodoroGoal);

  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const count = await countOwnedNotifications();
      if (!cancelled) setScheduledCount(count);
    };
    const timer = setTimeout(() => void refresh(), 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ritualsEnabled, blocksEnabled, blockEndsEnabled, blockLeadMinutes, permissionGranted, morningConfig, eveningConfig]);

  const enableWithPermission = useCallback(
    async (apply: (enabled: boolean) => void, enabled: boolean) => {
      if (!enabled) {
        apply(false);
        return;
      }
      const granted = await requestPermission();
      markPermissionRequested();
      setPermission(granted);
      apply(granted);
    },
    [markPermissionRequested, setPermission]
  );

  const leadOptions = BLOCK_LEAD_CHOICES.map((minutes) => ({
    value: minutes,
    label: minutes === 0 ? t('À l’heure pile') : t('blockLeadOption', { minutes }),
  }));

  const themes: { value: ThemePreference; label: string }[] = [
    { value: 'system', label: t('Auto') },
    { value: 'light', label: t('Clair') },
    { value: 'dark', label: t('Sombre') },
  ];

  const exportData = useCallback(async () => {
    try {
      await Share.share({ title: t('Données Flowday'), message: await buildExport() });
    } catch {
      useToastStore.getState().show({ message: t('Export impossible. Réessaie.'), symbol: 'exclamationmark.triangle.fill' });
    }
  }, [t]);

  const renderCell = (icon: string, iconColor: string, label: string, control: ReactNode) => (
    <View style={styles.cell}>
      <IconTile color={iconColor} symbol={icon} size={30} solid />
      <Text style={[typography.body, styles.cellLabel]}>{label}</Text>
      {control}
    </View>
  );

  return (
    <Screen
      title={t('Réglages')}
      actions={
        <PageInfo
          title={t('Réglages')}
          description={t("Personnalise l'apparence et les rituels automatiques.")}
          points={[
            t('Le thème Auto suit l’apparence de ton iPhone.'),
            t('Le Morning Ritual s’ouvre automatiquement dans les 3 h suivant l’heure définie.'),
            t('L’Evening Wrap s’ouvre après l’heure que tu définis.'),
            t('Flowday te prévient à l’heure de tes rituels, même app fermée.'),
            t('Un rappel au début de chaque créneau de ta semaine type.'),
            t('À la fin de chaque créneau, réponds Fait, En partie ou Pas fait depuis la notification.'),
            t('Une alerte quand un pomodoro ou une pause se termine.'),
          ]}
        />
      }
    >
      <SectionHeader title={t('Apparence')} variant="plain" />
      <List separatorInset={58}>
        <View style={styles.stackedCell}>
          <View style={styles.stackedHeader}>
            <IconTile color={colors.system.indigo} symbol={SymbolNames.brush} size={30} solid />
            <Text style={typography.body}>{t('Thème')}</Text>
          </View>
          <SegmentedControl options={themes} value={themePreference} onChange={setTheme} />
        </View>
        <View style={styles.stackedCell}>
          <View style={styles.stackedHeader}>
            <IconTile color={colors.system.blue} symbol={SymbolNames.globe} size={30} solid />
            <Text style={typography.body}>{t('language')}</Text>
          </View>
          <SegmentedControl
            options={[{ value: 'fr', label: t('french') }, { value: 'en', label: t('english') }]}
            value={language}
            onChange={setLanguage}
          />
        </View>
      </List>

      <SectionHeader title={t('Score')} variant="plain" />
      <List separatorInset={58}>
        {renderCell(
          SymbolNames.timer,
          colors.system.orange,
          t('Objectif Focus quotidien'),
          <View style={styles.stepper}>
            <IconButton
              symbol={SymbolNames.minus}
              size={32}
              disabled={pomodoroGoal <= 0}
              onPress={() => setPomodoroGoal(pomodoroGoal - 1)}
              accessibilityLabel={t('Diminuer l’objectif Focus')}
            />
            <Text
              style={[typography.body, styles.stepperValue]}
              accessibilityLabel={`${t('Objectif Focus quotidien')} : ${pomodoroGoal}`}
            >
              {pomodoroGoal}
            </Text>
            <IconButton
              symbol={SymbolNames.add}
              size={32}
              disabled={pomodoroGoal >= MAX_POMODORO_GOAL}
              onPress={() => setPomodoroGoal(pomodoroGoal + 1)}
              accessibilityLabel={t('Augmenter l’objectif Focus')}
            />
          </View>
        )}
      </List>
      <SectionFooter>
        {t('Sessions de 25 min pour un score Focus complet. À 0, le Focus ne compte plus dans le score.')}
      </SectionFooter>

      <SectionHeader title={t('Morning Ritual')} variant="plain" />
      <List separatorInset={58}>
        {renderCell(
          SymbolNames.sun,
          colors.system.orange,
          t('Activer'),
          <Switch
            value={morningConfig.enabled}
            onValueChange={(enabled) => updateMorningConfig({ enabled })}
            trackColor={{ true: colors.system.green }}
            accessibilityLabel={`${t('Activer')} ${t('Morning Ritual')}`}
          />
        )}
        {renderCell(
          SymbolNames.clock,
          colors.system.gray,
          t('Heure'),
          <TimeField
            value={morningConfig.time}
            onChange={(time) => updateMorningConfig({ time })}
            accessibilityLabel={t('Heure du Morning Ritual')}
          />
        )}
      </List>
      <SectionFooter>{t('Le Morning Ritual s’ouvre automatiquement chaque matin.')}</SectionFooter>

      <SectionHeader title={t('Evening Wrap')} variant="plain" />
      <List separatorInset={58}>
        {renderCell(
          SymbolNames.moon,
          colors.system.indigo,
          t('Activer'),
          <Switch
            value={eveningConfig.enabled}
            onValueChange={(enabled) => updateEveningConfig({ enabled })}
            trackColor={{ true: colors.system.green }}
            accessibilityLabel={`${t('Activer')} ${t('Evening Wrap')}`}
          />
        )}
        {renderCell(
          SymbolNames.clock,
          colors.system.gray,
          t('Heure'),
          <TimeField
            value={eveningConfig.time}
            onChange={(time) => updateEveningConfig({ time })}
            accessibilityLabel={t("Heure de l'Evening Wrap")}
          />
        )}
      </List>
      <SectionFooter>{t('L’Evening Wrap s’ouvre après l’heure que tu définis.')}</SectionFooter>

      <SectionHeader title={t('Notifications')} variant="plain" />
      <List separatorInset={58}>
        {renderCell(
          SymbolNames.bell,
          colors.system.red,
          t('Rappels des rituels'),
          <Switch
            value={ritualsEnabled}
            onValueChange={(enabled) => void enableWithPermission(setRitualsEnabled, enabled)}
            trackColor={{ true: colors.system.green }}
            accessibilityLabel={t('Rappels des rituels')}
          />
        )}
        {renderCell(
          SymbolNames.calendar,
          colors.system.blue,
          t('Début des blocs'),
          <Switch
            value={blocksEnabled}
            onValueChange={(enabled) => void enableWithPermission(setBlocksEnabled, enabled)}
            trackColor={{ true: colors.system.green }}
            accessibilityLabel={t('Début des blocs')}
          />
        )}
        {blocksEnabled && (
          <View style={styles.stackedCell}>
            <View style={styles.stackedHeader}>
              <IconTile color={colors.system.gray} symbol={SymbolNames.clock} size={30} solid />
              <Text style={typography.body}>{t('Anticipation')}</Text>
            </View>
            <SegmentedControl
              options={leadOptions}
              value={blockLeadMinutes}
              onChange={setBlockLeadMinutes}
            />
          </View>
        )}
        {renderCell(
          SymbolNames.checkmarkCircle,
          colors.system.green,
          t('Fin des blocs'),
          <Switch
            value={blockEndsEnabled}
            onValueChange={(enabled) => void enableWithPermission(setBlockEndsEnabled, enabled)}
            trackColor={{ true: colors.system.green }}
            accessibilityLabel={t('Fin des blocs')}
          />
        )}
        {renderCell(
          SymbolNames.timer,
          colors.system.orange,
          t('Fin de pomodoro'),
          <Switch
            value={focusEnabled}
            onValueChange={(enabled) => void enableWithPermission(setFocusEnabled, enabled)}
            trackColor={{ true: colors.system.green }}
            accessibilityLabel={t('Fin de pomodoro')}
          />
        )}
      </List>
      {permissionGranted ? (
        <SectionFooter>
          {scheduledCount > 0
            ? t('notificationsScheduled', { count: scheduledCount })
            : t('Les rappels suivent les heures définies ci-dessous.')}
        </SectionFooter>
      ) : (
        <View style={styles.permission}>
          <Text style={[typography.footnote, { color: colors.text.secondary }]}>
            {t('Autorise les notifications pour activer les rappels.')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void Linking.openSettings()}
            style={({ pressed }) => [styles.permissionAction, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[typography.footnote, styles.permissionLabel, { color: colors.accent }]}>
              {t('Ouvrir les réglages')}
            </Text>
          </Pressable>
        </View>
      )}

      <SectionHeader title={t('Données')} variant="plain" />
      <List separatorInset={58}>
        <Row
          leading={<IconTile color={colors.system.green} symbol="square.and.arrow.up" size={30} solid />}
          title={t('Exporter mes données')}
          chevron
          onPress={() => void exportData()}
        />
        <Row
          leading={<IconTile color={colors.accent} symbol="sun.horizon.fill" size={30} solid />}
          title={t('Revoir la présentation')}
          chevron
          onPress={() => router.push('/onboarding')}
        />
      </List>
      <SectionFooter>
        {t('Tes données restent sur ton téléphone. L’export en fait une copie que tu peux garder où tu veux.')}
      </SectionFooter>

      <View style={styles.about}>
        <Text style={[typography.footnote, { color: colors.text.tertiary }]}>
          Flowday v{Constants.expoConfig?.version ?? '—'}
        </Text>
        <Text style={[typography.caption, styles.credits, { color: colors.text.tertiary }]}>
          {t('Made by PayExe · Built with Expo')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperValue: {
    minWidth: 22,
    textAlign: 'center',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cellLabel: {
    flex: 1,
  },
  stackedCell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  stackedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permission: {
    paddingHorizontal: 32,
    paddingTop: 6,
    gap: 2,
  },
  permissionAction: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  permissionLabel: {
    fontWeight: '600',
  },
  about: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  credits: {
    marginTop: 4,
  },
});
