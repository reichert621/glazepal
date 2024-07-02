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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {id, tx} from '@instantdb/react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {cn, formatGlazeCombo} from '@/utils';
import Button from '@/components/Button';
import {
  ComboResponse,
  GlazePart,
  PiecePartResponse,
  PieceResponse,
  db,
} from '@/instant';
import SelectGlazeComboModal from '@/components/modals/SelectGlazeComboModal';
import LayerQuantityModal from '@/components/modals/LayerQuantityModal';

function formatGlazePart(part: GlazePart) {
  if (part.type === 'glaze' && part.glaze) {
    return part.glaze.name;
  } else if (part.type === 'combo' && part.combo) {
    const {name} = formatGlazeCombo(part.combo as ComboResponse);

    return name || part.combo.name;
  } else {
    return null;
  }
}

function findGlazePartByLocation(
  location: 'inner' | 'outer',
  parts: PiecePartResponse[]
) {
  const part = parts.find((part) => {
    const isGlazePart = part.type === 'glaze' && part.glazes.length > 0;
    const isComboPart = part.type === 'combo' && part.combos.length > 0;

    return part.location === location && (isGlazePart || isComboPart);
  });

  if (!part) {
    return null;
  }

  if (part.type === 'glaze') {
    return {
      type: 'glaze',
      location: location,
      layers: 1,
      glaze: part.glazes[0],
    } as GlazePart;
  } else {
    return {
      type: 'combo',
      location: location,
      combo: part.combos[0],
    } as GlazePart;
  }
}

function isSamePart(a: GlazePart | null, b: GlazePart | null) {
  if (!a && !b) {
    return true;
  } else if (!a || !b) {
    return false;
  }

  if (a.type === 'glaze' && b.type === 'glaze') {
    return a.glaze.id === b.glaze.id;
  } else if (a.type === 'combo' && b.type === 'combo') {
    return a.combo.id === b.combo.id;
  }

  return false;
}

