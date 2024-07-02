import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

import * as schema from '@/instant/schema';
import {ComboResponse} from '@/instant';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseErrorMessage(err: any) {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.response?.data?.error_description ||
    err.message ||
    String(err) ||
    err
  );
}

export function prioritizeMostRecent(a: any, b: any): number {
  const x = a.updatedAt || a.createdAt || 0;
  const y = b.updatedAt || b.createdAt || 0;

  if (x === y) {
    return 0;
  }

  return x < y ? 1 : -1;
}

export function formatGlazeVariant(variant: string) {
  switch (variant) {
    case 'brush':
      return 'Brushing';
    case 'dip':
      return 'Dipping';
    default:
      return variant;
  }
}

type GlazeApplicationLayer = schema.GlazeApplication & {glaze: schema.Glaze};

export function formatGlazeApplications(applications: GlazeApplicationLayer[]) {
  const layers = applications.map((a) => {
    if (a.layers === 1) {
      return a.glaze.name;
    }

    return `${a.glaze.name} ${a.layers}x`;
  });

  return {
    name: layers.join('/'),
    description: layers.join(', '),
  };
}

export function formatGlazeCombo(combo: ComboResponse) {
  const {applications = []} = combo;
  const layers = applications
    .sort((a, b) => {
      return a.isBase ? -1 : b.isBase ? 1 : 0;
    })
    .map((a) => {
      if (a.layers === 1) {
        return a.glazes[0]?.name;
      }

      return `${a.glazes[0]?.name} ${a.layers}x`;
    });

  return {
    name: layers.filter(Boolean).join(' + '),
    description: layers.filter(Boolean).join(', '),
  };
}
