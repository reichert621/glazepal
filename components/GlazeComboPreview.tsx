import React from 'react';
import {Text, View} from 'react-native';

import * as schema from '@/instant/schema';
import ImageViewer from '@/components/ImageViewer';
import {ComboResponse, GlazeApplicationResponse} from '@/instant';
import {cn} from '@/utils';

export const GlazeComboPreview = ({
  className = 'border-b border-zinc-100 dark:border-zinc-900',
  combo,
}: {
  className?: string;
  combo: ComboResponse;
}) => {
  const {id, name, description, defaultImageUri, applications = []} = combo;
  const base = applications.find(
    (a: GlazeApplicationResponse) => a.isBase && a.glazes.length > 0
  );
  const layers = applications.filter(
    (a: GlazeApplicationResponse) => !a.isBase && a.glazes.length > 0
  );

  return (
    <View className={cn('flex flex-row items-center gap-3 py-2', className)}>
      <ImageViewer
        className="h-14 w-14 rounded-lg"
        image={defaultImageUri}
        debug={name}
      />
      <View>
        <Text
          className="w-80 text-lg font-medium text-zinc-900 dark:text-zinc-100"
          numberOfLines={1}
        >
          {base ? base.glazes[0]?.name : name}
        </Text>

        <Text
          className="w-80 text-base text-zinc-700 dark:text-zinc-300"
          numberOfLines={1}
        >
          {layers.length > 0
            ? layers
                .map((a) =>
                  `${a.glazes[0]?.name} ${a.layers}x`.replace(' 1x', '').trim()
                )
                .join('/')
            : description}
        </Text>
      </View>
    </View>
  );
};

export default GlazeComboPreview;
