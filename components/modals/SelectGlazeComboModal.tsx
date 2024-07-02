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
import Animated, {FadeIn} from 'react-native-reanimated';

import {
  cn,
  formatGlazeCombo,
  formatGlazeVariant,
  prioritizeMostRecent,
} from '@/utils';
import Button from '@/components/Button';
import Input from '@/components/Input';

import * as schema from '@/instant/schema';
import {ComboResponse, GlazePart, db} from '@/instant';
import ImageViewer from '@/components/ImageViewer';

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

const ComboPreviewItem = ({
  className,
  combo,
  isSelected,
  isDark,
  onSelect,
}: {
  className?: string;
  combo: ComboResponse;
  isSelected?: boolean;
  isDark?: boolean;
  onSelect: (combo: ComboResponse) => void;
}) => {
  const {id, name, description, defaultImageUri, applications = []} = combo;
  const [base, ...layers] = applications
    .sort((a, b) => (a.isBase ? -1 : b.isBase ? 1 : 0))
    .map((a) => {
      const g = a.glazes[0];

      if (!g) {
        return null;
      } else if (a.layers === 1) {
        return g.name;
      } else {
        return `${g.name} ${a.layers}x`;
      }
    })
    .filter((str) => !!str);

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
      onPress={() => onSelect(combo)}
    >
      <View
        className={cn('flex flex-1 flex-row items-center gap-3', className)}
      >
        <ImageViewer
          className="h-12 w-12 rounded-md"
          image={defaultImageUri}
          debug={combo.name}
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
            {base || name}
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
            {layers.length > 0 ? layers.join(' / ') : '--'}
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

export default function SelectGlazeComboModal({
  isVisible,
  current,
  location,
  suggestedGlazeId,
  suggestedComboId,
  onClose,
  onSelect,
}: {
  isVisible: boolean;
  current?: GlazePart | null;
  location: 'inner' | 'outer';
  suggestedGlazeId?: string | null;
  suggestedComboId?: string | null;
  onClose: () => void;
  onSelect: (part: GlazePart) => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [selected, setSelectedOption] = React.useState<GlazePart | null>(null);

  const [q, setDebouncedQuery] = React.useState('');
  const [query, setSearchQuery] = React.useState('');
  const hasValidSearchQuery = query.trim().length > 0;

  const {data, isLoading, error} = db.useQuery({
    glazes: {},
    combos: {applications: {glazes: {}}},
  });
  const glazes = data?.glazes ?? [];
  const combos = data?.combos ?? [];
  // console.log(JSON.stringify(combos, null, 2));

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
      setSelectedOption(current);
    } else {
      setSelectedOption(null);
    }
  }, [current]);

  const handleSelectOption = (option: GlazePart) => {
    setSelectedOption(option);
    setTimeout(() => onSelect(option), 200);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      {isVisible && (
        <Animated.View
          className="absolute w-full h-[200%] -top-[100%]"
          entering={FadeIn}
        >
          <Pressable
            className="h-full w-full bg-zinc-950 opacity-60"
            onPress={onClose}
          />
        </Animated.View>
      )}
      <View className="h-5/6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <View className="p-4 _bg-zinc-50 flex flex-row justify-between">
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Select glaze combo
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
            {combos
              .filter((c) => {
                if (!hasValidSearchQuery) {
                  return true;
                }

                const str = [
                  c.name,
                  c.description,
                  ...c.applications.map((a) => a.glazes?.[0]?.name),
                ]
                  .filter((str) => !!str)
                  .join(' ')
                  .toLowerCase();

                return str.includes(query);
              })
              .sort((a, b) => {
                if (a.id === suggestedComboId) {
                  return -1;
                } else if (b.id === suggestedComboId) {
                  return 1;
                } else {
                  return prioritizeMostRecent(a, b);
                }
              })
              .map((combo) => {
                const {id} = combo;
                const isSelected =
                  selected?.type === 'combo' && selected?.combo?.id === id;
                const part: GlazePart = {type: 'combo', location, combo};

                return (
                  <ComboPreviewItem
                    key={id}
                    combo={combo as ComboResponse}
                    isSelected={isSelected}
                    isDark={isDarkMode}
                    onSelect={() => handleSelectOption(part)}
                  />
                );
              })}
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
                const isSelected =
                  selected?.type === 'glaze' && selected?.glaze?.id === id;
                const part: GlazePart = {type: 'glaze', location, glaze};

                return (
                  <GlazePreviewItem
                    key={id}
                    glaze={glaze}
                    isSelected={isSelected}
                    isDark={isDarkMode}
                    onSelect={() => handleSelectOption(part)}
                  />
                );
              })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
