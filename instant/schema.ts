export type Image = {
  id: string;
  uri: string;
  createdAt?: number;
  updatedAt?: number;
  cacheUri?: string;
  localUri?: string | null;
  publicUri?: string | null;
};
export type Glaze = {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  variant: string; // brush, dip
  defaultImageUri: string | null;
  isFavorite?: boolean;
  createdAt?: number;
  updatedAt?: number;
};
export type GlazeApplication = {
  id: string;
  description?: string;
  isBase?: boolean;
  layers: number;
};
export type Combo = {
  id: string;
  name?: string;
  description?: string;
  notes?: string;
  defaultImageUri: string | null;
  isFavorite?: boolean;
  createdAt?: number;
  updatedAt?: number;
};
export type Tag = {
  id: string;
  name: string;
  rank: number;
  color: string | null;
  createdAt?: number;
  updatedAt?: number;
};
export type Piece = {
  id: string;
  createdAt: number;
  updatedAt: number;
  name?: string;
  description?: string;
  notes?: string;
  defaultImageUri: string | null;
  isFavorite?: boolean;
};
export type PiecePart = {
  id: string;
  createdAt: number;
  updatedAt: number;
  location: 'inner' | 'outer';
  type: 'glaze' | 'combo';
  layers?: number;
};

export type Brand = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};

export type Schema = {
  images: Image;
  glazes: Glaze;
  combos: Combo;
  tags: Tag;
  pieces: Piece;
  parts: PiecePart;
  brands: Brand;
};
