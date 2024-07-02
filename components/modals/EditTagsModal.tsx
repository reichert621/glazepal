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
import {id, tx} from '@instantdb/react-native';

export default function EditTagsModal({
  isVisible,
  current = [],
  onClose,
  onSubmit,
}: {
  isVisible: boolean;
  current?: schema.Tag[];
  onClose: () => void;
  onSubmit: (data: {add: schema.Tag[]; remove: schema.Tag[]}) => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const currentlySelectedById = current.reduce(
    (acc, tag) => {
      return {...acc, [tag.id]: tag};
    },
    {} as Record<string, schema.Tag>
  );
  const [selected, setSelectedTags] = React.useState<
    Record<string, schema.Tag>
  >(currentlySelectedById);
  const {data, isLoading, error} = db.useQuery({tags: {}});
  const tags = data?.tags || [];

  const handleToggleTag = (tag: schema.Tag) => {
    setSelectedTags((prev) => {
      if (prev[tag.id]) {
        const {[tag.id]: _, ...updated} = prev;

        return updated;
      } else {
        return {...prev, [tag.id]: tag};
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

  const handleUpdateTags = () => {
    const add = tags.filter(
      (tag) => selected[tag.id] && !currentlySelectedById[tag.id]
    );
    const remove = current.filter((tag) => !selected[tag.id]);

    return onSubmit({add, remove});
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View className="h-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <View className="p-4 _bg-zinc-50 flex flex-row justify-between">
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Update tags
          </Text>
          <Pressable onPress={() => onClose()}>
            <Ionicons name="close" color={colors.zinc[500]} size={24} />
          </Pressable>
        </View>
        <View className="flex-1 pt-4 pb-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-4">
          <View className="flex flex-row flex-wrap gap-2">
            {tags
              .sort((a, b) => a.rank - b.rank)
              .map((tag) => {
                const isSelected = !!selected[tag.id];

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
          <View className="mt-6">
            <Button
              text="Update tags"
              variant="primary"
              onPress={handleUpdateTags}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
