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
import {id, tx} from '@instantdb/react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {cn, formatGlazeApplications} from '@/utils';
import * as schema from '@/instant/schema';
import Button from '@/components/Button';
import {ComboResponse, GlazeApplicationLayer, db} from '@/instant';
import SelectGlazeModal from '@/components/modals/SelectGlazeModal';
import LayerQuantityModal from '@/components/modals/LayerQuantityModal';

export default function EditComboForm({
  glazeId,
  combo,
  onSave,
}: {
  glazeId?: string | null;
  combo: ComboResponse;
  onSave: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [defaultBaseApplication = null] = combo.applications
    .filter((a) => a.isBase && a.glazes.length > 0)
    .map((a) => {
      const {glazes, ...rest} = a;

      return {...rest, glaze: glazes[0]};
    });
  const [defaultApplicationLayer = null] = combo.applications
    .filter((a) => !a.isBase && a.glazes.length > 0)
    .map((a) => {
      const {glazes, ...rest} = a;

      return {...rest, glaze: glazes[0]};
    });
  const [base, setBaseApplication] =
    React.useState<GlazeApplicationLayer | null>(defaultBaseApplication);
  const [layer, setApplicationLayer] =
    React.useState<GlazeApplicationLayer | null>(defaultApplicationLayer);
  const [modal, setOpenModal] = React.useState<
    'image' | 'base' | 'layer' | 'base-n' | 'layer-n' | null
  >(null);
  const [isSaving, setSavingState] = React.useState(false);
  const imageUri = combo.defaultImageUri ?? null;

  const reset = () => {
    setBaseApplication(defaultBaseApplication);
    setApplicationLayer(defaultApplicationLayer);
  };

  const handleSaveCombo = async () => {
    try {
      if (!base || !layer) {
        throw new Error('Please fill in all required fields');
      }

      setSavingState(true);

      const {name, description} = formatGlazeApplications([base, layer]);
      const comboUpdates: Partial<schema.Combo> = {
        name: name.trim(),
        description: description.trim(),
        updatedAt: Date.now(),
      };
      const {glaze: baseGlaze, ...baseApplication} = base;
      const {glaze: layerGlaze, ...layerApplication} = layer;

      // console.log({baseApplication, layerApplication, baseGlaze, layerGlaze});
      // TODO: make sure we update the appropriate applications,
      // and remove any old ones if necessary

      await db.transact([
        tx.combos[combo.id].update(comboUpdates),
        tx.applications[base.id]
          .update({...baseApplication, updatedAt: Date.now()})
          .link({combos: combo.id})
          .link({glazes: baseGlaze.id}),
        tx.applications[layer.id]
          .update({...layerApplication, updatedAt: Date.now()})
          .link({combos: combo.id})
          .link({glazes: layerGlaze.id}),
      ]);

      console.log('Success!', combo);
      onSave();
    } catch (err: any) {
      console.error('Failed to save', err);
      Alert.alert('Failed to save', err.message);
    } finally {
      setTimeout(() => setSavingState(false), 400);
    }
  };

  return (
    <KeyboardAwareScrollView className="bg-white dark:bg-zinc-950">
      <View className="mt-4 gap-6 px-4">
        <View
          className={cn(
            'h-64 w-full rounded-xl items-center justify-center',
            imageUri
              ? 'bg-zinc-900 dark:bg-zinc-950'
              : 'bg-zinc-100 border border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700'
          )}
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
            </View>
          )}
        </View>
        <View className="gap-1">
          <Text className="text-base text-zinc-600 dark:text-zinc-400 font-medium">
            Base glaze
          </Text>
          <View className="w-full flex-row items-center gap-2">
            <Pressable
              className="flex-row flex-1 items-center justify-between border rounded-xl py-4 px-4 border-zinc-300 dark:border-zinc-700"
              onPress={() => setOpenModal('base')}
            >
              {base ? (
                <Text className="font-medium text-zinc-900 dark:text-zinc-100">
                  {base.glaze.name}
                </Text>
              ) : (
                <Text className="font-normal text-zinc-400 dark:text-zinc-600">
                  Set base layer
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
            <Pressable
              className={cn(
                'flex-row gap-2 items-center justify-between border rounded-xl py-4 px-4 border-zinc-300 dark:border-zinc-700',
                !base || base.glaze.variant === 'dip'
                  ? 'opacity-80'
                  : 'opacity-100'
              )}
              onPress={() => {
                if (!base || base.glaze.variant === 'dip') {
                  alert('Dipping glazes should only have 1 layer!');
                } else {
                  setOpenModal('base-n');
                }
              }}
            >
              {base ? (
                <Text className="font-medium text-zinc-900 dark:text-zinc-100">
                  {base.layers}x
                </Text>
              ) : (
                <Text className="font-normal text-zinc-400 dark:text-zinc-600">
                  1x
                </Text>
              )}
              <View className="">
                <Ionicons
                  name={'add'}
                  color={false ? colors.zinc[700] : colors.zinc[400]}
                  size={16}
                />
              </View>
            </Pressable>
          </View>
        </View>
        <View className="gap-1">
          <Text className="text-base text-zinc-600 dark:text-zinc-400 font-medium">
            Additional glaze
          </Text>
          <View className="w-full flex-row items-center gap-2">
            <Pressable
              className="flex-row flex-1 items-center justify-between border rounded-xl py-4 px-4 border-zinc-300 dark:border-zinc-700"
              onPress={() => setOpenModal('layer')}
            >
              {layer ? (
                <Text className="font-medium text-zinc-900 dark:text-zinc-100">
                  {layer.glaze.name}
                </Text>
              ) : (
                <Text className="font-normal text-zinc-400 dark:text-zinc-600">
                  Set additional layer
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
            <Pressable
              className={cn(
                'flex-row gap-2 items-center justify-between border rounded-xl py-4 px-4 border-zinc-300 dark:border-zinc-700',
                !layer || layer.glaze.variant === 'dip'
                  ? 'opacity-80'
                  : 'opacity-100'
              )}
              onPress={() => {
                if (!layer || layer.glaze.variant === 'dip') {
                  alert('Dipping glazes should only have 1 layer!');
                } else {
                  setOpenModal('layer-n');
                }
              }}
            >
              {layer ? (
                <Text className="font-medium text-zinc-900 dark:text-zinc-100">
                  {layer.layers}x
                </Text>
              ) : (
                <Text className="font-normal text-zinc-400 dark:text-zinc-600">
                  1x
                </Text>
              )}
              <View className="">
                <Ionicons
                  name={'add'}
                  color={false ? colors.zinc[700] : colors.zinc[400]}
                  size={16}
                />
              </View>
            </Pressable>
          </View>
        </View>
        <Button
          className="w-full mt-2"
          text="Update combination"
          variant="primary"
          disabled={!base || !layer || isSaving}
          pending={isSaving}
          onPress={handleSaveCombo}
        />
      </View>

      <SelectGlazeModal
        isVisible={modal === 'base' || modal === 'layer'}
        current={modal === 'layer' ? layer?.glaze : base?.glaze}
        suggestedGlazeId={glazeId}
        onClose={() => setOpenModal(null)}
        onSelect={(glaze) => {
          console.log('Selected glaze:', {glaze});
          const isDipping = glaze.variant === 'dip';

          if (modal === 'base') {
            const prev = base?.layers ?? 1;
            const layers = isDipping ? 1 : prev;

            setBaseApplication({
              id: id(),
              ...base,
              isBase: true,
              layers,
              glaze,
            });
          } else if (modal === 'layer') {
            const prev = layer?.layers ?? 1;
            const layers = isDipping ? 1 : prev;

            setApplicationLayer({
              id: id(),
              ...layer,
              isBase: false,
              layers,
              glaze,
            });
          }

          setOpenModal(null);
        }}
      />
      <LayerQuantityModal
        isVisible={modal === 'base-n' || modal === 'layer-n'}
        current={modal === 'layer-n' ? layer?.layers : base?.layers}
        onClose={() => setOpenModal(null)}
        onSubmit={(quantity) => {
          console.log('Selected quantity:', {quantity});

          if (modal === 'base-n' && base) {
            const canUpdate = base.glaze.variant === 'brush';

            setBaseApplication({...base, layers: canUpdate ? quantity : 1});
          } else if (modal === 'layer-n' && layer) {
            const canUpdate = layer.glaze.variant === 'brush';

            setApplicationLayer({...layer, layers: canUpdate ? quantity : 1});
          }

          setOpenModal(null);
        }}
      />
    </KeyboardAwareScrollView>
  );
}
