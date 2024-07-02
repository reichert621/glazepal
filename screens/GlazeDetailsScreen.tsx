import React from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Alert,
  useColorScheme,
  FlatList,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Link, router, useLocalSearchParams, useSegments} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import colors from 'tailwindcss/colors';
import {id, tx} from '@instantdb/react-native';
import {ImagePickerAsset} from 'expo-image-picker';

import * as schema from '@/instant/schema';
import {SafeScrollView, SafeView} from '@/components/SafeView';
import {ComboResponse, db} from '@/instant';
import {cn, formatGlazeVariant, prioritizeMostRecent} from '@/utils';
import ImagePickerModal from '@/components/modals/ImagePickerModal';
import EditImageModal from '@/components/modals/EditImageModal';
import EditGlazeModal from '@/components/modals/EditGlazeModal';
import ImageViewer from '@/components/ImageViewer';
import {processImageAsset} from '@/utils/images';
import GlazeComboPreview from '@/components/GlazeComboPreview';
import AddActionsModal, {ActionItem} from '@/components/modals/AddActionsModal';
import ImageCarousel from '@/components/ImageCarousel';
import EditTagsModal from '@/components/modals/EditTagsModal';
import EditNotesModal from '@/components/modals/EditNotesModal';

export default function GlazeDetailsScreen() {
  const [, root] = useSegments();
  const params = useLocalSearchParams();
  const glazeId = params.glaze as string;
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {data, isLoading, error} = db.useQuery({
    glazes: {
      brands: {},
      pieces: {},
      images: {},
      tags: {},
      $: {where: {id: glazeId}},
    },
    combos: {
      applications: {glazes: {}},
      $: {where: {'applications.glazes.id': glazeId}},
    },
  });
  // console.log('GlazeDetailsScreen', JSON.stringify(data, null, 2));
  // console.log({glazeId});

  const [isDeleting, setDeletingState] = React.useState(false);
  const [isScrolling, setScrollingState] = React.useState(false);
  const [modal, setOpenModal] = React.useState<
    | 'add-image'
    | 'edit-image'
    | 'edit-notes'
    | 'edit'
    | 'actions'
    | 'tags'
    | null
  >(null);
  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(
    null
  );

  if (error) {
    return (
      <SafeView className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <Text className="text-lg font-medium text-red-700 dark:text-red-400">
          Failed to retrieve data
        </Text>
        <Text className="text-lg text-red-700 dark:text-red-400">
          {error.message}
        </Text>
      </SafeView>
    );
  } else if (isLoading || isDeleting || !data || !data.glazes[0]) {
    return (
      <SafeView className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <ActivityIndicator />
      </SafeView>
    );
  }

  const handleAddAction = (action: ActionItem) => {
    switch (action.key) {
      case 'glaze':
        return router.push(`/${root}/glazes/new?glaze=${glazeId}`);
      case 'combo':
        return router.push(`/${root}/combos/new?glaze=${glazeId}`);
      case 'piece':
        return router.push(`/${root}/pieces/new?glaze=${glazeId}`);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // TODO: if comboId or pieceId exists, navigate to that
      return router.push(`/${root}`);
    }
  };

  const handleDeleteGlaze = async () => {
    try {
      setDeletingState(true);
      await db.transact(tx.glazes[glazeId].delete());
      console.log('Successfully deleted!', glaze);
      return handleGoBack();
    } catch (err) {
      console.error('Failed to delete!', err);
    } finally {
      setDeletingState(false);
    }
  };

  const handleAddImage = async (asset: ImagePickerAsset) => {
    try {
      if (images.some((i) => i.cacheUri === asset.uri)) {
        // Already added
        setOpenModal(null);
        return;
      }

      // TODO: maybe process public URI separately to speed things up?
      const {cacheUri, localUri, publicUri} = await processImageAsset(asset);
      const uri = publicUri || localUri || cacheUri;
      const image: schema.Image = {
        id: id(),
        uri,
        cacheUri,
        localUri,
        publicUri,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const txns = [
        tx.images[image.id].update(image),
        tx.glazes[glazeId].link({images: image.id}),
      ];

      if (!glaze.defaultImageUri) {
        await db.transact([
          ...txns,
          tx.glazes[glazeId].update({defaultImageUri: uri}),
        ]);
      } else {
        await db.transact(txns);
      }

      setOpenModal(null);
    } catch (err) {
      console.error('Failed to update!', err);
    } finally {
      //
    }
  };

  const handleSetAsDefault = async (image: schema.Image) => {
    try {
      console.log(glaze.defaultImageUri, image.uri);
      await db.transact(
        tx.glazes[glazeId].update({defaultImageUri: image.uri})
      );

      setOpenModal(null);
    } catch (err) {
      console.error('Failed to update!', err);
    } finally {
      //
    }
  };

  const handleRemoveImage = async (image: schema.Image) => {
    try {
      console.log(glaze.defaultImageUri, image.uri);
      if (glaze.defaultImageUri === image.uri) {
        const next = images.find((i) => i.uri !== image.uri);

        await db.transact([
          tx.images[image.id].delete(),
          tx.glazes[glazeId].update({defaultImageUri: next ? next.uri : null}),
        ]);
      } else {
        await db.transact([tx.images[image.id].delete()]);
      }

      setOpenModal(null);
    } catch (err) {
      console.error('Failed to update!', err);
    } finally {
      //
    }
  };

  const handleImagePressed = (data: {id: string; uri: string}) => {
    if (isScrolling) {
      return;
    }

    console.log('Pressed!', data);

    if (data.uri === '') {
      setOpenModal('add-image');
    } else {
      setSelectedImageId(data.id);
      setOpenModal('edit-image');
    }
  };

  const handleUpdateTags = async ({
    add,
    remove,
  }: {
    add: schema.Tag[];
    remove: schema.Tag[];
  }) => {
    try {
      // console.log('Updating tags!', {add, remove});
      const txns = [
        ...add.map((tag) => tx.glazes[glazeId].link({tags: tag.id})),
        ...remove.map((tag) => tx.glazes[glazeId].unlink({tags: tag.id})),
      ];
      await db.transact(txns);
      setOpenModal(null);
    } catch (err) {
      console.error('Failed to update tags!', err);
    }
  };

  const glaze = data.glazes[0];
  const pieces = glaze.pieces || [];
  const combos = data.combos || [];
  const images = glaze.images || [];
  const tags = glaze.tags || [];
  const brand = glaze.brands[0];
  const carousel = images
    .sort((a, b) => (a.uri === glaze.defaultImageUri ? -1 : 1))
    .concat({id: '', uri: ''});

  return (
    <View
      style={{
        // paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      className="flex-1 relative bg-white dark:bg-zinc-950"
    >
      <View
        style={{paddingTop: insets.top}}
        className="bg-zinc-50 dark:bg-zinc-900 flex flex-row px-4 pb-2 gap-4 items-center justify-between"
      >
        <Pressable
          className="w-12 h-12 items-start justify-center"
          onPress={handleGoBack}
        >
          <Ionicons name="chevron-back" size={24} color={colors.zinc[400]} />
        </Pressable>
        <View className="flex-1 items-center justify-center">
          <Pressable
            className="items-center justify-center"
            onPress={() => setOpenModal('edit')}
          >
            <Text className="text-zinc-900 text-xl font-bold">
              {glaze.name}
            </Text>
          </Pressable>
        </View>
        <Pressable
          className="w-12 h-12 items-end justify-center"
          disabled={isDeleting}
          onPress={() => {
            Alert.alert(
              'Confirm deletion',
              `Are you sure you want to permanently delete "${glaze.name}"?\n\nThis action cannot be undone.`,
              [
                {
                  text: 'Cancel',
                  onPress: () => console.debug('Cancelled deletion'),
                  style: 'cancel',
                },
                {
                  text: 'Confirm',
                  onPress: () => handleDeleteGlaze(),
                  style: 'destructive',
                },
              ],
              {
                cancelable: true,
              }
            );
          }}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.red[400]} />
          ) : (
            <Ionicons name="trash-outline" size={24} color={colors.red[400]} />
          )}
        </Pressable>
      </View>
      <ScrollView className="flex-1">
        <Pressable
          className="px-4 pt-4 pb-3"
          onPress={() => setOpenModal('edit')}
        >
          <View className="flex flex-row justify-between items-center">
            <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {glaze.name}
            </Text>
            <Text className="text-lg font-normal text-blue-600 dark:text-blue-400">
              Edit
            </Text>
          </View>
          <Text className="text-lg font-regular text-zinc-600 dark:text-zinc-400">
            {formatGlazeVariant(glaze.variant)} glaze{' '}
            {brand ? `by ${brand.name}` : ''}
          </Text>
        </Pressable>
        <ImageCarousel
          className=""
          images={carousel}
          onScrollStart={() => setScrollingState(true)}
          onScrollEnd={() => setScrollingState(false)}
          onPressImage={(image) => handleImagePressed(image)}
        />
        <View className="bg-zinc-50 dark:bg-zinc-950 flex flex-row">
          {tags.length > 0 ? (
            <FlatList
              contentContainerClassName="gap-1 px-4 py-3"
              data={tags}
              horizontal
              renderItem={(data) => {
                return (
                  <Pressable
                    className="flex flex-row items-center gap-1 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 rounded-full px-3 py-1"
                    onPress={() => setOpenModal('tags')}
                  >
                    <Text className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                      {data.item.name}
                    </Text>
                  </Pressable>
                );
              }}
            />
          ) : (
            <View className="flex flex-row flex-1">
              <Pressable
                className="px-4 py-3"
                onPress={() => setOpenModal('tags')}
              >
                <View className="flex flex-row items-center gap-1 border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 rounded-full px-3 py-1">
                  <Ionicons name="add" size={16} color={colors.zinc[500]} />
                  <Text className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Add tags
                  </Text>
                </View>
              </Pressable>
            </View>
          )}
          <Pressable
            className={cn(
              'border-l border-zinc-200 dark:border-zinc-800 items-center justify-center px-4 py-3',
              !!glaze.isFavorite && 'bg-white dark:bg-zinc-950'
            )}
            onPress={() => {
              const isFavorite = !glaze.isFavorite;

              db.transact(tx.glazes[glazeId].update({isFavorite}))
                .then(console.log)
                .catch(console.error);
            }}
          >
            <Ionicons
              name={glaze.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={glaze.isFavorite ? colors.red[500] : colors.zinc[400]}
            />
          </Pressable>
        </View>
        <Pressable
          className="px-4 py-4 border-t border-zinc-200 dark:border-zinc-800"
          onPress={() => setOpenModal('edit-notes')}
        >
          {glaze.notes || glaze.description ? (
            <Text className="text-base text-zinc-700 dark:text-zinc-300">
              {glaze.notes || glaze.description}
            </Text>
          ) : (
            <Text className="text-base text-zinc-400 dark:text-zinc-500">
              No notes
            </Text>
          )}
        </Pressable>
        <View className="px-4 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <Text className="text-sm mb-2 font-semibold tracking-widest uppercase text-zinc-500">
            Combinations
          </Text>
          {combos.length === 0 ? (
            <Text className="text-zinc-400 dark:text-zinc-500 text-base">
              No combos have been added yet
            </Text>
          ) : (
            combos.sort(prioritizeMostRecent).map((combo) => (
              <Link
                key={combo.id}
                href={`/${root}/combos/${combo.id}?glaze=${glazeId}`}
                asChild
              >
                <Pressable className="w-full">
                  <GlazeComboPreview
                    className="border-b border-zinc-100 dark:border-zinc-900"
                    combo={combo as ComboResponse}
                  />
                </Pressable>
              </Link>
            ))
          )}
        </View>
        {pieces.length > 0 ? (
          <View className="mt-4 px-4 pb-24">
            <Text className="text-sm mb-2 font-semibold tracking-widest uppercase text-zinc-500">
              Pieces
            </Text>
            <View className="flex flex-row flex-wrap">
              {pieces.sort(prioritizeMostRecent).map((piece) => (
                <Link
                  key={piece.id}
                  href={
                    root === 'pieces'
                      ? `/pieces/${piece.id}`
                      : `/${root}/pieces/${piece.id}`
                  }
                  asChild
                >
                  <Pressable className="w-1/3 p-px">
                    <View className="">
                      {piece.defaultImageUri ? (
                        <ImageViewer
                          className="aspect-square rounded"
                          image={piece.defaultImageUri}
                        />
                      ) : (
                        <View className="aspect-square justify-center items-center rounded-lg bg-zinc-800 dark:bg-zinc-200">
                          <Ionicons
                            name="image"
                            color={colors.zinc[600]}
                            size={20}
                          />
                        </View>
                      )}
                    </View>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        ) : (
          <View className="pb-24" />
        )}
      </ScrollView>
      <EditGlazeModal
        glaze={glaze}
        isVisible={modal === 'edit'}
        onClose={() => setOpenModal(null)}
        onSave={async (glaze) => {
          console.log('Saved!', glaze);

          setOpenModal(null);
        }}
      />
      <ImagePickerModal
        isVisible={modal === 'add-image'}
        onClose={() => setOpenModal(null)}
        onSelect={(asset) => {
          console.log('Selected:', asset);
          handleAddImage(asset);
        }}
      />
      <EditImageModal
        isVisible={modal === 'edit-image'}
        onClose={() => setOpenModal(null)}
        onSetAsDefault={() => {
          const image = images.find((i) => i.id === selectedImageId);

          handleSetAsDefault(image!);
        }}
        onRemove={() => {
          const image = images.find((i) => i.id === selectedImageId);

          handleRemoveImage(image!);
        }}
      />
      <EditTagsModal
        isVisible={modal === 'tags'}
        current={tags}
        onClose={() => setOpenModal(null)}
        onSubmit={handleUpdateTags}
      />
      <EditNotesModal
        isVisible={modal === 'edit-notes'}
        current={glaze.notes || glaze.description}
        onClose={() => setOpenModal(null)}
        onSave={(notes) => {
          setOpenModal(null);

          db.transact(tx.glazes[glazeId].update({notes}))
            .then(console.log)
            .catch(console.error);
        }}
      />
      <View className="absolute bottom-0 right-0 p-4">
        <Pressable
          className={cn(
            'flex-row justify-center items-center gap-3 border-2 rounded-full px-3 py-3',
            'border-zinc-700 bg-zinc-800 dark:border-zinc-200 dark:bg-zinc-100'
          )}
          onPress={() => setOpenModal('actions')}
        >
          <Ionicons
            name="add"
            size={24}
            color={isDark ? colors.zinc[900] : colors.zinc[100]}
          />
        </Pressable>
      </View>
      <AddActionsModal
        isVisible={modal === 'actions'}
        actions={[
          {
            title: 'Add glaze',
            key: 'glaze',
            icon: 'brush',
          },
          {title: 'Add combo', key: 'combo', icon: 'flask'},
          {title: 'Add piece', key: 'piece', icon: 'cafe'},
        ]}
        onAction={(action) => {
          handleAddAction(action);
          setOpenModal(null);
        }}
        onClose={() => setOpenModal(null)}
      />
    </View>
  );
}
