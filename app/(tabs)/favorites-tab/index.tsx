import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Link, router, useLocalSearchParams} from 'expo-router';
import colors from 'tailwindcss/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useDebounce from 'react-use/esm/useDebounce';

import * as schema from '@/instant/schema';
import {SafeScrollView, SafeView} from '@/components/SafeView';
import {ComboResponse, db} from '@/instant';
import {cn, prioritizeMostRecent} from '@/utils';
import ImageViewer from '@/components/ImageViewer';
import Input from '@/components/Input';
import AddActionsModal, {ActionItem} from '@/components/modals/AddActionsModal';
import ApplyFiltersModal from '@/components/modals/ApplyFiltersModal';
import GlazeComboPreview from '@/components/GlazeComboPreview';
import GlazePreview from '@/components/GlazePreview';

type SearchFilters = {
  variant: string;
  tags: schema.Tag[];
};

type FilterItem = {
  type: 'tag' | 'variant';
  label: string;
  value: string;
};

function FavoritesContainer() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [q, setDebouncedQuery] = React.useState('');
  const [query, setSearchQuery] = React.useState('');
  const hasValidSearchQuery = query.trim().length > 0;
  const [filters, setSearchFilters] = React.useState<SearchFilters>({
    variant: 'all',
    tags: [],
  });
  const filterListItems = filters.tags.map((t) => ({
    type: 'tag',
    label: t.name,
    value: t.id,
  }));
  const [modal, setOpenModal] = React.useState<'actions' | 'filters' | null>(
    null
  );

  const {data, isLoading, error} = db.useQuery({
    pieces: {
      $: {where: {isFavorite: true}},
      // images: {},
      tags: {},
    },
    combos: {
      $: {where: {isFavorite: true}},
      applications: {glazes: {}},
      // images: {},
      tags: {},
    },
    glazes: {
      $: {where: {isFavorite: true}},
      // images: {},
      tags: {},
    },
  });
  // console.log(JSON.stringify(data, null, 2));

  useDebounce(
    () => {
      if (q && q.trim().length > 0) {
        setSearchQuery(q.trim().toLowerCase());
      } else {
        setSearchQuery('');
      }
    },
    400,
    [q]
  );

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <Text className="text-lg font-medium text-red-700 dark:text-red-400">
          Failed to retrieve data
        </Text>
        <Text className="text-lg text-red-700 dark:text-red-400">
          {error.message}
        </Text>
      </View>
    );
  } else if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <ActivityIndicator />
      </View>
    );
  } else if (!data) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <Text className="text-lg font-medium text-red-700 dark:text-red-400">
          Not found
        </Text>
      </View>
    );
  }

  const handleApplyFilters = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setOpenModal(null);
  };

  const pieces = (data.pieces || [])
    .filter((piece) => {
      const tags = piece.tags || [];
      const hasValidTags = filters.tags.every((tag) => {
        return tags.some((t) => t.id === tag.id);
      });
      const tokens = [
        piece.name,
        piece.notes,
        ...tags.map((t) => t.name),
      ].filter((str): str is string => !!str);
      const hasMatchingQuery = hasValidSearchQuery
        ? tokens.some((t) => t.toLowerCase().includes(query))
        : true;

      return hasValidTags && hasMatchingQuery;
    })
    .sort(prioritizeMostRecent);

  const combos = (data.combos || []).sort(prioritizeMostRecent);
  const glazes = (data.glazes || []).sort((a, b) =>
    a.name?.localeCompare(b.name)
  );

  return (
    <View className="flex-1 relative">
      <View className="pt-4 px-4 flex flex-row items-center gap-4">
        <Input
          className="w-full"
          containerClassName="flex-1"
          placeholder="Search your pieces..."
          value={q}
          icon={query.trim().length > 0 ? 'close-circle' : null}
          onPressIcon={() => {
            setDebouncedQuery('');
            setSearchQuery('');
          }}
          onChangeText={setDebouncedQuery}
        />
        <Pressable
          className="flex-0 p-1"
          onPress={() => setOpenModal('filters')}
        >
          <Ionicons
            name="options"
            size={24}
            color={isDark ? colors.zinc[300] : colors.zinc[700]}
          />
        </Pressable>
      </View>
      {filterListItems.length > 0 && (
        <View>
          <FlatList
            contentContainerClassName="gap-1 px-4 pt-2 pb-1"
            data={filterListItems}
            horizontal
            renderItem={(data) => {
              return (
                <Pressable
                  className="flex flex-row items-center gap-1 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 rounded-full px-3 py-1"
                  onPress={() => {
                    setSearchFilters({
                      ...filters,
                      tags: filters.tags.filter(
                        (t) => t.id !== data.item.value
                      ),
                    });
                  }}
                >
                  <Ionicons
                    name="close-outline"
                    size={16}
                    color={colors.zinc[500]}
                  />
                  <Text className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    {data.item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      <ScrollView
        className={cn(
          'flex-1 px-4 pb-4',
          filterListItems.length > 0 ? 'pt-2' : 'pt-4'
        )}
      >
        {pieces.length > 0 && (
          <View className="pb-8">
            <Text className="text-sm mb-2 font-semibold tracking-widest uppercase text-zinc-500">
              Pieces
            </Text>
            <View className="flex flex-row flex-wrap ">
              {pieces.map((piece) => (
                <Link
                  key={piece.id}
                  href={`/favorites-tab/pieces/${piece.id}`}
                  asChild
                >
                  <Pressable className="w-1/3 p-px">
                    <View className="">
                      {piece.defaultImageUri ? (
                        <ImageViewer
                          className="aspect-square rounded"
                          image={piece.defaultImageUri}
                        />
                      ) : (
                        <View className="aspect-square justify-center items-center rounded-lg bg-zinc-800 dark:bg-zinc-200">
                          <Ionicons
                            name="image"
                            color={colors.zinc[600]}
                            size={20}
                          />
                        </View>
                      )}
                    </View>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        )}
        {combos.length > 0 && (
          <View className="pb-8">
            <Text className="text-sm mb-1 font-semibold tracking-widest uppercase text-zinc-500">
              Combinations
            </Text>
            <View className="">
              {combos.map((combo) => (
                <Link
                  key={combo.id}
                  href={`/favorites-tab/combos/${combo.id}`}
                  asChild
                >
                  <Pressable className="w-full">
                    <GlazeComboPreview
                      className="border-t border-zinc-100 dark:border-zinc-900"
                      combo={combo as any}
                    />
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        )}
        {glazes.length > 0 && (
          <View className="pb-8">
            <Text className="text-sm mb-1 font-semibold tracking-widest uppercase text-zinc-500">
              Glazes
            </Text>
            <View className="">
              {glazes.map((glaze) => (
                <Link
                  key={glaze.id}
                  href={`/favorites-tab/glazes/${glaze.id}`}
                  asChild
                >
                  <Pressable className="w-full">
                    <GlazePreview
                      className="border-t border-zinc-100 dark:border-zinc-900"
                      glaze={glaze}
                    />
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <ApplyFiltersModal
        isVisible={modal === 'filters'}
        current={filters}
        shouldIncludeGlazeTypes={false}
        onClose={() => setOpenModal(null)}
        onSubmit={handleApplyFilters}
      />
    </View>
  );
}

export default function FavoritesScreen() {
  return (
    <SafeView style={{paddingBottom: 0}} className="bg-white dark:bg-zinc-950">
      <View className="pt-12 px-4">
        <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-4xl">
          My favorites
        </Text>
      </View>
      <FavoritesContainer />
    </SafeView>
  );
}
