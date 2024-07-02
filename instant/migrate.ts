import {id, init, tx} from '@instantdb/react-native';

import {db} from '@/instant/index';
import * as schema from '@/instant/schema';

function recurse(ns: string, items: any[]): any[] {
  return items.flatMap((item: any) => {
    const txns = Object.entries(item).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return recurse(key, value).concat(
          value.map((child) => {
            return tx[ns][item.id].link({[key]: child.id});
          })
        );
      } else {
        return [tx[ns][item.id].update({[key]: value})];
      }
    });

    return txns;
  });
}

export function useMigrateDb(targetAppId: string) {
  const target = init<schema.Schema>({
    appId: targetAppId,
  });
  const {data = {} as any} = db.useQuery({
    glazes: {tags: {}, images: {}},
    combos: {tags: {}, images: {}, applications: {glazes: {}}},
    pieces: {
      parts: {glazes: {}, combos: {}},
      images: {},
      tags: {},
    },
  });

  Object.keys(data).map((ns) => {
    const items = data[ns];
    const txns = recurse(ns, items);

    return target.transact(txns);
  });
}
