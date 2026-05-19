import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/features/theme/store';
import { useRitualStore } from '../../src/features/rituals/store';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { ThemeName } from '../../src/theme';

export default function SettingsScreen() {
  const themeName = useThemeStore((state) => state.themeName);
  const setTheme = useThemeStore((state) => state.setTheme);

  const morningConfig = useRitualStore((state) => state.morningConfig);
  const updateMorningConfig = useRitualStore((state) => state.updateMorningConfig);
  const eveningConfig = useRitualStore((state) => state.eveningConfig);
  const updateEveningConfig = useRitualStore((state) => state.updateEveningConfig);

  const themes: { name: ThemeName; label: string; icon: string }[] = [
    { name: 'dark', label: 'Dark', icon: 'moon-outline' },
    { name: 'oled', label: 'OLED', icon: 'contrast-outline' },
    { name: 'tinted', label: 'Tinted', icon: 'color-palette-outline' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réglages</Text>
        <Text style={styles.headerSubtitle}>Personnalise ton expérience</Text>
      </View>

      {/* Thème */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thème</Text>
        <View style={styles.themeRow}>
          {themes.map((t) => (
            <TouchableOpacity
              key={t.name}
              style={[
                styles.themeBtn,
                themeName === t.name && { backgroundColor: Colors.bgInput, borderColor: Colors.accentCyan },
              ]}
              onPress={() => setTheme(t.name)}
            >
              <Ionicons name={t.icon as any} size={20} color={themeName === t.name ? Colors.accentCyan : Colors.textSecondary} />
              <Text style={[styles.themeLabel, themeName === t.name && { color: Colors.accentCyan }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Morning Ritual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Morning Ritual</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Activer</Text>
          <Switch
            value={morningConfig.enabled}
            onValueChange={(v) => updateMorningConfig({ enabled: v })}
            trackColor={{ false: Colors.bgInput, true: Colors.accentCyan + '80' }}
            thumbColor={morningConfig.enabled ? Colors.accentCyan : Colors.textTertiary}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Heure</Text>
          <Text style={styles.settingValue}>{morningConfig.time}</Text>
        </View>
      </View>

      {/* Evening Wrap */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evening Wrap</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Activer</Text>
          <Switch
            value={eveningConfig.enabled}
            onValueChange={(v) => updateEveningConfig({ enabled: v })}
            trackColor={{ false: Colors.bgInput, true: Colors.accentCyan + '80' }}
            thumbColor={eveningConfig.enabled ? Colors.accentCyan : Colors.textTertiary}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Heure</Text>
          <Text style={styles.settingValue}>{eveningConfig.time}</Text>
        </View>
      </View>

      {/* About */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Flowday v1.0</Text>
        <Text style={styles.footerSub}>Built with Expo & React Native</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  themeLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
  },
  settingValue: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  footer: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
  footerSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
});
