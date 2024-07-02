import {View} from 'react-native';

import {MonoText} from '@/components/StyledText';

export default function Debugger({data}: {data: Record<any, any>}) {
  return (
    <View className="bg-zinc-900 rounded p-4">
      <MonoText className="text-zinc-300 text-sm">
        {JSON.stringify(data, null, 2)}
      </MonoText>
    </View>
  );
}
