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
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function LayerQuantityModal({
  isVisible,
  current,
  onClose,
  onSubmit,
}: {
  isVisible: boolean;
  current?: number | null;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [quantityInput, setQuantityInput] = React.useState('1');
  const quantity = Number(quantityInput.replace(/\D/g, '') || 1);

  React.useEffect(() => {
    if (current) {
      setQuantityInput(String(current || 1));
    } else {
      setQuantityInput('1');
    }
  }, [current]);

  const handleSaveQuantity = () => {
    onSubmit(quantity);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View className="h-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <View className="p-4 _bg-zinc-50 flex flex-row justify-between">
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Set layer quantity
          </Text>
          <Pressable onPress={() => onClose()}>
            <Ionicons name="close" color={colors.zinc[500]} size={24} />
          </Pressable>
        </View>
        <View className="gap-2 pt-2 pb-4 border-t border-zinc-200 dark:border-zinc-800 px-4">
          <Text className="text-base text-zinc-600 dark:text-zinc-400 font-medium">
            How many layers?
          </Text>
          <View className="flex flex-row items-center gap-2">
            <Pressable
              className={cn(
                'flex-row justify-center items-center gap-3 border-2 rounded-xl px-3 py-3',
                'border-zinc-700 bg-zinc-800 dark:border-zinc-200 dark:bg-zinc-100',
                quantity <= 1 ? 'opacity-80' : 'opacity-100'
              )}
              disabled={quantity < 1}
              onPress={() =>
                setQuantityInput(Math.max(quantity - 1, 1).toString())
              }
            >
              <Ionicons
                name="remove"
                size={20}
                color={isDarkMode ? colors.zinc[900] : colors.zinc[100]}
              />
            </Pressable>
            <Input
              containerClassName="flex-1"
              className="flex-1 items-center justify-center text-center"
              placeholder="1"
              keyboardType="numeric"
              value={quantityInput}
              onChangeText={(value) =>
                setQuantityInput(value.replace(/\D/g, ''))
              }
            />
            <Pressable
              className={cn(
                'flex-row justify-center items-center gap-3 border-2 rounded-xl px-3 py-3',
                'border-zinc-700 bg-zinc-800 dark:border-zinc-200 dark:bg-zinc-100',
                quantity >= 9 ? 'opacity-80' : 'opacity-100'
              )}
              disabled={quantity >= 9}
              onPress={() =>
                setQuantityInput(Math.min(quantity + 1, 9).toString())
              }
            >
              <Ionicons
                name="add"
                size={20}
                color={isDarkMode ? colors.zinc[900] : colors.zinc[100]}
              />
            </Pressable>
          </View>

          <View className="mt-4">
            <Button
              text="Update quantity"
              variant="primary"
              onPress={handleSaveQuantity}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
