import React from 'react';
import {Link, router} from 'expo-router';
import {Text, View, useColorScheme} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function ModalScreen() {
  const isPresented = router.canGoBack();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-white flex-1 dark:bg-zinc-950">
      <View className="mb-8 p-4 bg-zinc-100 dark:bg-zinc-900">
        <Link href="../">
          <Text className="text-blue-500 font-medium">Close</Text>
        </Link>
      </View>
      <Animated.View className="mb-6" entering={FadeIn}>
        <View className="mb-4 px-4">
          <Text className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-200">
            Hello world!
          </Text>
          <Text className="font-medium text-zinc-500 text-lg">
            This is an example modal.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
