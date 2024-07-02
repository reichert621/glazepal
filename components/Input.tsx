import {cn} from '@/utils';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
  useColorScheme,
} from 'react-native';
import colors from 'tailwindcss/colors';

type Props = {
  icon?: React.ComponentProps<typeof Ionicons>['name'] | null;
  onPressIcon?: () => void;
  containerClassName?: string;
} & TextInputProps;

export function Textarea({className, icon, ...props}: Props) {
  return (
    <View className="relative flex-row items-center">
      <TextInput
        className={cn(
          'flex-row border rounded-xl py-3 px-4',
          'border-zinc-300 dark:border-zinc-700 font-medium dark:text-zinc-100',
          className
        )}
        multiline
        numberOfLines={props.numberOfLines || 4}
        {...props}
      ></TextInput>
    </View>
  );
}

export default function Input({
  className,
  containerClassName,
  icon,
  onPressIcon,
  ...props
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={cn('relative flex-row items-center', containerClassName)}>
      <TextInput
        className={cn(
          'flex-row border rounded-xl py-4',
          'border-zinc-300 dark:border-zinc-700 font-medium dark:text-zinc-100', // TODO
          icon ? 'pl-4 pr-10' : 'pl-4 pr-4',
          className
        )}
        {...props}
      ></TextInput>
      {!!icon && (
        <Pressable className="absolute p-3 right-0" onPress={onPressIcon}>
          <Ionicons
            name={icon}
            color={isDark ? colors.zinc[600] : colors.zinc[400]}
            size={20}
          />
        </Pressable>
      )}
    </View>
  );
}
