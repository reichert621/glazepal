import {Link, SplashScreen, Stack, router} from 'expo-router';
import {useColorScheme} from 'nativewind';

export default function Layout() {
  const {colorScheme} = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="index" options={{title: 'Settings'}} />
      <Stack.Screen name="login" options={{title: 'Sign in'}} />
      <Stack.Screen name="register" options={{title: 'Create an account'}} />
    </Stack>
  );
}
