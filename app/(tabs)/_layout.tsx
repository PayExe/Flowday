import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Symbol, SymbolNames } from '../../src/components/ui/Symbol';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.primary,
          borderTopColor: colors.separator.default,
          borderTopWidth: 0.5,
          height: 80,
          paddingBottom: 24,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.system.blue,
        tabBarInactiveTintColor: colors.system.gray,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Symbol
              name={focused ? SymbolNames.home : SymbolNames.homeOutline}
              size={24}
              color={color}
              weight={focused ? 'semibold' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'Planning',
          tabBarIcon: ({ color, focused }) => (
            <Symbol
              name={focused ? SymbolNames.calendarFill : SymbolNames.calendar}
              size={24}
              color={color}
              weight={focused ? 'semibold' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: 'Semaine',
          tabBarIcon: ({ color, focused }) => (
            <Symbol
              name={focused ? SymbolNames.clockFill : SymbolNames.clock}
              size={24}
              color={color}
              weight={focused ? 'semibold' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="blocks"
        options={{
          title: 'Blocs',
          tabBarIcon: ({ color, focused }) => (
            <Symbol
              name={focused ? SymbolNames.blocksFill : SymbolNames.blocks}
              size={24}
              color={color}
              weight={focused ? 'semibold' : 'regular'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color, focused }) => (
            <Symbol
              name={focused ? SymbolNames.settings : SymbolNames.settingsOutline}
              size={24}
              color={color}
              weight={focused ? 'semibold' : 'regular'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
