import React from 'react';
import {ActivityIndicator, Alert, Pressable, Text, View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {tx} from '@instantdb/react-native';

import {cn} from '@/utils';
import * as schema from '@/instant/schema';
import Input, {Textarea} from '@/components/Input';
import Button from '@/components/Button';
import {db} from '@/instant';
import SelectBrandModal from '@/components/modals/SelectBrandModal';

export default function EditGlazeForm({
  glaze,
  onSave,
}: {
  glaze: schema.Glaze & {brands: schema.Brand[]};
  onSave: (glaze: schema.Glaze) => void;
}) {
  const currentlySelectedBrand = glaze.brands[0];
  const [name, setName] = React.useState(glaze.name);
  const [description, setDescription] = React.useState(glaze.description || '');
  const [variant, setVariant] = React.useState(glaze.variant);
  const [brand, setBrand] = React.useState<schema.Brand | null>(
    currentlySelectedBrand || null
  );
  const [modal, setOpenModal] = React.useState<'image' | 'brand' | null>(null);
  const [isSaving, setSavingState] = React.useState(false);

  React.useEffect(() => {
    if (glaze) {
      setName(glaze.name);
      setDescription(glaze.description || '');
      setVariant(glaze.variant);
      setBrand(glaze.brands[0] || null);
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
      const links = brand ? [tx.brands[brand.id].link({glazes: glaze.id})] : [];
      const unlinks = currentlySelectedBrand
        ? [tx.brands[currentlySelectedBrand.id].unlink({glazes: glaze.id})]
        : [];

      await db.transact([
        tx.glazes[glaze.id].update(updates),
        ...unlinks,
        ...links,
      ]);
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
    <KeyboardAwareScrollView className="flex-1">
      <View className="mt-6 gap-6 px-4">
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
            Brand
          </Text>
          <Pressable
            className="flex-row flex-1 items-center justify-between border rounded-xl py-4 px-4 border-zinc-300 dark:border-zinc-700"
            onPress={() => setOpenModal('brand')}
          >
            {brand ? (
              <Text className="font-medium text-zinc-900 dark:text-zinc-100">
                {brand.name}
              </Text>
            ) : (
              <Text className="font-normal text-zinc-400 dark:text-zinc-600">
                Optional
              </Text>
            )}
            <View className="">
              <Ionicons
                name={false ? 'checkmark-circle' : 'chevron-forward'}
                color={false ? colors.zinc[700] : colors.zinc[400]}
                size={16}
              />
            </View>
          </Pressable>
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
            Description
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
      <SelectBrandModal
        isVisible={modal === 'brand'}
        current={brand}
        onClose={() => setOpenModal(null)}
        onSelect={(brand) => {
          setBrand(brand);
          setOpenModal(null);
        }}
      />
    </KeyboardAwareScrollView>
  );
}
