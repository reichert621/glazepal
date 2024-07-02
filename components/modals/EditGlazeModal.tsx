import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {cn} from '@/utils';
import * as schema from '@/instant/schema';
import {SafeKeyboardAwareScrollView} from '@/components/SafeView';
import Input, {Textarea} from '@/components/Input';
import Button from '@/components/Button';
import {db} from '@/instant';
import {tx} from '@instantdb/react-native';

export default function EditGlazeModal({
  isVisible,
  glaze,
  onClose,
  onSave,
}: {
  isVisible: boolean;
  glaze: schema.Glaze;
  onClose: () => void;
  onSave: (glaze: schema.Glaze) => void;
}) {
  const [name, setName] = React.useState(glaze.name);
  const [description, setDescription] = React.useState(glaze.description || '');
  const [variant, setVariant] = React.useState(glaze.variant);
  const [isSaving, setSavingState] = React.useState(false);

  React.useEffect(() => {
    if (glaze) {
      setName(glaze.name);
      setDescription(glaze.description || '');
      setVariant(glaze.variant);
    }
  }, [glaze]);

  const handleSaveGlaze = async () => {
    try {
      if (!name || name.trim().length === 0 || !variant) {
        throw new Error('Please fill in all required fields');
      }

      setSavingState(true);

      const updates = {
        name: name.trim(),
        description: description.trim(),
        variant: variant.trim(),
      };

      await db.transact(tx.glazes[glaze.id].update(updates));
      console.log('Success!', updates);
      return onSave({...glaze, ...updates});
    } catch (err: any) {
      console.error('Failed to save', err);
      Alert.alert('Failed to save', err.message);
    } finally {
      setTimeout(() => setSavingState(false), 400);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View className="h-3/4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <KeyboardAwareScrollView className="flex-1">
          <View className="px-4 pt-4 flex flex-row justify-between relative">
            <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
              Edit glaze
            </Text>
            {/* NB: trying out larger tap target */}
            <Pressable className="absolute p-4 top-0 right-0" onPress={onClose}>
              <Ionicons name="close" color={colors.zinc[500]} size={24} />
            </Pressable>
          </View>

          <View className="mt-4 gap-6 px-4">
            <View className="gap-1">
              <Text className="text-base text-zinc-600 dark:text-zinc-400 font-medium">
                Name
              </Text>
              <Input
                className="w-full"
                placeholder="Name of glaze"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View className="gap-1">
              <Text className="text-base text-zinc-600 dark:text-zinc-400 font-medium">
                Type of glaze
              </Text>
              <View className="w-full flex flex-row items-center border rounded-xl border-zinc-300 dark:border-zinc-700">
                <Pressable
                  className={cn(
                    'flex-1 px-4 py-4 items-center justify-center',
                    variant === 'brush'
                      ? 'bg-zinc-800 dark:bg-zinc-100 rounded-l-xl'
                      : ''
                  )}
                  onPress={() => setVariant('brush')}
                >
                  <Text
                    className={cn(
                      'font-medium ',
                      variant === 'brush'
                        ? 'text-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-900 dark:text-zinc-300'
                    )}
                  >
                    Brushing
                  </Text>
                </Pressable>
                <Pressable
                  className={cn(
                    'flex-1 px-4 py-4 items-center justify-center',
                    variant === 'dip'
                      ? 'bg-zinc-800 dark:bg-zinc-100 rounded-r-xl'
                      : ''
                  )}
                  onPress={() => setVariant('dip')}
                >
                  <Text
                    className={cn(
                      'font-medium ',
                      variant === 'dip'
                        ? 'text-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-900 dark:text-zinc-300'
                    )}
                  >
                    Dipping
                  </Text>
                </Pressable>
              </View>
            </View>
            <View className="gap-1">
              <Text className="text-base text-zinc-600 dark:text-zinc-400 font-medium">
                Notes
              </Text>
              <Textarea
                className="w-full min-h-20"
                placeholder="Optional"
                value={description}
                onChangeText={setDescription}
              />
            </View>
            <Button
              className="w-full mt-2"
              text="Save"
              variant="primary"
              disabled={!name || !variant}
              pending={isSaving}
              onPress={handleSaveGlaze}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  );
}
