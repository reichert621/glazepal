import React from 'react';
import {Text, View} from 'react-native';

import {cn, formatGlazeVariant} from '@/utils';
import * as schema from '@/instant/schema';
import ImageViewer from '@/components/ImageViewer';

export const GlazePreview = ({
  className,
  glaze,
  brand,
  layers,
}: {
  className?: string;
  glaze: schema.Glaze;
  brand?: schema.Brand;
  layers?: number;
}) => {
  const {id, name, variant, defaultImageUri} = glaze;

  return (
    <View className={cn('flex flex-row items-center gap-3 py-2', className)}>
      <ImageViewer
        className="h-14 w-14 rounded-lg"
        image={defaultImageUri}
        debug={glaze.name}
      />
      <View>
        <Text
          className="w-80 text-lg font-medium text-zinc-900 dark:text-zinc-100"
          numberOfLines={1}
        >
          {name}{' '}
          {!!layers && layers > 1 && (
            <Text className="text-base text-zinc-600 dark:text-zinc-400">
              ({layers}x)
            </Text>
          )}
        </Text>
        <Text
          className="text-base text-zinc-600 dark:text-zinc-400"
          numberOfLines={1}
        >
          {formatGlazeVariant(variant)} glaze {brand ? `by ${brand.name}` : ''}
        </Text>
      </View>
    </View>
  );
};

export default GlazePreview;
