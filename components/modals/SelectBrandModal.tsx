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

import {cn, formatGlazeVariant, prioritizeMostRecent} from '@/utils';
import Button from '@/components/Button';
import Input from '@/components/Input';

import * as schema from '@/instant/schema';
import {db} from '@/instant';

const BrandItem = ({
  className,
  brand,
  isSelected,
  isDark,
  onSelect,
}: {
  className?: string;
  brand: schema.Brand;
  isSelected?: boolean;
  isDark?: boolean;
  onSelect: (brand: schema.Brand) => void;
}) => {
  const {id, name} = brand;

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
        'py-3 pl-3 pr-2 flex flex-row justify-between items-center rounded-lg border border-zinc-200 dark:border-zinc-800',
        isSelected ? 'bg-zinc-900 dark:bg-zinc-100' : ''
      )}
      onPress={() => onSelect(brand)}
    >
      <View className={cn('flex flex-1 flex-row items-center', className)}>
        <View className="flex-1">
          <Text
            className={cn(
              'text-lg font-medium',
              isSelected
                ? 'text-zinc-100 dark:text-zinc-900'
                : 'text-zinc-900 dark:text-zinc-100'
            )}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
      </View>
      <View className="px-1">
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'chevron-forward'}
          color={getIconColor()}
          size={isSelected ? 20 : 16}
        />
      </View>
    </Pressable>
  );
};

export default function SelectBrandModal({
  isVisible,
  current,
  onClose,
  onSelect,
}: {
  isVisible: boolean;

  current?: schema.Brand | null;
  onClose: () => void;
  onSelect: (glaze: schema.Brand) => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [selected, setSelectedOption] = React.useState<schema.Brand | null>(
    null
  );

  const {data, isLoading, error} = db.useQuery({brands: {}});
  const brands = data?.brands ?? [];

  // React.useEffect(() => {
  //   if (!isLoading && brands.length === 0) {
  //     const items = [
  //       {name: 'Mayco'},
  //       {name: 'Amaco'},
  //       {name: 'Spectrum'},
  //       {name: 'Coyote'},
  //       {name: 'Opulence'},
  //       {name: 'Speedball'},
  //       {name: 'Laguna'},
  //       {name: "Georgie's"},
  //     ];

  //     const txns = items.map((item) => {
  //       return tx.brands[id()].update({
  //         ...item,
  //         createdAt: Date.now(),
  //         updatedAt: Date.now(),
  //       });
  //     });

  //     db.transact(txns).then(console.log).catch(console.error);
  //   }
  // }, [isLoading, brands.length]);

  React.useEffect(() => {
    if (current) {
      const found = brands.find((item) => item.id === current.id);

      if (found) {
        setSelectedOption(found);
      }
    } else {
      setSelectedOption(null);
    }
  }, [current, brands.length]);

  const handleSelectOption = (option: schema.Brand) => {
    setSelectedOption(option);
    setTimeout(() => onSelect(option), 200);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View className="h-3/4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <View className="p-4 flex flex-row justify-between">
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Select brand
          </Text>
          <Pressable onPress={() => onClose()}>
            <Ionicons name="close" color={colors.zinc[500]} size={24} />
          </Pressable>
        </View>
        <ScrollView className="flex-1">
          {isLoading && (
            <View className="items-center justify-center p-8">
              <ActivityIndicator />
            </View>
          )}
          <View className="pt-4 pb-20 px-4 gap-1">
            {brands
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((brand) => {
                const {id} = brand;
                const isSelected = selected?.id === id;

                return (
                  <BrandItem
                    key={id}
                    brand={brand}
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
