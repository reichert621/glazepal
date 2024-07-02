import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  useColorScheme,
} from 'react-native';
import colors from 'tailwindcss/colors';

import {cn} from '@/utils';

type ButtonProps = {
  className?: string;
  textClassName?: string;
  variant: 'primary' | 'secondary' | 'destructive';
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  pending?: boolean;
  text: string;
} & PressableProps;

const Button = React.forwardRef<any, ButtonProps>(
  (
    {
      className,
      textClassName,
      variant = 'primary',
      pending = false,
      icon,
      text,
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isDisabled = props.disabled || pending;

    const getIconColor = () => {
      if (isDark) {
        return variant === 'primary'
          ? colors.zinc[900]
          : variant === 'destructive'
            ? colors.red[500]
            : colors.zinc[200];
      } else {
        return variant === 'primary'
          ? colors.zinc[100]
          : variant === 'destructive'
            ? colors.red[500]
            : colors.zinc[800];
      }
    };

    return (
      <Pressable
        className={cn(
          'flex-row justify-center items-center gap-3 border-2 rounded-xl px-6 py-3',
          variant === 'primary'
            ? 'border-zinc-700 bg-zinc-800 dark:border-zinc-200 dark:bg-zinc-100'
            : variant === 'destructive'
              ? 'border-red-500'
              : 'border-zinc-700 dark:border-zinc-800 dark:bg-zinc-900',
          isDisabled ? 'opacity-80' : 'opacity-100',
          className
        )}
        ref={ref}
        {...props}
      >
        {pending ? (
          <ActivityIndicator size="small" color={getIconColor()} />
        ) : !!icon ? (
          <Ionicons name={icon} color={getIconColor()} size={16} />
        ) : null}
        <Text
          className={cn(
            'text-lg font-semibold',
            variant === 'primary'
              ? 'text-zinc-50 dark:text-zinc-900'
              : variant === 'destructive'
                ? 'text-red-500'
                : 'text-zinc-900 dark:text-zinc-100',
            textClassName
          )}
        >
          {text}
        </Text>
      </Pressable>
    );
  }
);

export default Button;
