import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  AppStateStatus,
  Platform,
  Text,
  View,
} from 'react-native';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import '../global.css';

import {useAppState, useOnlineManager} from '@/utils/hooks';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const queryClient = new QueryClient({
  defaultOptions: {queries: {retry: 2}},
});

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== 'web') {
    console.log('App state changed:', status);
    focusManager.setFocused(status === 'active');
  }
}

function RootLayoutNav() {
  useOnlineManager();
  useAppState(onAppStateChange);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView className="flex-1">
          <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
            {/* TODO: figure out best way to organize modals */}
            <Stack.Screen
              name="modals/glazes/[glaze]/edit"
              options={{presentation: 'modal', headerShown: false}}
            />
            <Stack.Screen
              name="modals/combos/[combo]/edit"
              options={{presentation: 'modal', headerShown: false}}
            />
            <Stack.Screen
              name="modals/pieces/[piece]/edit"
              options={{presentation: 'modal', headerShown: false}}
            />
          </Stack>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
