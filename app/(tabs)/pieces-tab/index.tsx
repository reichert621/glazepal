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
import {db} from '@/instant';
import {cn, prioritizeMostRecent} from '@/utils';
import ImageViewer from '@/components/ImageViewer';
import Input from '@/components/Input';
import AddActionsModal, {ActionItem} from '@/components/modals/AddActionsModal';
import ApplyFiltersModal from '@/components/modals/ApplyFiltersModal';

type SearchFilters = {
  variant: string;
  tags: schema.Tag[];
};

type FilterItem = {
  type: 'tag' | 'variant';
  label: string;
  value: string;
};

function PiecesContainer() {
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
    pieces: {glazes: {tags: {}}, combos: {tags: {}}, images: {}, tags: {}},
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

  const handleAddAction = (action: ActionItem) => {
    setOpenModal(null);

    switch (action.key) {
      case 'glaze':
        return router.push('pieces-tab/glazes/new');
      case 'combo':
        return router.push('pieces-tab/combos/new');
      case 'piece':
        return router.push('pieces-tab/pieces/new');
    }
  };

  const handleApplyFilters = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setOpenModal(null);
  };

  const pieces = (data.pieces || [])
    .filter((piece) => {
      const glazes = piece.glazes || [];
      const combos = piece.combos || [];
      const tags = [
        ...(piece.tags || []),
        ...combos.flatMap((c) => c.tags),
        ...glazes.flatMap((g) => g.tags),
      ];
      const hasValidTags = filters.tags.every((tag) => {
        return tags.some((t) => t.id === tag.id);
      });
      const tokens = [
        piece.name,
        piece.notes,
        ...glazes.map((g) => g.name),
        ...combos.map((c) => c.name),
        ...tags.map((t) => t.name),
      ].filter((str): str is string => !!str);
      const hasMatchingQuery = hasValidSearchQuery
        ? tokens.some((t) => t.toLowerCase().includes(query))
        : true;

      return hasValidTags && hasMatchingQuery;
    })
    .sort(prioritizeMostRecent);

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
        {pieces.length === 0 ? (
          <Text className="text-zinc-400 dark:text-zinc-500 text-lg">
            {hasValidSearchQuery
              ? 'No pieces found.'
              : 'No pieces have been added yet!'}
          </Text>
        ) : (
          <View className="flex flex-row flex-wrap pb-16">
            {pieces.sort(prioritizeMostRecent).map((piece) => (
              <Link
                key={piece.id}
                href={`pieces-tab/pieces/${piece.id}`}
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
        )}
      </ScrollView>

      <View className="absolute bottom-0 right-0 p-4">
        <Pressable
          className={cn(
            'flex-row justify-center items-center gap-3 border-2 rounded-full px-3 py-3',
            'border-zinc-700 bg-zinc-800 dark:border-zinc-200 dark:bg-zinc-100'
          )}
          onPress={() => setOpenModal('actions')}
        >
          <Ionicons
            name="add"
            size={24}
            color={isDark ? colors.zinc[900] : colors.zinc[100]}
          />
        </Pressable>
      </View>
      <ApplyFiltersModal
        isVisible={modal === 'filters'}
        current={filters}
        shouldIncludeGlazeTypes={false}
        onClose={() => setOpenModal(null)}
        onSubmit={handleApplyFilters}
      />
      <AddActionsModal
        isVisible={modal === 'actions'}
        actions={[
          {
            title: 'Add glaze',
            key: 'glaze',
            icon: 'brush',
          },
          {title: 'Add combo', key: 'combo', icon: 'flask'},
          {title: 'Add piece', key: 'piece', icon: 'cafe'},
        ]}
        onAction={handleAddAction}
        onClose={() => setOpenModal(null)}
      />
    </View>
  );
}

export default function PiecesScreen() {
  return (
    <SafeView style={{paddingBottom: 0}} className="bg-white dark:bg-zinc-950">
      <View className="pt-12 px-4">
        <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-4xl">
          My pieces
        </Text>
      </View>
      <PiecesContainer />
    </SafeView>
  );
}
