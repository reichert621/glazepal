import {id, init, tx} from '@instantdb/react-native';

import * as schema from '@/instant/schema';

export const db = init<schema.Schema>({
  appId: process.env.EXPO_PUBLIC_INSTANT_APP_ID!,
});

export type GlazeApplicationLayer = schema.GlazeApplication & {
  glaze: schema.Glaze;
};
export type GlazeApplicationResponse = schema.GlazeApplication & {
  glazes: schema.Glaze[];
};
export type ComboResponse = schema.Combo & {
  applications: GlazeApplicationResponse[];
};

export type PiecePartResponse = schema.PiecePart & {
  glazes: schema.Glaze[];
  combos: schema.Combo[];
};

export type PieceResponse = schema.Piece & {
  parts: PiecePartResponse[];
  tags: schema.Tag[];
};

export type GlazePart =
  | {
      location: 'inner' | 'outer';
      type: 'glaze';
      layers?: number;
      glaze: schema.Glaze;
    }
  | {
      location: 'inner' | 'outer';
      type: 'combo';
      combo: schema.Combo;
    };

/**
 * Seed data
 */

const _glazes: Partial<schema.Glaze>[] = [
  {name: 'Lotta', variant: 'dip'},
  {name: 'Khalil', variant: 'dip'},
  {name: 'Guido', variant: 'dip'},
  {name: 'Whiplash', variant: 'dip'},
  {name: 'Walt', variant: 'dip'},
  {name: 'Northern Woods', variant: 'brush'},
  {name: 'Satin Patina', variant: 'brush'},
  {name: 'Rainforest', variant: 'brush'},
  {name: 'Weathered Blue', variant: 'brush'},
];

const _combos: Partial<schema.Combo>[] = [
  {name: 'Lotta + Walt', description: 'Lotta base, Walt on top'},
  {name: 'Khalil + Guido', description: 'Khalil base, Guido on top'},
  {name: 'Guido + Khalil', description: 'Guido base, Khalil on top'},
  {name: 'Whiplash + Guido', description: 'Whiplash base, Guido on top'},
  {
    name: 'Khalil + Rainforest 2x/Satin Patina 2x',
    description: 'Khalil base, Rainforest 2x, Satin Patina 2x',
  },
  {
    name: 'Khalil + Northern Woods 2x/Weathered Blue 2x',
    description: 'Khalil base, Northern Woods 2x, Weathered Blue 2x',
  },
  {
    name: 'Guido + Rainforest 2x/Satin Patina 2x',
    description: 'Guido base, Rainforest 2x, Satin Patina 2x',
  },
  {
    name: 'Guido + Northern Woods 2x, Weathered Blue 2x',
    description: 'Guido base, Northern Woods 2x, Weathered Blue 2x',
  },
];

// Runny
// Stable
// Good for texture
// Like/Iterate/Dislike
// White Clay/Red Clay Body
const _tags: Partial<schema.Tag>[] = [
  {name: 'Runny'},
  {name: 'Stable'},
  {name: 'Good for texture'},
  {name: 'Like'},
  {name: 'Iterate'},
  {name: 'Dislike'},
  {name: 'White clay'},
  {name: 'Red clay'},
];

const _pieces: Partial<schema.Piece>[] = [
  {
    defaultImageUri:
      'https://i.etsystatic.com/20786299/r/il/2e6e9d/6072675345/il_1588xN.6072675345_s1m1.jpg',
  },
  {
    defaultImageUri:
      'https://i.etsystatic.com/20786299/r/il/15e82f/6073088149/il_1588xN.6073088149_qd32.jpg',
  },
  {
    defaultImageUri:
      'https://i.etsystatic.com/20786299/r/il/6548d0/6024596916/il_1588xN.6024596916_7p2k.jpg',
  },
  {
    defaultImageUri:
      'https://i.etsystatic.com/8091879/r/il/e9db70/6049641251/il_1588xN.6049641251_8kr9.jpg',
  },
  {
    defaultImageUri:
      'https://i.etsystatic.com/20786299/r/il/377ae1/6072619411/il_1588xN.6072619411_3ouq.jpg',
  },
  {
    defaultImageUri:
      'https://i.etsystatic.com/20786299/r/il/2fa826/6072617121/il_1588xN.6072617121_gzbx.jpg',
  },
];
