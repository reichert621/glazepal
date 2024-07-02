import React from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';
import {Link, router, useLocalSearchParams} from 'expo-router';

import {db} from '@/instant';
import EditComboForm from '@/components/forms/EditComboForm';

export default function EditComboModal() {
  const params = useLocalSearchParams();
  const glazeId = params.glaze as string;
  const comboId = params.combo as string;

  const {data, isLoading, error} = db.useQuery({
    combos: {
      applications: {glazes: {}},
      tags: {},
      $: {where: {id: comboId}},
    },
  });

  const combo = data?.combos[0] as any;

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
          Edit combination
        </Text>
        {/* NB: trying out larger tap target */}
        <Pressable className="absolute p-4 top-0 right-0" onPress={handleClose}>
          <Ionicons name="close" color={colors.zinc[500]} size={24} />
        </Pressable>
      </View>
      {!!combo && (
        <EditComboForm glazeId={glazeId} combo={combo} onSave={handleClose} />
      )}
    </View>
  );
}
