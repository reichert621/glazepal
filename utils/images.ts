import * as MediaLibrary from 'expo-media-library';
import {ImagePickerAsset} from 'expo-image-picker';

export async function getLocalImageUri(asset: ImagePickerAsset) {
  try {
    const {uri, assetId} = asset;

    if (!assetId) {
      const record = await MediaLibrary.createAssetAsync(uri);
      const info = await MediaLibrary.getAssetInfoAsync(record.id);

      return info.localUri || uri;
    } else {
      const info = await MediaLibrary.getAssetInfoAsync(assetId);

      return info.localUri || uri;
    }
  } catch (err) {
    console.error('Failed to process local image uri:', err);

    return asset.uri;
  }
}

// Uploads image to cloud service (e.g. AWS, GCP)
export async function getPublicImageUri(uri: string) {
  // TODO: Implement me!
  return null;
}

export async function processImageAsset(asset: ImagePickerAsset) {
  try {
    const {uri: cacheUri} = asset;
    const [localUri, publicUri] = await Promise.all([
      getLocalImageUri(asset),
      getPublicImageUri(cacheUri),
    ]);

    return {cacheUri, localUri, publicUri};
  } catch (err) {
    console.error('Failed to process image:', err);
    return {cacheUri: asset.uri, localUri: null, publicUri: null};
  }
}
