import type { ReactNode } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useThemeStore } from '../../src/features/theme/store';
import { useRitualStore } from '../../src/features/rituals/store';
import { useTheme, type ThemePreference } from '../../src/theme';
import { SymbolNames } from '../../src/components/ui/Symbol';
import { SegmentedControl } from '../../src/components/ui/SegmentedControl';
import { PageInfo } from '../../src/components/ui/PageInfo';
import { IconTile, List, SectionFooter, SectionHeader } from '../../src/components/ui/List';
import { Screen } from '../../src/components/ui/Screen';
import { TimeField } from '../../src/components/ui/TimeField';
import { useLanguageStore } from '../../src/features/language/store';
import { useTranslation } from '../../src/i18n';

export default function SettingsScreen() {
  const { colors, typography } = useTheme();
  const themePreference = useThemeStore((state) => state.themeName);
  const setTheme = useThemeStore((state) => state.setTheme);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { t } = useTranslation();

  const morningConfig = useRitualStore((state) => state.morningConfig);
  const updateMorningConfig = useRitualStore((state) => state.updateMorningConfig);
  const eveningConfig = useRitualStore((state) => state.eveningConfig);
  const updateEveningConfig = useRitualStore((state) => state.updateEveningConfig);

  const themes: { value: ThemePreference; label: string }[] = [
    { value: 'system', label: t('Auto') },
    { value: 'light', label: t('Clair') },
    { value: 'dark', label: t('Sombre') },
  ];

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
            t('Le Morning Ritual s’ouvre automatiquement chaque matin.'),
            t('L’Evening Wrap s’ouvre après l’heure que tu définis.'),
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

      <View style={styles.about}>
        <Text style={[typography.footnote, { color: colors.text.tertiary }]}>Flowday {t('v0.1.0')}</Text>
        <Text style={[typography.caption, styles.credits, { color: colors.text.tertiary }]}>
          {t('Made by PayExe · Built with Expo')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  about: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  credits: {
    marginTop: 4,
  },
});
