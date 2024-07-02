import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import {Textarea} from '@/components/Input';

export default function EditNotesModal({
  isVisible,
  current,
  onClose,
  onSave,
}: {
  isVisible: boolean;
  current?: string;
  onClose: () => void;
  onSave: (notes: string) => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [notes, setNotes] = React.useState<string>(current || '');

  React.useEffect(() => {
    setNotes(current || notes || '');
  }, [current]);

  const handleSave = () => {
    return onSave(notes.trim());
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View className="h-5/6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <View className="p-4 _bg-zinc-50 flex flex-row justify-between">
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Notes
          </Text>
          <Pressable onPress={() => onClose()}>
            <Ionicons name="close" color={colors.zinc[500]} size={24} />
          </Pressable>
        </View>
        <ScrollView className="flex-1 pt-4 pb-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-4">
          <View className="">
            <Textarea
              className="w-full h-48 bg-white dark:bg-zinc-900 px-3"
              placeholder="Enter notes..."
              value={notes}
              onChangeText={setNotes}
            />
          </View>
          <View className="mt-6 gap-2">
            <Button text="Save" variant="primary" onPress={handleSave} />
            {/* <Button text="Close" variant="secondary" onPress={onClose} /> */}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
