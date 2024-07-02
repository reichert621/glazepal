import {Link, router, useLocalSearchParams} from 'expo-router';
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {db} from '@/instant';
import EditGlazeForm from '@/components/forms/EditGlazeForm';

export default function EditGlazeModal() {
  const isPresented = router.canGoBack();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const glazeId = params.glaze as string;

  const {data, isLoading, error} = db.useQuery({
    glazes: {
      brands: {},
      tags: {},
      $: {where: {id: glazeId}},
    },
  });

  const glaze = data?.glazes[0];

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate(`/`);
    }
  };

  return (
    <View className="bg-white flex-1 dark:bg-zinc-950">
      <View className="bg-zinc-100 dark:bg-zinc-900 px-4 py-4 flex flex-row items-center justify-between relative">
        <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
          Edit glaze
        </Text>
        {/* NB: trying out larger tap target */}
        <Pressable className="absolute p-4 top-0 right-0" onPress={handleClose}>
          <Ionicons name="close" color={colors.zinc[500]} size={24} />
        </Pressable>
      </View>

      {!!glaze && <EditGlazeForm glaze={glaze} onSave={handleClose} />}
    </View>
  );
}
