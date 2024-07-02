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
import useDebounce from 'react-use/esm/useDebounce';

import {cn, formatGlazeVariant, prioritizeMostRecent} from '@/utils';
import Button from '@/components/Button';
import Input from '@/components/Input';

import * as schema from '@/instant/schema';
import {GlazeApplicationLayer, db} from '@/instant';
import ImageViewer from '@/components/ImageViewer';

const __GlazePreviewItem = ({
  glaze,
  isSelected,
  onSelect,
}: {
  glaze: schema.Glaze;
  isSelected?: boolean;
  onSelect: (glaze: schema.Glaze) => void;
}) => {
  const {name, variant} = glaze;

  return (
    <Pressable
      className={cn(
        'flex-row justify-between items-center gap-3 border-2 rounded-xl px-4 py-3',
        isSelected
          ? 'bg-zinc-900 border-zinc-800 dark:bg-zinc-50'
          : 'border-zinc-700 dark:border-zinc-800 dark:bg-zinc-900'
        // isDisabled ? 'opacity-80' : 'opacity-100',
      )}
      onPress={() => onSelect(glaze)}
    >
      <Text
        className={cn(
          'text-lg font-semibold',
          isSelected
            ? 'text-zinc-100 dark:text-zinc-900'
            : 'text-zinc-900 dark:text-zinc-100'
        )}
      >
        {name}
      </Text>
      <View className="">
        <Text
          className={cn(
            'text-base font-medium',
            isSelected
              ? 'text-zinc-500 dark:text-zinc-500'
              : 'text-zinc-500 dark:text-zinc-500'
          )}
        >
          {formatGlazeVariant(variant)}
        </Text>
        {/* <Ionicons
        name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
        color={
          isSelected
            ? colors.green[300]
            : isDarkMode
              ? colors.zinc[300]
              : colors.zinc[700]
        }
        size={20}
      /> */}
      </View>
    </Pressable>
  );
};

const GlazePreviewItem = ({
  className,
  glaze,
  isSelected,
  isDark,
  onSelect,
}: {
  className?: string;
  glaze: schema.Glaze;
  isSelected?: boolean;
  isDark?: boolean;
  onSelect: (glaze: schema.Glaze) => void;
}) => {
  const {id, name, variant, defaultImageUri} = glaze;

  const getIconColor = React.useCallback(() => {
    if (isSelected) {
      return isDark ? colors.green[600] : colors.green[300];
    } else {
      return isDark ? colors.zinc[500] : colors.zinc[500];
    }
  }, [isSelected, isDark]);

  return (
    <Pressable
      className={cn(
        'p-2 flex flex-row justify-between items-center rounded-lg border border-zinc-200 dark:border-zinc-800',
        isSelected ? 'bg-zinc-900 dark:bg-zinc-100' : ''
      )}
      onPress={() => onSelect(glaze)}
    >
      <View
        className={cn('flex flex-1 flex-row items-center gap-3', className)}
      >
        <ImageViewer
          className="h-12 w-12 rounded-md"
          image={defaultImageUri}
          debug={glaze.name}
        />
        <View className="flex-1">
          <Text
            className={cn(
              'w-64 text-base font-medium',
              isSelected
                ? 'text-zinc-100 dark:text-zinc-900'
                : 'text-zinc-900 dark:text-zinc-100'
            )}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            className={cn(
              'capitalize text-base',
              isSelected
                ? 'text-zinc-400 dark:text-zinc-600'
                : 'text-zinc-600 dark:text-zinc-400'
            )}
            numberOfLines={1}
          >
            {formatGlazeVariant(variant)}
          </Text>
        </View>
      </View>
      <View className="p-1">
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
          color={getIconColor()}
          size={isSelected ? 20 : 16}
        />
      </View>
    </Pressable>
  );
};

export default function SelectGlazeModal({
  isVisible,
  isBase,
  current,
  suggestedGlazeId,
  onClose,
  onSelect,
}: {
  isVisible: boolean;
  isBase?: boolean;
  current?: schema.Glaze | null;
  suggestedGlazeId?: string | null;
  onClose: () => void;
  onSelect: (glaze: schema.Glaze) => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [selected, setSelectedOption] = React.useState<schema.Glaze | null>(
    null
  );

  const [q, setDebouncedQuery] = React.useState('');
  const [query, setSearchQuery] = React.useState('');
  const hasValidSearchQuery = query.trim().length > 0;

  const {data, isLoading, error} = db.useQuery({glazes: {}});
  const glazes = data?.glazes ?? [];

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

  React.useEffect(() => {
    if (current) {
      const found = glazes.find((item) => item.id === current.id);

      if (found) {
        setSelectedOption(found);
      }
    } else {
      setSelectedOption(null);
    }
  }, [current, glazes.length]);

  const handleSelectOption = (option: schema.Glaze) => {
    setSelectedOption(option);
    setTimeout(() => onSelect(option), 200);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View className="h-3/4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <View className="p-4 _bg-zinc-50 flex flex-row justify-between">
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Select glaze
          </Text>
          <Pressable onPress={() => onClose()}>
            <Ionicons name="close" color={colors.zinc[500]} size={24} />
          </Pressable>
        </View>
        <View className="px-4">
          <Input
            className="w-full"
            placeholder="Search for a glaze..."
            value={q}
            icon={query.trim().length > 0 ? 'close-circle' : null}
            onPressIcon={() => {
              setDebouncedQuery('');
              setSearchQuery('');
            }}
            onChangeText={setDebouncedQuery}
          />
        </View>
        <ScrollView className="flex-1">
          {isLoading && (
            <View className="items-center justify-center p-8">
              <ActivityIndicator />
            </View>
          )}
          <View className="pt-4 pb-20 px-4 gap-1">
            {glazes
              .filter((g) => {
                if (!hasValidSearchQuery) {
                  return true;
                }

                return g.name.toLowerCase().includes(query);
              })
              .sort((a, b) => {
                if (a.id === suggestedGlazeId) {
                  return -1;
                } else if (b.id === suggestedGlazeId) {
                  return 1;
                } else {
                  return a.name.localeCompare(b.name);
                }
              })
              .map((glaze) => {
                const {id} = glaze;
                const isSelected = selected?.id === id;

                return (
                  <GlazePreviewItem
                    key={id}
                    glaze={glaze}
                    isSelected={isSelected}
                    isDark={isDarkMode}
                    onSelect={handleSelectOption}
                  />
                );
              })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
