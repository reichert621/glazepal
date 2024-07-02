import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import {Link, router} from 'expo-router';
import useDebounce from 'react-use/esm/useDebounce';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';

import {cn, prioritizeMostRecent} from '@/utils';
import {SafeView} from '@/components/SafeView';
import * as schema from '@/instant/schema';
import Input from '@/components/Input';
import {ComboResponse, db} from '@/instant';
import AddActionsModal, {ActionItem} from '@/components/modals/AddActionsModal';
import GlazePreview from '@/components/GlazePreview';
import ApplyFiltersModal from '@/components/modals/ApplyFiltersModal';
import GlazeComboPreview from '@/components/GlazeComboPreview';

type SearchFilters = {
  variant: string;
  tags: schema.Tag[];
};

type FilterItem = {
  type: 'tag' | 'variant';
  label: string;
  value: string;
};

type ResultItem =
  | {
      type: 'glaze';
      glaze: schema.Glaze & {tags: schema.Tag[]; brands: schema.Brand[]};
    }
  | {
      type: 'combo';
      combo: schema.Combo;
    };

function formatVariantFilter(variant: string): FilterItem | null {
  switch (variant) {
    case 'dip':
      return {type: 'variant', label: 'Dipping glaze', value: 'dip'};
    case 'brush':
      return {type: 'variant', label: 'Brushing glaze', value: 'brush'};
    case 'all':
    default:
      return null;
  }
}

function formatFilterList(filters: SearchFilters): FilterItem[] {
  return [
    formatVariantFilter(filters.variant),
    ...filters.tags.map((t) => {
      return {type: 'tag', label: t.name, value: t.id};
    }),
  ].filter((item): item is FilterItem => !!item);
}

function GlazesContainer() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [q, setDebouncedQuery] = React.useState('');
  const [query, setSearchQuery] = React.useState('');
  const hasValidSearchQuery = query.trim().length > 0;
  const [filters, setSearchFilters] = React.useState<SearchFilters>({
    variant: 'all',
    tags: [],
  });
  const filterListItems = formatFilterList(filters);
  const [modal, setOpenModal] = React.useState<'actions' | 'filters' | null>(
    null
  );

  const {data, isLoading, error} = db.useQuery({
    glazes: {brands: {}, tags: {}},
    combos: {applications: {glazes: {}}, tags: {}},
    tags: {},
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
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-medium text-red-700">
          Failed to retrieve data
        </Text>
        <Text className="text-lg text-red-700">{error.message}</Text>
      </View>
    );
  } else if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  const handleAddAction = (action: ActionItem) => {
    setOpenModal(null);

    switch (action.key) {
      case 'glaze':
        return router.push('/glazes-tab/glazes/new');
      case 'combo':
        return router.push('/glazes-tab/combos/new');
      case 'piece':
        return router.push('/glazes-tab/pieces/new');
    }
  };

  const handleApplyFilters = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setOpenModal(null);
  };

  const shouldIncludeCombos = hasValidSearchQuery || filterListItems.length > 0;
  const glazes = data.glazes || [];
  const combos = data.combos || [];
  const glazeResultItems = data.glazes
    .filter((g) => {
      const isValidVariant =
        !filters.variant ||
        filters.variant === 'all' ||
        g.variant === filters.variant;

      const tags = g.tags || [];
      const hasValidTags = filters.tags.every((tag) => {
        return tags.some((t) => t.id === tag.id);
      });
      const tokens = [g.name, g.variant, ...tags.map((t) => t.name)];
      const hasMatchingQuery = hasValidSearchQuery
        ? tokens.some((t) => t.toLowerCase().includes(query))
        : true;

      return isValidVariant && hasValidTags && hasMatchingQuery;
    })
    // Sort alphabetically for now
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((glaze) => ({type: 'glaze', glaze}) as ResultItem);

  const comboResultItems = combos
    .filter((c) => {
      if (!shouldIncludeCombos) {
        return false;
      }

      const tags = c.tags || [];
      const hasValidTags = filters.tags.every((tag) => {
        return tags.some((t) => t.id === tag.id);
      });
      const tokens = [c.name, c.notes, ...tags.map((t) => t.name)].filter(
        (str): str is string => !!str
      );
      const hasMatchingQuery = hasValidSearchQuery
        ? tokens.some((t) => t.toLowerCase().includes(query))
        : true;

      return hasValidTags && hasMatchingQuery;
    })
    .sort(prioritizeMostRecent)
    .map((combo) => ({type: 'combo', combo}) as ResultItem);

  const results: ResultItem[] = [...glazeResultItems, ...comboResultItems];

  return (
    <View className="flex-1 relative">
      <View className="pt-4 px-4 flex flex-row items-center gap-4">
        <Input
          className="w-full"
          containerClassName="flex-1"
          placeholder="Search your glazes..."
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
            data={formatFilterList(filters)}
            horizontal
            renderItem={(data) => {
              return (
                <Pressable
                  className="flex flex-row items-center gap-1 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 rounded-full px-3 py-1"
                  onPress={() => {
                    if (data.item.type === 'variant') {
                      setSearchFilters({...filters, variant: 'all'});
                    } else {
                      setSearchFilters({
                        ...filters,
                        tags: filters.tags.filter(
                          (t) => t.id !== data.item.value
                        ),
                      });
                    }
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
      {results.length > 0 ? (
        <FlatList
          contentContainerClassName={cn(
            'pb-24',
            filterListItems.length > 0 ? 'pt-0' : 'pt-4'
          )}
          data={results}
          keyExtractor={(item) =>
            item.type === 'glaze' ? item.glaze.id : item.combo.id
          }
          renderItem={({item}) => {
            if (item.type === 'glaze') {
              const brand = item.glaze.brands[0];

              return (
                <Link href={`/glazes-tab/glazes/${item.glaze.id}`} asChild>
                  <Pressable className="px-4">
                    <GlazePreview
                      className="border-b border-zinc-100 dark:border-zinc-900"
                      glaze={item.glaze}
                      brand={brand}
                    />
                  </Pressable>
                </Link>
              );
            } else {
              return (
                <Link href={`/glazes-tab/combos/${item.combo.id}`} asChild>
                  <Pressable className="px-4">
                    <GlazeComboPreview
                      className="border-b border-zinc-100 dark:border-zinc-900"
                      combo={item.combo as ComboResponse}
                    />
                  </Pressable>
                </Link>
              );
            }
          }}
        />
      ) : glazes.length === 0 ? (
        <View className="p-4">
          <Text className="text-lg text-zinc-400 dark:text-zinc-500">
            No glazes have been added yet!
          </Text>
        </View>
      ) : (
        <View className="p-4">
          <Text className="text-lg text-zinc-400 dark:text-zinc-500">
            No glazes found.
          </Text>
        </View>
      )}

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

export default function GlazesScreen() {
  return (
    <SafeView style={{paddingBottom: 0}} className="bg-white dark:bg-zinc-950">
      <View className="pt-12 px-4">
        <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-4xl">
          My glazes
        </Text>
      </View>
      <GlazesContainer />
    </SafeView>
  );
}
