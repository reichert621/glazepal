import {Modal, Pressable, Text, View, useColorScheme} from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

import {cn} from '@/utils';
import Button from '@/components/Button';

function v0({
  isVisible,
  onClose,
  onAction,
}: {
  isVisible: boolean;
  onClose: () => void;
  onAction: () => void;
}) {
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View className="h-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl w-full absolute rounded-t-xl bottom-0">
        <View className="p-4 _bg-zinc-50 flex flex-row justify-between">
          <Text className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
            Actions
          </Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" color={colors.zinc[500]} size={24} />
          </Pressable>
        </View>
        <View className="pt-4 pb-4 px-4 gap-2 border-zinc-200">
          <Button variant="primary" text="Add glaze" icon="brush" />
          <Button variant="primary" text="Add combo" icon="flask" />
          <Button variant="primary" text="Add piece" icon="cafe" />
        </View>
      </View>
    </Modal>
  );
}

export type ActionItem = {
  title: string;
  key: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  variant?: 'primary' | 'secondary' | 'destructive';
};

export default function AddActionsModal({
  isVisible,
  actions,
  prefix = <Ionicons name="add" size={18} color={colors.zinc[300]} />,
  onClose,
  onAction,
}: {
  isVisible: boolean;
  actions: ActionItem[];
  prefix?: React.ReactNode;
  onClose: () => void;
  onAction: (action: ActionItem) => void;
}) {
  const colorScheme = useColorScheme();
  const offset = useBottomTabBarHeight();
  const isDark = colorScheme === 'dark';

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <View className="relative h-full flex-1">
        <Pressable
          className="absolute h-full w-full inset-0 bg-zinc-900 opacity-60"
          onLongPress={onClose}
        ></Pressable>
        <View
          style={{bottom: offset}}
          className="absolute items-end right-0 px-4 pt-4 pb-24 gap-3"
        >
          {actions.map((action) => {
            return (
              <Pressable
                key={action.key}
                className="flex flex-row gap-2"
                onPress={() => onAction(action)}
              >
                <View
                  className={cn(
                    'flex flex-row gap-1 items-center rounded-full px-4 py-3',
                    action.variant === 'destructive'
                      ? 'bg-red-900'
                      : 'bg-zinc-900 dark:bg-zinc-700'
                  )}
                >
                  {prefix}
                  <Text
                    className={cn(
                      'font-medium text-base',
                      action.variant === 'destructive'
                        ? 'text-red-100'
                        : 'text-zinc-300'
                    )}
                  >
                    {action.title}
                  </Text>
                </View>
                {!!action.icon && (
                  <View
                    className={cn(
                      'justify-center items-center rounded-full h-12 w-12 px-3 py-3',
                      action.variant === 'destructive'
                        ? 'bg-red-900'
                        : 'bg-zinc-900 dark:bg-zinc-700'
                    )}
                  >
                    <Ionicons
                      name={action.icon}
                      size={18}
                      color={
                        action.variant === 'destructive'
                          ? colors.red[100]
                          : colors.zinc[300]
                      }
                    />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
        <View style={{bottom: offset}} className="absolute right-0 p-4">
          <Pressable
            className={cn(
              'flex-row justify-center items-center gap-3 border-2 rounded-full px-3 py-3',
              'border-zinc-700 bg-zinc-800 dark:border-zinc-200 dark:bg-zinc-100'
            )}
            onPress={onClose}
          >
            <Ionicons
              name="close"
              size={24}
              color={isDark ? colors.zinc[900] : colors.zinc[100]}
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
