import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';
import {Link, router} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {id, tx} from '@instantdb/react-native';
import {ImagePickerAsset} from 'expo-image-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {cn, parseErrorMessage} from '@/utils';
import * as schema from '@/instant/schema';
import Input, {Textarea} from '@/components/Input';
import Button from '@/components/Button';
import {db} from '@/instant';
import ImagePickerModal from '@/components/modals/ImagePickerModal';
import {processImageAsset} from '@/utils/images';
import SelectBrandModal from '@/components/modals/SelectBrandModal';

export default function NewGlazeForm({
  onSave,
}: {
  onSave: (glaze: schema.Glaze) => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [variant, setVariant] = React.useState<'brush' | 'dip'>('brush');
  const [brand, setBrand] = React.useState<schema.Brand | null>(null);
  const [modal, setOpenModal] = React.useState<'image' | 'brand' | null>(null);
  const [isSaving, setSavingState] = React.useState(false);
  const [imageAsset, setImageAsset] = React.useState<ImagePickerAsset | null>(
    null
  );
  const imageUri = imageAsset?.uri ?? null;

  const handleSelectImage = () => setOpenModal('image');

  const handleSaveGlaze = async () => {
    try {
      if (!name || !variant) {
        throw new Error('Please fill in all required fields');
      }

      setSavingState(true);

      const glaze: schema.Glaze = {
        id: id(),
        name: name.trim(),
        description: description.trim(),
        variant: variant.trim(), // 'dip', 'brush',
        defaultImageUri: null, // set below if available
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const txns = brand ? [tx.brands[brand.id].link({glazes: glaze.id})] : [];

      if (imageAsset) {
        const {cacheUri, localUri, publicUri} =
          await processImageAsset(imageAsset);
        const uri = publicUri || localUri || cacheUri;
        const image: schema.Image = {
          id: id(),
          uri: uri,
          cacheUri,
          localUri,
          publicUri,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.transact([
          tx.images[image.id].update(image),
          tx.glazes[glaze.id]
            .update({...glaze, defaultImageUri: uri})
            .link({images: image.id}),
          ...txns,
        ]);
      } else {
        await db.transact([tx.glazes[glaze.id].update(glaze), ...txns]);
      }

      console.log(glaze);
      return onSave(glaze);
    } catch (err: any) {
      console.error('Failed to save', err);
      Alert.alert('Failed to save', err.message);
    } finally {
      setTimeout(() => setSavingState(false), 400);
    }
  };

  return (
    <KeyboardAwareScrollView className="bg-white dark:bg-zinc-950">
      <View className="mt-4 gap-6 px-4 pb-8">
        <Pressable
          className={cn(
            'h-64 w-full rounded-xl items-center justify-center',
            imageUri
              ? 'bg-zinc-900 dark:bg-zinc-950'
              : 'bg-zinc-100 border border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700'
          )}
          onPress={() => handleSelectImage()}
        >
          {imageUri ? (
            <Image className="flex-1 aspect-square" source={{uri: imageUri}} />
          ) : (
            <View className="gap-1 items-center justify-center">
              <Ionicons
                name="image"
                color={isDarkMode ? colors.zinc[700] : colors.zinc[300]}
                size={48}
              />
              <Text className="text-base font-medium text-zinc-400">
                Tap to add a photo
              </Text>
            </View>
          )}
        </Pressable>
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
      <SelectBrandModal
        isVisible={modal === 'brand'}
        current={brand}
        onClose={() => setOpenModal(null)}
        onSelect={(brand) => {
          setBrand(brand);
          setOpenModal(null);
        }}
      />
      <ImagePickerModal
        isVisible={modal === 'image'}
        onClose={() => setOpenModal(null)}
        onSelect={(asset) => {
          console.log('Selected:', asset);
          setImageAsset(asset);
          setOpenModal(null);
        }}
      />
    </KeyboardAwareScrollView>
  );
}
