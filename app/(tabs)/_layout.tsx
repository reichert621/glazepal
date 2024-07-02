import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Link, Tabs} from 'expo-router';
import colors from 'tailwindcss/colors';

import Colors from '@/constants/Colors';
import {useColorScheme} from '@/components/useColorScheme';
import {useClientOnlyValue} from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return (
    <Ionicons size={24} style={{marginBottom: -2, marginTop: 2}} {...props} />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          borderTopColor:
            colorScheme === 'dark' ? colors.zinc[900] : colors.zinc[200],
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{href: null, title: 'Glazes', headerShown: false}}
      />
      <Tabs.Screen
        name="glazes-tab"
        options={{
          title: 'Glazes',
          headerShown: false,
          tabBarIcon: ({color}) => <TabBarIcon name="brush" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pieces-tab"
        options={{
          title: 'Pieces',
          headerShown: false,
          tabBarIcon: ({color}) => <TabBarIcon name="cafe" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites-tab"
        options={{
          title: 'Favorites',
          headerShown: false,
          tabBarIcon: ({color}) => <TabBarIcon name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings-tab"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({color}) => <TabBarIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
