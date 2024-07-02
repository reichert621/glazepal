import React from 'react';
import {Pressable, Text, View, useWindowDimensions} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import {useSharedValue} from 'react-native-reanimated';
import colors from 'tailwindcss/colors';

import * as schema from '@/instant/schema';
import {cn} from '@/utils';
import ImageViewer from '@/components/ImageViewer';

export default function ImageCarousel({
  className,
  images,
  combo,
  onScrollStart,
  onScrollEnd,
  onPressImage,
}: {
  className?: string;
  images: schema.Image[];
  combo?: schema.Combo;
  onScrollStart: () => void;
  onScrollEnd: () => void;
  onPressImage: (image: schema.Image) => void;
}) {
  const windowWidth = useWindowDimensions().width;
  const ref = React.useRef<ICarouselInstance>(null);
  const scrollOffsetValue = useSharedValue<number>(0);
  const progress = useSharedValue<number>(0);
  const carouselHeight = windowWidth / 1.6;

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View className={cn('flex-1 w-full h-full relative', className)}>
      <Carousel
        width={windowWidth}
        height={carouselHeight}
        // vertical={false}
        // loop={false}
        enabled={images.length > 1}
        ref={ref}
        defaultScrollOffsetValue={scrollOffsetValue}
        style={{width: '100%'}}
        onProgressChange={progress}
        onConfigurePanGesture={(g) => g.enabled(false)}
        data={images}
        onScrollStart={() => {
          console.log('Scroll start!');
          onScrollStart();
        }}
        onScrollEnd={() => {
          console.log('Scroll end!');
          onScrollEnd();
        }}
        pagingEnabled={images.length > 1}
        onSnapToItem={(index) => console.log('current index:', index)}
        renderItem={(data) => {
          const isPlaceholder = data.item.uri === ''; // TODO

          return (
            <Pressable
              key={data.index}
              className="bg-zinc-900 justify-center items-center w-full h-full"
              onPress={() => onPressImage(data.item)}
            >
              {isPlaceholder ? (
                <View className="gap-1 items-center justify-center">
                  <Ionicons name="image" color={colors.zinc[700]} size={48} />
                  <Text className="text-base font-medium text-zinc-500">
                    Tap to add a photo
                  </Text>
                </View>
              ) : (
                <ImageViewer
                  style={{height: carouselHeight, width: carouselHeight}}
                  image={data.item}
                  debug={combo?.name ?? 'Carousel'}
                  placeholder={
                    <View
                      style={{
                        height: carouselHeight,
                        width: carouselHeight,
                      }}
                      className={cn(
                        'gap-1 justify-center items-center bg-zinc-800'
                      )}
                    >
                      <Ionicons
                        name="alert-circle"
                        color={colors.zinc[600]}
                        size={48}
                      />
                      <Text className="text-base font-medium text-zinc-500">
                        Failed to load image
                      </Text>
                    </View>
                  }
                />
              )}
            </Pressable>
          );
        }}
      />
      {images.length > 1 && (
        <Pagination.Basic
          progress={progress}
          data={images}
          size={8}
          dotStyle={{
            borderRadius: 100,
            backgroundColor: colors.zinc[400],
          }}
          activeDotStyle={{
            borderRadius: 100,
            overflow: 'hidden',
            backgroundColor: colors.zinc[900],
          }}
          containerStyle={[
            {
              padding: 4,
              borderRadius: 24,
              backgroundColor: colors.zinc[100],
              position: 'absolute',
              bottom: 4,
              gap: 4,
              marginBottom: 4,
            },
          ]}
          onPress={onPressPagination}
        />
      )}
    </View>
  );
}
