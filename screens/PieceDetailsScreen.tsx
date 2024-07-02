import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Link, router, useLocalSearchParams, useSegments} from 'expo-router';
import colors from 'tailwindcss/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {id, tx} from '@instantdb/react-native';
import {ImagePickerAsset} from 'expo-image-picker';

import * as schema from '@/instant/schema';
import {SafeScrollView, SafeView} from '@/components/SafeView';
import {ComboResponse, db} from '@/instant';
import ImagePickerModal from '@/components/modals/ImagePickerModal';
import EditImageModal from '@/components/modals/EditImageModal';
import {cn, prioritizeMostRecent} from '@/utils';
import {processImageAsset} from '@/utils/images';
import GlazeComboPreview from '@/components/GlazeComboPreview';
import GlazePreview from '@/components/GlazePreview';
import ImageCarousel from '@/components/ImageCarousel';
import EditTagsModal from '@/components/modals/EditTagsModal';
import EditNotesModal from '@/components/modals/EditNotesModal';
import AddActionsModal, {ActionItem} from '@/components/modals/AddActionsModal';

export default function PieceDetailsScreen() {
  const [, root] = useSegments();
  const params = useLocalSearchParams();
  const glazeId = params.glaze as string;
  const comboId = params.combo as string;
  const pieceId = params.piece as string;
  const parentHref = comboId
    ? `/${root}/combos/${comboId}`
    : glazeId
      ? `/${root}/glazes/${glazeId}`
      : `/${root}`;

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const {data, isLoading, error} = db.useQuery({
    pieces: {
      // combos: {
      //   applications: {glazes: {}},
      // },
      // glazes: {},
      images: {},
      tags: {},
      parts: {
        glazes: {},
        combos: {
          applications: {glazes: {}},
        },
      },
      $: {where: {id: pieceId}},
    },
  });
  // console.log(JSON.stringify(data, null, 2));
  // console.log(params);

  const [isDeleting, setDeletingState] = React.useState(false);
  const [isScrolling, setScrollingState] = React.useState(false);
  const [modal, setOpenModal] = React.useState<
    | 'add-image'
    | 'edit-image'
    | 'move'
    | 'edit-piece'
    | 'edit-notes'
    | 'tags'
    | 'actions'
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
  } else if (isLoading || isDeleting) {
    return (
      <SafeView className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <ActivityIndicator />
      </SafeView>
    );
  } else if (!data || !data.pieces[0]) {
    return (
      <SafeView className="flex-1 justify-center items-center bg-white dark:bg-zinc-950">
        <Text className="text-lg font-medium text-red-700 dark:text-red-400">
          Not found
        </Text>
      </SafeView>
    );
  }

  const piece = data.pieces[0];
  const images = piece.images || [];
  // const combos = piece.combos || [];
  // const glazes = piece.glazes || [];
  const tags = piece.tags || [];
  const parts = piece.parts || [];
  // console.log(JSON.stringify(parts, null, 2));

  const handleGoBack = () => {
    if (router.canGoBack()) {
      return router.back();
    } else {
      return router.push(parentHref);
    }
  };

  const handleDeleteItem = async () => {
    try {
      setDeletingState(true);
      await db.transact(tx.pieces[pieceId].delete());
      console.log('Successfully deleted!', piece);
      return handleGoBack();
    } catch (err) {
      console.error('Failed to delete!', err);
    } finally {
      setTimeout(() => setDeletingState(false), 1000);
    }
  };

  const handleAddImage = async (asset: ImagePickerAsset) => {
    try {
      if (images.some((i) => i.cacheUri === uri)) {
        // Already added
        setOpenModal(null);
        return;
      }

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
        tx.pieces[pieceId].link({images: image.id}),
      ];

      if (!piece.defaultImageUri) {
        await db.transact([
          ...txns,
          tx.pieces[pieceId].update({defaultImageUri: uri}),
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
      await db.transact(
        tx.pieces[pieceId].update({defaultImageUri: image.uri})
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
      if (piece.defaultImageUri === image.uri) {
        const next = images.find((i) => i.uri !== image.uri);

        await db.transact([
          tx.images[image.id].delete(),
          tx.pieces[pieceId].update({defaultImageUri: next ? next.uri : null}),
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
        ...add.map((tag) => tx.pieces[pieceId].link({tags: tag.id})),
        ...remove.map((tag) => tx.pieces[pieceId].unlink({tags: tag.id})),
      ];
      await db.transact(txns);
      setOpenModal(null);
    } catch (err) {
      console.error('Failed to update tags!', err);
    }
  };

  const handleMenuAction = (action: ActionItem) => {
    setOpenModal(null);

    switch (action.key) {
      case 'edit-notes':
        return setOpenModal('edit-notes');
      case 'tags':
        return setOpenModal('tags');
      case 'edit':
        const href =
          root === 'pieces'
            ? `/pieces/${pieceId}/edit`
            : `/${root}/pieces/${pieceId}/edit`;

        return router.push(href);
      case 'delete':
        return Alert.alert(
          'Confirm deletion',
          `Are you sure you want to permanently delete this piece?\n\nThis action cannot be undone.`,
          [
            {
              text: 'Cancel',
              onPress: () => console.debug('Cancelled deletion'),
              style: 'cancel',
            },
            {
              text: 'Confirm',
              onPress: () => handleDeleteItem(),
              style: 'destructive',
            },
          ],
          {
            cancelable: true,
          }
        );
    }
  };

  const carousel = images
    .sort((a, b) => (a.uri === piece.defaultImageUri ? -1 : 1))
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
        className="bg-zinc-50 dark:bg-zinc-900 flex flex-row px-4 pb-3 gap-4 items-center justify-between"
      >
        <Pressable
          className="w-12 h-12 items-start justify-center"
          onPress={handleGoBack}
        >
          <Ionicons name="chevron-back" size={24} color={colors.zinc[400]} />
        </Pressable>

        <View className="flex-1 items-center justify-center">
          <Text className="text-zinc-900 text-xl font-bold">Piece details</Text>
        </View>
        <Pressable
          className="w-12 h-12 items-end justify-center"
          disabled={isDeleting}
          onPress={() => {
            Alert.alert(
              'Confirm deletion',
              `Are you sure you want to permanently delete this piece?\n\nThis action cannot be undone.`,
              [
                {
                  text: 'Cancel',
                  onPress: () => console.debug('Cancelled deletion'),
                  style: 'cancel',
                },
                {
                  text: 'Confirm',
                  onPress: () => handleDeleteItem(),
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
      <ScrollView className="border-t border-zinc-200 dark:border-zinc-700">
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
              !!piece.isFavorite && 'bg-white dark:bg-zinc-950'
            )}
            onPress={() => {
              const isFavorite = !piece.isFavorite;

              db.transact(tx.pieces[pieceId].update({isFavorite}))
                .then(console.log)
                .catch(console.error);
            }}
          >
            <Ionicons
              name={piece.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={piece.isFavorite ? colors.red[500] : colors.zinc[400]}
            />
          </Pressable>
        </View>
        <View className="border-t border-zinc-200 dark:border-zinc-800">
          <Pressable
            className="px-4 py-4"
            onPress={() => setOpenModal('edit-notes')}
          >
            {piece.notes ? (
              <Text className="text-base text-zinc-700 dark:text-zinc-300">
                {piece.notes}
              </Text>
            ) : (
              <Text className="text-base text-zinc-400 dark:text-zinc-500">
                No notes
              </Text>
            )}
          </Pressable>
          <View className="px-4 pt-4 pb-24 border-t border-zinc-200 dark:border-zinc-800">
            <Text className="text-sm mb-2 font-semibold tracking-widest uppercase text-zinc-500">
              Glazes
            </Text>
            {!isLoading && parts.length === 0 ? (
              <Text className="text-zinc-400 dark:text-zinc-500 text-base">
                No glazes found
              </Text>
            ) : (
              parts
                .sort((a, b) =>
                  a.location === 'outer' ? -1 : b.location === 'outer' ? 1 : 0
                )
                .map((part) => {
                  if (part.type === 'combo' && part.combos[0]) {
                    const data = part.combos[0] as ComboResponse;
                    const href = `/${root}/combos/${data.id}`;

                    return (
                      <Link key={data.id} href={href} asChild>
                        <Pressable className="w-full">
                          <GlazeComboPreview
                            className="border-b border-zinc-100 dark:border-zinc-900"
                            combo={data}
                          />
                        </Pressable>
                      </Link>
                    );
                  } else if (part.type === 'glaze' && part.glazes[0]) {
                    const glaze = part.glazes[0];
                    const href = `/${root}/glazes/${glaze.id}`;

                    return (
                      <Link key={glaze.id} href={href} asChild>
                        <Pressable className="w-full">
                          <GlazePreview
                            className="border-b border-zinc-100 dark:border-zinc-900"
                            glaze={glaze}
                            layers={part.layers}
                          />
                        </Pressable>
                      </Link>
                    );
                  }
                })
            )}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 right-0 p-4">
        <Pressable
          className={cn(
            'flex-row justify-center items-center gap-3 border-2 rounded-full px-3 py-3',
            'border-zinc-700 bg-zinc-800 dark:border-zinc-200 dark:bg-zinc-100'
          )}
          onPress={() => setOpenModal('actions')}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={isDarkMode ? colors.zinc[900] : colors.zinc[100]}
          />
        </Pressable>
      </View>

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
      <EditNotesModal
        isVisible={modal === 'edit-notes'}
        current={piece.notes}
        onClose={() => setOpenModal(null)}
        onSave={(notes) => {
          setOpenModal(null);

          db.transact(tx.pieces[pieceId].update({notes}))
            .then(console.log)
            .catch(console.error);
        }}
      />
      <EditTagsModal
        isVisible={modal === 'tags'}
        current={tags}
        onClose={() => setOpenModal(null)}
        onSubmit={handleUpdateTags}
      />
      <AddActionsModal
        isVisible={modal === 'actions'}
        actions={[
          {
            title: 'Add notes',
            key: 'edit-notes',
            icon: 'pencil',
          },
          {
            title: 'Update tags',
            key: 'tags',
            icon: 'pricetag',
          },
          {
            title: 'Edit piece',
            key: 'edit',
            icon: 'create',
          },
          {
            title: 'Delete piece',
            key: 'delete',
            icon: 'trash',
            variant: 'destructive',
          },
        ]}
        prefix={null}
        onAction={handleMenuAction}
        onClose={() => setOpenModal(null)}
      />
    </View>
  );
}
