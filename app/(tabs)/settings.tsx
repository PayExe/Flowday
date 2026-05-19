import { View, Text, Pressable, StyleSheet, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/features/theme/store';
import { useRitualStore } from '../../src/features/rituals/store';
import { ThemeName } from '../../src/theme';

export default function SettingsScreen() {
  const themeName = useThemeStore((state) => state.themeName);
  const setTheme = useThemeStore((state) => state.setTheme);

  const morningConfig = useRitualStore((state) => state.morningConfig);
  const updateMorningConfig = useRitualStore((state) => state.updateMorningConfig);
  const eveningConfig = useRitualStore((state) => state.eveningConfig);
  const updateEveningConfig = useRitualStore((state) => state.updateEveningConfig);

  const themes: { name: ThemeName; label: string }[] = [
    { name: 'dark', label: 'Dark' },
    { name: 'oled', label: 'OLED' },
    { name: 'tinted', label: 'Tinted' },
  ];

  const renderCell = (
    icon: string,
    iconColor: string,
    label: string,
    value?: string | React.ReactNode,
    onPress?: () => void,
    isLast?: boolean
  ) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 11,
        backgroundColor: pressed ? '#2C2C2E' : 'transparent',
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
        <Ionicons name={icon as any} size={16} color="#FFFFFF" />
      </View>
      <Text style={{ flex: 1, fontSize: 17, color: '#FFFFFF', letterSpacing: -0.41 }}>
        {label}
      </Text>
      {typeof value === 'string' ? (
        <>
          <Text style={{ fontSize: 17, color: '#EBEBF599', marginRight: 6 }}>{value}</Text>
          {onPress && <Ionicons name="chevron-forward" size={14} color="#EBEBF54D" />}
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
          backgroundColor: '#1C1C1E',
          borderRadius: 13,
          marginHorizontal: 16,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
      {footer && (
        <Text style={{ fontSize: 13, color: '#EBEBF599', paddingHorizontal: 32, paddingTop: 8 }}>
          {footer}
        </Text>
      )}
    </View>
  );

  const renderSeparator = () => (
    <View style={{ height: 0.5, backgroundColor: '#54545899', marginLeft: 57 }} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réglages</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Thème */}
        <Text style={styles.sectionHeader}>Thème</Text>
        {renderGroup(
          <>
            {themes.map((t, index) => (
              <View key={t.name}>
                <Pressable
                  onPress={() => setTheme(t.name)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 11,
                    backgroundColor: pressed ? '#2C2C2E' : 'transparent',
                    minHeight: 44,
                  })}
                >
                  <Text style={{ flex: 1, fontSize: 17, color: '#FFFFFF', letterSpacing: -0.41 }}>
                    {t.label}
                  </Text>
                  {themeName === t.name && (
                    <Ionicons name="checkmark" size={20} color="#0A84FF" />
                  )}
                </Pressable>
                {index < themes.length - 1 && renderSeparator()}
              </View>
            ))}
          </>
        )}

        {/* Morning Ritual */}
        <Text style={styles.sectionHeader}>Morning Ritual</Text>
        {renderGroup(
          <>
            {renderCell(
              'sunny-outline',
              '#FF9F0A',
              'Activer',
              <Switch
                value={morningConfig.enabled}
                onValueChange={(v) => updateMorningConfig({ enabled: v })}
                trackColor={{ false: '#38383A', true: '#30D158' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#38383A"
              />
            )}
            {renderSeparator()}
            {renderCell(
              'time-outline',
              '#0A84FF',
              'Heure',
              morningConfig.time,
              undefined,
              true
            )}
          </>,
          'Le Morning Ritual s\'ouvre automatiquement chaque matin.'
        )}

        {/* Evening Wrap */}
        <Text style={styles.sectionHeader}>Evening Wrap</Text>
        {renderGroup(
          <>
            {renderCell(
              'moon-outline',
              '#5E5CE6',
              'Activer',
              <Switch
                value={eveningConfig.enabled}
                onValueChange={(v) => updateEveningConfig({ enabled: v })}
                trackColor={{ false: '#38383A', true: '#30D158' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#38383A"
              />
            )}
            {renderSeparator()}
            {renderCell(
              'time-outline',
              '#0A84FF',
              'Heure',
              eveningConfig.time,
              undefined,
              true
            )}
          </>
        )}

        {/* About */}
        <View style={{ marginTop: 24, alignItems: 'center', paddingVertical: 32 }}>
          <Text style={{ fontSize: 13, color: '#EBEBF54D' }}>Flowday v1.0</Text>
          <Text style={{ fontSize: 12, color: '#EBEBF52E', marginTop: 4 }}>Built with Expo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.37,
  },
  sectionHeader: {
    fontSize: 13,
    color: '#EBEBF599',
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: -0.08,
  },
});
