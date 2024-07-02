import {Modal, Pressable, Text, View} from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';
import * as ImagePicker from 'expo-image-picker';

import {cn} from '@/utils';
import Button from '@/components/Button';

export default function EditImageModal({
  isVisible,
  onClose,
  onSetAsDefault,
  onRemove,
}: {
  isVisible: boolean;
  onClose: () => void;
  onSetAsDefault: () => void;
  onRemove: () => void;
}) {
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View className="h-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <View className="p-4 _bg-zinc-50 flex flex-row justify-between">
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Edit photo
          </Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" color={colors.zinc[500]} size={24} />
          </Pressable>
        </View>
        <View className="pt-4 pb-4 px-4 gap-2">
          <Button
            variant="primary"
            text="Set as default photo"
            onPress={onSetAsDefault}
          />
          <Button
            variant="secondary"
            text="Remove photo"
            icon="trash"
            onPress={onRemove}
          />
        </View>
        <View className="py-4 px-4 gap-2">
          <Button variant="destructive" text="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
