import React from 'react';
import {Image, StyleProp, View, useColorScheme} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import colors from 'tailwindcss/colors';

import * as schema from '@/instant/schema';
import {cn} from '@/utils';

function parseUriQueue(image: schema.Image | string | null): string[] {
  if (!image) {
    return [];
  } else if (typeof image === 'string') {
    return [image];
  }

  const {localUri, publicUri, cacheUri} = image;

  return [localUri, publicUri, cacheUri].filter((str): str is string => !!str);
}

export default function ImageViewer({
  style,
  className,
  image,
  placeholder,
  debug,
}: {
  style?: StyleProp<any>;
  className?: string;
  image: schema.Image | string | null;
  placeholder?: React.ReactNode;
  debug?: string;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [uris, setUriQueue] = React.useState<string[]>(parseUriQueue(image));
  const [current] = uris;
  const imageKey = typeof image === 'string' ? image : image?.id;

  React.useEffect(() => setUriQueue(parseUriQueue(image)), [imageKey]);

  const handleImageError = (err: any) => {
    const prefix = debug ? `[${debug}]` : '[ImageViewer]';
    console.debug(prefix, 'Failed to load image', current);
    // console.error(err);
    console.debug(prefix, 'Trying next uri...');

    setUriQueue((existing) => existing.filter((uri) => uri !== current));
  };

  if (current) {
    return (
      <Image
        style={style}
        className={cn(className)}
        source={{uri: current}}
        // TODO: maybe cache whichever image loaded successfully?
        // onLoad={() => {})
        onError={(err) => handleImageError(err)}
      />
    );
  } else {
    return (
      placeholder || (
        <View
          style={style}
          className={cn(
            'justify-center items-center bg-zinc-200 dark:bg-zinc-800',
            className
          )}
        >
          <Ionicons
            name="image"
            color={isDarkMode ? colors.zinc[600] : colors.zinc[400]}
            size={20}
          />
        </View>
      )
    );
  }
}
