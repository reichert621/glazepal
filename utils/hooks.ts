import React from 'react';
import {AppState, AppStateStatus, Platform} from 'react-native';
import {useFocusEffect} from 'expo-router';
import * as Crypto from 'expo-crypto';
import NetInfo from '@react-native-community/netinfo';
import {onlineManager} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAppState(onChange: (status: AppStateStatus) => void) {
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', onChange);

    return () => {
      subscription.remove();
    };
  }, [onChange]);
}

export function useOnlineManager() {
  React.useEffect(() => {
    // React Query already supports on reconnect auto refetch in web browser
    if (Platform.OS !== 'web') {
      return NetInfo.addEventListener((state) => {
        // console.log("NetInfo:", state);
        onlineManager.setOnline(
          state.isConnected != null &&
            state.isConnected &&
            Boolean(state.isInternetReachable)
        );
      });
    }
  }, []);
}

const DEVICE_IDENTIFIER_KEY = '__glazepal:device-identifier';

type IdState = {
  identifier: string | null;
  loading: boolean;
  error: any;
};

export function useUniqueIdentifier() {
  const [state, setState] = React.useState<IdState>({
    identifier: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    const run = async () => {
      try {
        if (__DEV__) {
          return setState((state) => ({
            ...state,
            loading: false,
            identifier: 'demo',
          }));
        }

        const id = await AsyncStorage.getItem(DEVICE_IDENTIFIER_KEY);

        if (id) {
          setState((state) => ({...state, loading: false, identifier: id}));
        } else {
          const uuid = Crypto.randomUUID();
          await AsyncStorage.setItem(DEVICE_IDENTIFIER_KEY, uuid);
          setState((state) => ({...state, loading: false, identifier: uuid}));
        }
      } catch (err) {
        setState((state) => ({...state, error: err, loading: false}));
      }
    };

    run();
  }, []);

  return [state.identifier, state.loading, state.error];
}

export function useRefreshOnFocus(refetch: () => void) {
  const enabledRef = React.useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      if (enabledRef.current) {
        console.log('[useFocusEffect] Refetching!');
        refetch();
      } else {
        enabledRef.current = true;
      }
    }, [refetch])
  );

  useAppState(
    React.useCallback(
      (state) => {
        if (state === 'active') {
          console.log('[useAppState] Refetching!');
          refetch();
        }
      },
      [refetch]
    )
  );
}
