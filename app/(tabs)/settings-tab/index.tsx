import {Alert, Pressable, Text, View} from 'react-native';
import React from 'react';
import {Link} from 'expo-router';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as Updates from 'expo-updates';
import dayjs from 'dayjs';

import {cn, parseErrorMessage} from '@/utils';
import {SafeScrollView, SafeView} from '@/components/SafeView';
import {useUniqueIdentifier} from '@/utils/hooks';
import Button from '@/components/Button';

function formattedDeviceId(deviceId: string) {
  if (deviceId.length < 8) {
    return deviceId;
  }

  return deviceId.slice(0, 4) + '...' + deviceId.slice(-4);
}

function Profile({className, deviceId}: {className: string; deviceId: string}) {
  const {
    currentlyRunning,
    availableUpdate,
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    lastCheckForUpdateTimeSinceRestart,
  } = Updates.useUpdates();

  const canCheckForUpdate =
    lastCheckForUpdateTimeSinceRestart &&
    dayjs().diff(lastCheckForUpdateTimeSinceRestart, 'minutes') > 30;

  return (
    <View className={className}>
      <View className="">
        <View className="px-3 mb-2">
          <Text className="text-sm uppercase text-zinc-500 tracking-widest">
            General
          </Text>
        </View>
        <View className="bg-white pl-4 dark:bg-zinc-900 rounded-md shadow-sm dark:shadow-zinc-800">
          <View className="pr-4 h-14 _border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
              Account
            </Text>
            <Pressable
              onPress={() => Alert.alert('Your device ID:', deviceId)}
              // onPress={() => {
              //   console.log(FileSystem.documentDirectory);
              //   Alert.alert(
              //     'Your device ID:',
              //     FileSystem.documentDirectory || 'missing'
              //   );
              // }}
            >
              <Text className="text-zinc-500 dark:text-zinc-400 text-lg">
                {formattedDeviceId(deviceId)}
              </Text>
            </Pressable>
          </View>
          {__DEV__ && (
            <View className="pr-4 h-14 border-t border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
              <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
                Database
              </Text>
              <Pressable
                onPress={() => {
                  console.log(FileSystem.documentDirectory);
                  Alert.alert(
                    'Your db path:',
                    FileSystem.documentDirectory || 'missing'
                  );
                }}
              >
                <Text className="text-zinc-500 dark:text-zinc-400 text-lg">
                  Inspect
                </Text>
              </Pressable>
            </View>
          )}
        </View>
        <View className="px-3 mb-2 mt-6">
          <Text className="text-sm uppercase text-zinc-500 tracking-widest">
            App
          </Text>
        </View>
        <View className="bg-white pl-4 dark:bg-zinc-900 rounded-md shadow-sm dark:shadow-zinc-800">
          <View className="pr-4 h-14 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
              Report a bug
            </Text>
            <Text className="text-blue-500 dark:text-blue-400 text-lg">
              Contact us
            </Text>
          </View>
          <View className="pr-4 h-14 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
              Rate the app
            </Text>
            <Text className="text-zinc-500 dark:text-zinc-400 text-lg">
              App Store
            </Text>
          </View>
          <View className="pr-4 h-14 flex flex-row items-center justify-between">
            <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
              Version
            </Text>
            <Text className="text-zinc-500 dark:text-zinc-400 text-lg">
              {Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>
        </View>
        <View className="px-3 mb-2 mt-6">
          <Text className="text-sm uppercase text-zinc-500 tracking-widest">
            Updates
          </Text>
        </View>
        <View className="bg-white pl-4 dark:bg-zinc-900 rounded-md shadow-sm dark:shadow-zinc-800">
          <View className="pr-4 h-14 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
              Update available
            </Text>
            {isUpdateAvailable ? (
              <Button
                className="py-1 px-3 -mx-2"
                text={isDownloading ? 'Downloading...' : 'Download update'}
                variant="primary"
                disabled={isChecking || isDownloading}
                onPress={() =>
                  Updates.fetchUpdateAsync().catch((err) =>
                    console.error('Failed to fetch update:', err)
                  )
                }
              />
            ) : canCheckForUpdate ? (
              <Button
                className="py-1 px-3 -mx-2"
                text={isChecking ? 'Checking...' : 'Check for update'}
                variant="primary"
                disabled={isChecking || isDownloading}
                onPress={() =>
                  Updates.checkForUpdateAsync().catch((err) =>
                    console.error('Failed to check for update:', err)
                  )
                }
              />
            ) : (
              <Text className="text-zinc-500 dark:text-zinc-400 text-lg">
                None
              </Text>
            )}
          </View>
          {__DEV__ && (
            <View className="pr-4 h-14 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
              <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
                Created at
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-lg">
                {currentlyRunning.createdAt
                  ? dayjs(currentlyRunning.createdAt).format('MMM D, h:mma')
                  : 'N/A'}
              </Text>
            </View>
          )}
          {__DEV__ && (
            <View className="pr-4 h-14 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
              <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
                Last checked at
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-lg">
                {lastCheckForUpdateTimeSinceRestart
                  ? dayjs(lastCheckForUpdateTimeSinceRestart).format(
                      'MMM D, h:mma'
                    )
                  : 'N/A'}
              </Text>
            </View>
          )}
          <View className="pr-4 h-14 _border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
            <Text className="text-zinc-900 dark:text-zinc-100 text-lg">
              Last updated
            </Text>
            <Text className="text-zinc-500 dark:text-zinc-400 text-lg">
              {Updates.createdAt
                ? dayjs(Updates.createdAt).format('MMM D, h:mma')
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const [deviceId] = useUniqueIdentifier();

  return (
    <SafeView className="bg-zinc-50 dark:bg-zinc-950">
      <View className="mt-12 mb-8 px-4">
        <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-4xl">
          Settings
        </Text>
      </View>

      {!!deviceId && (
        <Profile
          className="px-4 gap-4 flex-col flex-1 justify-between"
          deviceId={deviceId}
        />
      )}
    </SafeView>
  );
}
