import {Alert, Pressable, Text, TextInput, View} from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {router, Link} from 'expo-router';
import colors from 'tailwindcss/colors';

import {cn} from '@/utils';
import {SafeView} from '@/components/SafeView';
import {useUniqueIdentifier} from '@/utils/hooks';
import Button from '@/components/Button';
import Input from '@/components/Input';

function LoginForm() {
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [isSubmitting, setSubmittingState] = React.useState(false);

  return (
    <View className="gap-2 justify-center items-center px-4">
      <Input
        className="w-full"
        placeholder="Email"
        autoCapitalize="none"
        icon="mail"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        className="w-full"
        secureTextEntry={true}
        placeholder="Password"
        icon="lock-closed"
        value={password}
        onChangeText={setPassword}
      />
      <Button
        className={cn('w-full', isSubmitting ? 'opacity-60' : 'opacity-100')}
        variant="primary"
        text={isSubmitting ? 'Logging in...' : 'Log in'}
        disabled={isSubmitting}
      />
    </View>
  );
}

export default function LoginScreen() {
  const [deviceId] = useUniqueIdentifier();
  // TODO: if already logged in, either redirect to /settings-tab/
  // or display something like "Logged in as {user.email}"

  return (
    <SafeView className="bg-white dark:bg-zinc-950">
      <View className="px-4 py-4 flex flex-row items-center gap-2">
        <Pressable
          className="bg-zinc-50 rounded-full p-2"
          onPress={() =>
            router.canGoBack() ? router.back() : router.push('/settings-tab/')
          }
        >
          <Ionicons name="arrow-back" size={20} color={colors.zinc[900]} />
        </Pressable>
      </View>
      <View className="mt-4 mb-6 px-4">
        <Text className="font-bold text-zinc-900 dark:text-zinc-100 text-4xl">
          Sign in
        </Text>
        <Text className="mt-1 text-lg text-zinc-700">
          Enter your email and password to sign in
        </Text>
      </View>
      <LoginForm />
      <View className="px-4 py-4 items-center justify-center">
        <Text className="text-medium text-zinc-500">
          Don't have an account?{' '}
          <Link href="/settings-tab/register" className="text-blue-500">
            Sign up.
          </Link>
        </Text>
      </View>
    </SafeView>
  );
}
