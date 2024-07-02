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
import {Link, router, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {db} from '@/instant';
import EditPieceForm from '@/components/forms/EditPieceForm';

export default function EditPieceModal() {
  const isPresented = router.canGoBack();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const pieceId = params.piece as string;

  const {data, isLoading, error} = db.useQuery({
    pieces: {
      tags: {},
      parts: {
        glazes: {},
        combos: {
          applications: {glazes: {}},
        },
      },
      $: {where: {id: pieceId}},
    },
  });

  const piece = data?.pieces[0];

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
          Edit piece
        </Text>
        {/* NB: trying out larger tap target */}
        <Pressable className="absolute p-4 top-0 right-0" onPress={handleClose}>
          <Ionicons name="close" color={colors.zinc[500]} size={24} />
        </Pressable>
      </View>

      {!!piece && <EditPieceForm piece={piece} onSave={handleClose} />}
    </View>
  );
}
