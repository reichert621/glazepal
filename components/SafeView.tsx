import {ScrollView, ScrollViewProps, View, ViewProps} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-aware-scroll-view';
import React from 'react';

type SafeViewProps = React.PropsWithChildren<{className?: string} & ViewProps>;

export function SafeView({children, style, ...props}: SafeViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

type SafeScrollViewProps = React.PropsWithChildren<
  {className?: string} & ScrollViewProps
>;

export function SafeScrollView({
  children,
  style,
  contentContainerStyle,
  ...props
}: SafeScrollViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[
        {
          flex: 1,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
      contentContainerStyle={[
        {paddingTop: insets.top, paddingBottom: insets.bottom},
        contentContainerStyle,
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

export function SafeKeyboardAwareScrollView({
  children,
  style,
  contentContainerStyle,
  ...props
}: SafeScrollViewProps & KeyboardAwareScrollViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView
      style={[
        {
          flex: 1,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
      contentContainerStyle={[
        {paddingTop: insets.top, paddingBottom: insets.bottom},
        contentContainerStyle,
      ]}
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
