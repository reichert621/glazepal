import {Link, Stack, router} from 'expo-router';
import {useColorScheme} from 'nativewind';

export default function Layout() {
  const {colorScheme} = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="index" options={{title: 'Favorites'}} />
      <Stack.Screen name="pieces/[piece]/index" options={{title: 'Piece'}} />
      <Stack.Screen
        name="pieces/[piece]/edit"
        options={{title: 'Edit piece'}}
      />
      <Stack.Screen name="glazes/[glaze]" options={{title: 'Glaze'}} />
      <Stack.Screen name="combos/[combo]/index" options={{title: 'Combo'}} />
      <Stack.Screen
        name="combos/[combo]/edit"
        options={{title: 'Edit combo'}}
      />
    </Stack>
  );
}
