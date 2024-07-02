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
import NewPieceForm from '@/components/forms/NewPieceForm';

export default function NewPieceScreen() {
  const [, root] = useSegments();
  const params = useLocalSearchParams();
  const glazeId = params.glaze as string;
  const comboId = params.combo as string;
  const parentHref = comboId
    ? `/${root}/combos/${comboId}`
    : glazeId
      ? `/${root}/glazes/${glazeId}`
      : `/${root}`;

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const handleRedirect = async () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate(parentHref);
    }
  };

  return (
    <View className="bg-white dark:bg-zinc-950 flex-1">
      <View
        style={{paddingTop: insets.top}}
        className="_bg-zinc-50 _dark:bg-zinc-900 flex flex-row px-4 pb-2 gap-4 items-center justify-between"
      >
        <Pressable
          className="w-12 h-12 items-start justify-center"
          onPress={handleRedirect}
        >
          <Ionicons name="chevron-back" size={24} color={colors.zinc[400]} />
        </Pressable>

        <View className="flex-1 items-center justify-center">
          <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-2xl">
            Add a piece
          </Text>
        </View>
        <View className="w-12 h-12" />
      </View>

      <NewPieceForm onSave={handleRedirect} />
    </View>
  );
}