export default function EditPieceForm({
  piece,
  onSave,
}: {
  piece: PieceResponse;
  onSave: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const defaultOuterPart = findGlazePartByLocation('outer', piece.parts);
  const defaultInnerPart = findGlazePartByLocation('inner', piece.parts);
  const isUniformByDefault = isSamePart(defaultOuterPart, defaultInnerPart);

  const [outer, setOuterPart] = React.useState<GlazePart | null>(
    defaultOuterPart
  );
  const [inner, setInnerPart] = React.useState<GlazePart | null>(
    defaultInnerPart
  );
  const [modal, setOpenModal] = React.useState<
    'image' | 'variant' | 'outer' | 'inner' | 'outer-n' | 'inner-n' | null
  >(null);
  const [isSaving, setSavingState] = React.useState(false);
  const [isUniform, setUniformState] = React.useState(isUniformByDefault);

  const imageUri = piece.defaultImageUri ?? null;
  const currentModalLayersQuantity =
    modal === 'inner-n'
      ? !!inner && inner.type === 'glaze'
        ? inner.layers
        : 1
      : !!outer && outer.type === 'glaze'
        ? outer.layers
        : 1;

  // React.useEffect(() => {
  //   if (piece) {
  //     piece.parts.forEach((p) => {
  //       const {combos = [], glazes = []} = p;

  //       if (!combos.length && !glazes.length) {
  //         db.transact(tx.parts[p.id].delete())
  //           .then(console.log)
  //           .catch(console.error);
  //       }
  //     });
  //   }
  // }, [piece]);

  const handleSavePiece = async () => {
    try {
      if (!outer) {
        throw new Error('Please fill in all required fields');
      }

      setSavingState(true);

      const removals = piece.parts.flatMap((part) => {
        if (part.type === 'glaze') {
          return [
            tx.parts[part.id].delete(),
            ...part.glazes.map((g) =>
              tx.glazes[g.id].unlink({pieces: piece.id})
            ),
          ];
        } else {
          return [
            tx.parts[part.id].delete(),
            ...part.combos.map((c) =>
              tx.combos[c.id].unlink({pieces: piece.id})
            ),
          ];
        }
      });

      const updates = [outer, isUniform ? null : inner]
        .filter((p): p is GlazePart => !!p)
        .flatMap((part) => {
          if (part.type === 'glaze') {
            const record = {
              id: id(),
              type: 'glaze',
              location: part.location,
              layers: part.layers || 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            return [
              tx.parts[record.id].update(record).link({glazes: part.glaze.id}),
              tx.pieces[piece.id].link({parts: record.id}),
              tx.glazes[part.glaze.id].link({pieces: piece.id}),
            ];
          } else {
            const record = {
              id: id(),
              type: 'combo',
              location: part.location,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            return [
              tx.parts[record.id].update(record).link({combos: part.combo.id}),
              tx.pieces[piece.id].link({parts: record.id}),
              tx.combos[part.combo.id].link({pieces: piece.id}),
            ];
          }
        });

      await db.transact([
        tx.pieces[piece.id].update({updatedAt: Date.now()}),
        ...removals,
        ...updates,
      ]);

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
              ? 'bg-zinc-900 _dark:bg-zinc-950'
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
            Outer glaze
          </Text>
          <View className="w-full flex-row items-center gap-2">
            <Pressable
              className="flex-row flex-1 items-center justify-between border rounded-xl py-4 px-4 border-zinc-300 dark:border-zinc-700"
              onPress={() => setOpenModal('outer')}
            >
              {outer ? (
                <Text className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatGlazePart(outer)}
                </Text>
              ) : (
                <Text className="font-normal text-zinc-400 dark:text-zinc-600">
                  Set outer glaze
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
            {!!outer && outer.type === 'glaze' && (
              <Pressable
                className={cn(
                  'flex-row gap-2 items-center justify-between border rounded-xl py-4 px-4 border-zinc-300 dark:border-zinc-700',
                  !outer || outer.glaze.variant === 'dip'
                    ? 'opacity-80'
                    : 'opacity-100'
                )}
                onPress={() => {
                  if (outer.glaze.variant === 'dip') {
                    alert('Dipping glazes should only have 1 layer!');
                  } else {
                    setOpenModal('outer-n');
                  }
                }}
              >
                {outer.layers ? (
                  <Text className="font-medium text-zinc-900 dark:text-zinc-100">
                    {outer.layers}x
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
            )}
          </View>
        </View>
        <Pressable
          className="flex flex-row items-center gap-3"
          onPress={() => setUniformState((current) => !current)}
        >
          <View
            className={cn(
              'border-2 h-8 w-8 items-center justify-center rounded-lg',
              isUniform
                ? 'border-zinc-700 bg-zinc-900 dark:border-zinc-200 dark:bg-zinc-100'
                : 'border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800'
            )}
          >
            {isUniform && (
              <Ionicons
                name="checkmark"
                size={20}
                color={isDarkMode ? colors.zinc[900] : colors.zinc[100]}
              />
            )}
          </View>
          <Text
            className={cn(
              'text-lg font-medium',
              isUniform
                ? 'text-zinc-700 dark:text-zinc-300'
                : 'text-zinc-400 dark:text-zinc-500'
            )}
          >
            Inner glaze matches outer glaze
          </Text>
        </Pressable>
        {!isUniform && (
          <View className="gap-1">
            <Text className="text-base text-zinc-600 dark:text-zinc-400 font-medium">
              Inner glaze
            </Text>
            <View className="w-full flex-row items-center gap-2">
              <Pressable
                className="flex-row flex-1 items-center justify-between border rounded-xl py-4 px-4 border-zinc-300 dark:border-zinc-700"
                onPress={() => setOpenModal('inner')}
              >
                {inner ? (
                  <Text className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatGlazePart(inner)}
                  </Text>
                ) : (
                  <Text className="font-normal text-zinc-400 dark:text-zinc-600">
                    Set inner glaze
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
              {!!inner && inner.type === 'glaze' && (
                <Pressable
                  className={cn(
                    'flex-row gap-2 items-center justify-between border rounded-xl py-4 px-4 border-zinc-300 dark:border-zinc-700',
                    !inner || inner.glaze.variant === 'dip'
                      ? 'opacity-80'
                      : 'opacity-100'
                  )}
                  onPress={() => {
                    if (inner.glaze.variant === 'dip') {
                      alert('Dipping glazes should only have 1 layer!');
                    } else {
                      setOpenModal('inner-n');
                    }
                  }}
                >
                  {inner.layers ? (
                    <Text className="font-medium text-zinc-900 dark:text-zinc-100">
                      {inner.layers}x
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
              )}
            </View>
          </View>
        )}
        <Button
          className="w-full mt-2"
          text="Save"
          variant="primary"
          disabled={!imageUri || isSaving}
          pending={isSaving}
          onPress={handleSavePiece}
        />
      </View>

      <LayerQuantityModal
        isVisible={modal === 'outer-n' || modal === 'inner-n'}
        current={currentModalLayersQuantity}
        onClose={() => setOpenModal(null)}
        onSubmit={(quantity) => {
          console.log('Selected quantity:', {quantity});

          if (modal === 'outer-n' && outer) {
            const canUpdate =
              outer.type === 'glaze' && outer.glaze.variant === 'brush';

            if (canUpdate) {
              setOuterPart({...outer, layers: quantity || 1});
            }
          } else if (modal === 'inner-n' && inner) {
            const canUpdate =
              inner.type === 'glaze' && inner.glaze.variant === 'brush';

            if (canUpdate) {
              setInnerPart({...inner, layers: quantity || 1});
            }
          }

          setOpenModal(null);
        }}
      />
      <SelectGlazeComboModal
        isVisible={modal === 'outer' || modal === 'inner'}
        location={modal === 'inner' ? 'inner' : 'outer'}
        current={modal === 'inner' ? inner : outer}
        onClose={() => setOpenModal(null)}
        onSelect={(part) => {
          console.log('Selected:', part);
          if (modal === 'inner') {
            setInnerPart(part);
          } else {
            setOuterPart(part);
          }

          setOpenModal(null);
        }}
      />
    </KeyboardAwareScrollView>
  );
}
