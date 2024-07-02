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

import {SafeView} from '@/components/SafeView';
import {ComboResponse, db} from '@/instant';
import EditComboForm from '@/components/forms/EditComboForm';

export default function EditComboScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [, root] = useSegments();
  const params = useLocalSearchParams();
  const glazeId = params.glaze as string;
  const comboId = params.combo as string;
  const parentHref = `/${root}/combos/${comboId}`;

  const {data, isLoading, error} = db.useQuery({
    combos: {
      applications: {glazes: {}},
      tags: {},
      $: {where: {id: comboId}},
    },
  });

  const handleGoBack = async () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate(parentHref);
    }
  };

  const combo = data?.combos[0] as any;

  return (
    <SafeView style={{paddingTop: 0}} className="bg-white dark:bg-zinc-950">
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
        <View className="flex-1 items-center justify-center">
          <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-2xl">
            Edit combination
          </Text>
        </View>
        <View className="w-12 h-12" />
      </View>
      {!!combo ? (
        <EditComboForm glazeId={glazeId} combo={combo} onSave={handleGoBack} />
      ) : (
        <View className="bg-white dark:bg-zinc-950 flex-1 p-8 items-center justify-center">
          <ActivityIndicator />
        </View>
      )}
    </SafeView>
  );
}
