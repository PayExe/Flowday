import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, ScrollView, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../src/features/theme/store';
import { useRitualStore } from '../../src/features/rituals/store';
import { useTheme } from '../../src/theme';
import { Symbol, SymbolNames } from '../../src/components/ui/Symbol';
import { SegmentedControl } from '../../src/components/ui/SegmentedControl';
import { PageInfo } from '../../src/components/ui/PageInfo';
import { ThemeName } from '../../src/theme';
import { isValidTime } from '../../src/utils/dates';

export default function SettingsScreen() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const themeName = useThemeStore((state) => state.themeName);
  const setTheme = useThemeStore((state) => state.setTheme);

  const morningConfig = useRitualStore((state) => state.morningConfig);
  const updateMorningConfig = useRitualStore((state) => state.updateMorningConfig);
  const eveningConfig = useRitualStore((state) => state.eveningConfig);
  const updateEveningConfig = useRitualStore((state) => state.updateEveningConfig);

  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [timeModalValue, setTimeModalValue] = useState('');
  const [timeModalTarget, setTimeModalTarget] = useState<'morning' | 'evening'>('morning');

  const openTimeModal = (target: 'morning' | 'evening') => {
    const currentTime = target === 'morning' ? morningConfig.time : eveningConfig.time;
    setTimeModalValue(currentTime);
    setTimeModalTarget(target);
    setTimeModalVisible(true);
  };

  const handleTimeModalSubmit = () => {
    const time = timeModalValue.trim();
    if (isValidTime(time)) {
      if (timeModalTarget === 'morning') {
        updateMorningConfig({ time });
      } else {
        updateEveningConfig({ time });
      }
    }
    setTimeModalVisible(false);
  };

  const themes: { value: ThemeName; label: string }[] = [
    { value: 'dark', label: 'Sombre' },
    { value: 'light', label: 'Clair' },
  ];

  const renderCell = (
    icon: string,
    iconColor: string,
    label: string,
    value?: string | React.ReactNode,
    onPress?: () => void
  ) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 11,
        backgroundColor: pressed ? colors.bg.hover : 'transparent',
        minHeight: 44,
      })}
    >
      <View
        style={{
          width: 29,
          height: 29,
          borderRadius: 7,
          backgroundColor: iconColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Symbol name={icon} size={16} color={colors.text.inverse} />
      </View>
      <Text style={{ flex: 1, fontSize: typography.sizes.lg, color: colors.text.primary, letterSpacing: -0.41 }}>
        {label}
      </Text>
      {typeof value === 'string' ? (
        <>
          <Text style={{ fontSize: typography.sizes.lg, color: colors.text.secondary, marginRight: 6 }}>{value}</Text>
          {onPress && <Symbol name={SymbolNames.chevronRight} size={14} color={colors.text.tertiary} />}
        </>
      ) : (
        value
      )}
    </Pressable>
  );

  const renderGroup = (children: React.ReactNode, footer?: string) => (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          backgroundColor: colors.bg.secondary,
          borderRadius: 13,
          marginHorizontal: 16,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
      {footer && (
        <Text style={{ fontSize: typography.sizes.sm, color: colors.text.secondary, paddingHorizontal: 32, paddingTop: 8 }}>
          {footer}
        </Text>
      )}
    </View>
  );

  const renderSeparator = () => (
    <View style={{ height: 0.5, backgroundColor: colors.separator.hairline, marginLeft: 57 }} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[typography.screenTitle, { color: colors.text.primary }]}>Réglages</Text>
        <PageInfo
          title="Réglages"
          description="Personnalise l'apparence et les rituels automatiques."
          points={[
            'Le thème Sombre / Clair change toute l’app instantanément.',
            'Le Morning Ritual s’ouvre automatiquement chaque matin.',
            'L’Evening Wrap s’ouvre après l’heure que tu définis.',
          ]}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
      >
        <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 8 }]}>Thème</Text>
        <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
          <SegmentedControl
            options={themes}
            value={themeName}
            onChange={(name) => setTheme(name)}
          />
        </View>

        <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 8 }]}>Morning Ritual</Text>
        {renderGroup(
          <>
            {renderCell(
              SymbolNames.sun,
              '#FF9F0A',
              'Activer',
              <Switch
                value={morningConfig.enabled}
                onValueChange={(v) => updateMorningConfig({ enabled: v })}
                trackColor={{ false: colors.separator.default, true: colors.system.green }}
                thumbColor={colors.text.inverse}
                ios_backgroundColor={colors.separator.default}
              />
            )}
            {renderSeparator()}
            {renderCell(
              SymbolNames.clock,
              colors.system.blue,
              'Heure',
              morningConfig.time,
              () => openTimeModal('morning'),
            )}
          </>,
          "Le Morning Ritual s'ouvre automatiquement chaque matin."
        )}

        <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 8 }]}>Evening Wrap</Text>
        {renderGroup(
          <>
            {renderCell(
              SymbolNames.moon,
              colors.system.indigo,
              'Activer',
              <Switch
                value={eveningConfig.enabled}
                onValueChange={(v) => updateEveningConfig({ enabled: v })}
                trackColor={{ false: colors.separator.default, true: colors.system.green }}
                thumbColor={colors.text.inverse}
                ios_backgroundColor={colors.separator.default}
              />
            )}
            {renderSeparator()}
            {renderCell(
              SymbolNames.clock,
              colors.system.blue,
              'Heure',
              eveningConfig.time,
              () => openTimeModal('evening'),
            )}
          </>
        )}

        <View style={{ marginTop: 24, alignItems: 'center', paddingVertical: 32 }}>
          <Text style={{ fontSize: typography.sizes.sm, color: colors.text.tertiary }}>Flowday v1.0</Text>
          <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary, marginTop: 4 }}>Built with Expo</Text>
        </View>
      </ScrollView>

      <Modal
        visible={timeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setTimeModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.bg.secondary }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[typography.headline, { color: colors.text.primary, marginBottom: 12 }]}>
              {timeModalTarget === 'morning' ? 'Heure du Morning Ritual' : 'Heure de l\'Evening Wrap'}
            </Text>
            <Text style={[typography.footnote, { color: colors.text.secondary, marginBottom: 8 }]}>
              Format HH:MM (ex: 08:00)
            </Text>
            <TextInput
              style={[styles.modalInput, {
                backgroundColor: colors.bg.hover,
                color: colors.text.primary,
                borderColor: colors.separator.default,
              }]}
              placeholder="08:00"
              placeholderTextColor={colors.text.placeholder}
              value={timeModalValue}
              onChangeText={setTimeModalValue}
              onSubmitEditing={handleTimeModalSubmit}
              autoFocus
              returnKeyType="done"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: 'transparent' }]}
                onPress={() => setTimeModalVisible(false)}
              >
                <Text style={[typography.headline, { color: colors.system.blue }]}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.system.blue, borderRadius: 10 }]}
                onPress={handleTimeModalSubmit}
              >
                <Text style={[typography.headline, { color: colors.text.inverse }]}>OK</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 13,
    padding: 20,
  },
  modalInput: {
    fontSize: 17,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
});
