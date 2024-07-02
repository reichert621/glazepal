import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';

import {cn} from '@/utils';
import * as schema from '@/instant/schema';
import Button from '@/components/Button';
import {db} from '@/instant';

type Filters = {
  variant: string;
  tags: schema.Tag[];
};

const defaultFilters: Filters = {variant: 'all', tags: []};

export default function ApplyFiltersModal({
  isVisible,
  current = defaultFilters,
  shouldIncludeGlazeTypes = true,
  onClose,
  onSubmit,
}: {
  isVisible: boolean;
  current?: Filters;
  shouldIncludeGlazeTypes?: boolean;
  onClose: () => void;
  onSubmit: (data: Filters) => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [selectedVariant, setSelectedVariant] = React.useState<string>('all');
  const [selectedTags, setSelectedTags] = React.useState<schema.Tag[]>(
    current.tags || []
  );
  const selectedTagsById = React.useMemo(
    () =>
      selectedTags.reduce(
        (acc, tag) => {
          return {...acc, [tag.id]: tag};
        },
        {} as Record<string, schema.Tag>
      ),
    [selectedTags]
  );

  React.useEffect(() => {
    const hasChangedFilters =
      current.variant !== selectedVariant ||
      current.tags.length !== selectedTags.length;

    if (hasChangedFilters) {
      setSelectedVariant(current.variant);
      setSelectedTags(current.tags);
    }
  }, [current]);

  const {data, isLoading, error} = db.useQuery({tags: {}});
  const tags = data?.tags || [];

  const handleToggleTag = (tag: schema.Tag) => {
    setSelectedTags((prev) => {
      if (prev.some((t) => t.id === tag.id)) {
        return prev.filter((t) => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const getIconColor = (isSelected: boolean) => {
    if (isSelected) {
      return isDarkMode ? colors.zinc[900] : colors.zinc[100];
    } else {
      return isDarkMode ? colors.zinc[300] : colors.zinc[700];
    }
  };

  const handleClearFilters = () => {
    setSelectedVariant(defaultFilters.variant);
    setSelectedTags(defaultFilters.tags);
    onSubmit(defaultFilters);
  };

  const handleApplyFilters = () => {
    onSubmit({variant: selectedVariant, tags: selectedTags});
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View className="h-1/2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <View className="p-4 _bg-zinc-50 flex flex-row justify-between">
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Apply filters
          </Text>
          <Pressable onPress={() => onClose()}>
            <Ionicons name="close" color={colors.zinc[500]} size={24} />
          </Pressable>
        </View>
        <View className="flex-1 pt-4 pb-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-4">
          {shouldIncludeGlazeTypes && (
            <View>
              <Text className="text-sm mb-2 font-semibold tracking-widest uppercase text-zinc-500">
                Glaze types
              </Text>
              <View className="flex flex-row flex-wrap gap-2">
                {[
                  {value: 'all', label: 'All'},
                  {value: 'brush', label: 'Brushing'},
                  {value: 'dip', label: 'Dipping'},
                ].map(({value, label}) => {
                  const isSelected = selectedVariant === value;

                  return (
                    <Pressable
                      key={value}
                      className={cn(
                        'flex flex-row items-center gap-1 border rounded-full px-3 py-1',
                        isSelected
                          ? 'border-zinc-800 bg-zinc-900 dark:bg-zinc-100 dark:border-zinc-200'
                          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                      )}
                      onPress={() => setSelectedVariant(value)}
                    >
                      <Ionicons
                        name={isSelected ? 'checkmark' : 'add'}
                        size={16}
                        color={getIconColor(isSelected)}
                      />
                      <Text
                        className={cn(
                          'text-base font-medium',
                          isSelected
                            ? 'text-zinc-100 dark:text-zinc-900'
                            : 'text-zinc-700 dark:text-zinc-300'
                        )}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
          <View className="mt-4">
            <Text className="text-sm mb-2 font-semibold tracking-widest uppercase text-zinc-500">
              Tags
            </Text>
            <View className="flex flex-row flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = !!selectedTagsById[tag.id];

                return (
                  <Pressable
                    key={tag.id}
                    className={cn(
                      'flex flex-row items-center gap-1 border rounded-full px-3 py-1',
                      isSelected
                        ? 'border-zinc-800 bg-zinc-900 dark:bg-zinc-100 dark:border-zinc-200'
                        : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                    )}
                    onPress={() => handleToggleTag(tag)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark' : 'add'}
                      size={16}
                      color={getIconColor(isSelected)}
                    />
                    <Text
                      className={cn(
                        'text-base font-medium',
                        isSelected
                          ? 'text-zinc-100 dark:text-zinc-900'
                          : 'text-zinc-700 dark:text-zinc-300'
                      )}
                    >
                      {tag.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View className="mt-8 gap-2">
            <Button
              className="w-full"
              text="Apply"
              variant="primary"
              onPress={handleApplyFilters}
            />
            <Button
              className="w-full"
              text="Clear"
              variant="secondary"
              onPress={handleClearFilters}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
