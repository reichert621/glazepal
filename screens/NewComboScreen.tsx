import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';
import {Link, router, useLocalSearchParams, useSegments} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import * as schema from '@/instant/schema';
import NewComboForm from '@/components/forms/NewComboForm';

export default function NewComboScreen() {
  const [, root] = useSegments();
  const params = useLocalSearchParams();
  const glazeId = params.glaze as string;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  console.log(params);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate(glazeId ? `/${root}/glazes/${glazeId}` : `/${root}`);
    }
  };

  const handleRedirect = async (combo: schema.Combo) => {
    return router.push(`${root}/combos/${combo.id}`);
  };

  return (
    <View className="bg-white dark:bg-zinc-950 flex-1">
      <View
        style={{paddingTop: insets.top}}
        className="_bg-zinc-50 _dark:bg-zinc-900 flex flex-row px-4 pb-2 gap-4 items-center justify-between"
      >
        <Pressable
          className="w-12 h-12 items-start justify-center"
          onPress={handleGoBack}
        >
          <Ionicons name="chevron-back" size={24} color={colors.zinc[400]} />
        </Pressable>

        {/* TODO: show which container we're adding an item to */}
        <View className="flex-1 justify-center items-center">
          <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-2xl">
            Add a combination
          </Text>
        </View>
        <View className="w-12 h-12" />
      </View>
      <NewComboForm glazeId={glazeId} onSave={handleRedirect} />
    </View>
  );
}
