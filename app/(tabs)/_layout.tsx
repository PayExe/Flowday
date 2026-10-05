import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '../../src/theme';
import { Symbol } from '../../src/components/ui/Symbol';
import { useTranslation } from '../../src/i18n';

const TABS = [
  { name: 'index', title: 'Aujourd’hui', icon: 'house', selectedIcon: 'house.fill' },
  { name: 'planning', title: 'Planning', icon: 'calendar.day.timeline.left', selectedIcon: 'calendar.day.timeline.left' },
  { name: 'week', title: 'Semaine', icon: 'calendar', selectedIcon: 'calendar' },
  { name: 'blocks', title: 'Blocs', icon: 'square.grid.2x2', selectedIcon: 'square.grid.2x2.fill' },
  { name: 'settings', title: 'Réglages', icon: 'gearshape', selectedIcon: 'gearshape.fill' },
] as const;

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs tintColor={colors.accent} minimizeBehavior="onScrollDown">
        {TABS.map((tab) => (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <NativeTabs.Trigger.Icon sf={{ default: tab.icon, selected: tab.selectedIcon }} />
            <NativeTabs.Trigger.Label>{t(tab.title)}</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.secondary,
          borderTopColor: colors.separator.hairline,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.system.gray,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.title),
            tabBarIcon: ({ color, focused }) => (
              <Symbol name={focused ? tab.selectedIcon : tab.icon} size={24} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
