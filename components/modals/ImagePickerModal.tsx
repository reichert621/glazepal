import {Modal, Pressable, Text, View} from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';
import * as ImagePicker from 'expo-image-picker';

import {cn} from '@/utils';
import Button from '@/components/Button';

const DEMO_PHOTO_URI =
  'https://www.thespruce.com/thmb/ph0g5vukkoXP8Kp8cXXuNrKMb4M=/5000x0/filters:no_upscale():max_bytes(150000):strip_icc()/how-to-wash-bed-linens-2146290-hero-79ea4664bebe4b1da4ce36588eb7692f.jpg';
// 'https://www.ikea.com/us/en/images/products/strandmolke-duvet-insert-warm__1010061_pe827866_s5.jpg';
// 'https://www.americanblanketcompany.com/cdn/shop/files/woolblankets_10_2000x.jpg?v=1699478893';
// 'https://europe.sheratonstore.com/media/catalog/product/cache/25/image/9df78eab33525d08d6e5fb8d27136e95/s/h/sheraton-pillowcases-sheu-105_lrg.jpg';
// 'https://www.mayflower.com/wp-content/uploads/2023/10/MT_MovingSomeoneElse_Header-scaled.jpg';
//'https://i.kym-cdn.com/photos/images/original/001/431/201/40f.png';

export default function ImagePickerModal({
  isVisible,
  onClose,
  onSelect,
}: {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (asset: ImagePicker.ImagePickerAsset) => Promise<void> | void;
}) {
  const [isTakingPhoto, setTakingPhotoState] = React.useState(false);
  const [isSelectingPhoto, setSelectingPhotoState] = React.useState(false);

  const handleTakePhoto = async () => {
    try {
      const {status} = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        throw new Error('Access denied');
      }

      setTakingPhotoState(true);

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        const [asset] = result.assets;

        await onSelect(asset);
      }
    } catch (err) {
      console.debug('Failed to launch camera:', err);
      // FIXME: only do this in dev environment
      if (__DEV__) {
        await onSelect({uri: DEMO_PHOTO_URI, width: 3024, height: 3024});
      }
    } finally {
      setTakingPhotoState(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        throw new Error('Access denied');
      }

      setSelectingPhotoState(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        const [asset] = result.assets;

        await onSelect(asset);
      }
    } catch (err) {
      console.error('Failed to select image:', err);
    } finally {
      setSelectingPhotoState(false);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View className="h-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <View className="p-4 _bg-zinc-50 flex flex-row justify-between">
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Add a photo
          </Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" color={colors.zinc[500]} size={24} />
          </Pressable>
        </View>
        <View className="pt-4 pb-4 px-4 gap-2 border-zinc-200">
          <Button
            variant="primary"
            text="Take a photo"
            icon="camera"
            disabled={isSelectingPhoto}
            pending={isTakingPhoto}
            onPress={handleTakePhoto}
          />
          <Button
            variant="secondary"
            text="Select a photo"
            icon="image"
            disabled={isTakingPhoto}
            pending={isSelectingPhoto}
            onPress={handlePickImage}
          />
        </View>
        <View className="py-4 px-4 gap-2">
          <Button variant="destructive" text="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
