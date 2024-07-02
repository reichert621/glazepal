import {Text, TextProps} from 'react-native';

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, {fontFamily: 'SpaceMono'}]} />;
}
