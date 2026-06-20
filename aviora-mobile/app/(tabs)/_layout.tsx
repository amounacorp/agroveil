import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAlertStore } from '../../store/alertStore';
import { useT } from '../../hooks/useT';

function TabIcon({ emoji }: { emoji: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const unreadCount = useAlertStore((s) => s.unreadCount);
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surfaceContainer,
          borderTopColor: Colors.outlineVariant + '33',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor:   Colors.secondary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: () => <TabIcon emoji="🏠" />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: t.tabs.live,
          tabBarIcon: () => <TabIcon emoji="📹" />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t.tabs.alerts,
          tabBarBadge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.error, fontSize: 10 },
          tabBarIcon: () => <TabIcon emoji="🔔" />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t.tabs.analytics,
          tabBarIcon: () => <TabIcon emoji="📊" />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t.tabs.reports,
          tabBarIcon: () => <TabIcon emoji="📋" />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t.tabs.account,
          tabBarIcon: () => <TabIcon emoji="👤" />,
        }}
      />
    </Tabs>
  );
}
