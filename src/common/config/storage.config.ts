import { ConfigService } from '@nestjs/config';
import { LocalDisk, S3Disk, type StorageModuleOptions } from '@nestjs/storage';

export function createStorageOptions(config: ConfigService): StorageModuleOptions {
  const driver = config.getOrThrow<string>('storage.driver');
  if (driver === 's3') return createS3Options(config);
  if (driver === 'local') return createLocalOptions(config);
  throw new Error(`STORAGE_DRIVER must be 's3' or 'local', got '${driver}'`);
}

function createS3Options(config: ConfigService): StorageModuleOptions {
  const region = config.getOrThrow<string>('storage.s3.region');
  const credentials = {
    accessKeyId: config.getOrThrow<string>('storage.s3.accessKeyId'),
    secretAccessKey: config.getOrThrow<string>('storage.s3.secretAccessKey'),
  };
  const endpoint = config.get<string>('storage.s3.endpoint');
  return {
    default: 'private',
    disks: {
      // Employee photos: public URL only when PHOTOS_CDN_URL is set, otherwise presigned URLs
      photos: new S3Disk({
        bucket: config.getOrThrow<string>('storage.s3.photosBucket'),
        region,
        credentials,
        endpoint,
        publicUrl: config.get<string>('storage.s3.photosUrl'),
        serverSideEncryption: 'AES256',
      }),
      // Private files: only reachable through presigned URLs (disk.signedUrl())
      private: new S3Disk({
        bucket: config.getOrThrow<string>('storage.s3.privateBucket'),
        region,
        credentials,
        endpoint,
        serverSideEncryption: 'AES256',
      }),
    },
  };
}

function createLocalOptions(config: ConfigService): StorageModuleOptions {
  const appUrl = config.getOrThrow<string>('appUrl');
  const root = config.getOrThrow<string>('storage.root');
  return {
    default: 'private',
    disks: {
      photos: new LocalDisk({ root: `${root}/photos`, publicUrl: `${appUrl}/photos` }),
      // LocalDisk can't presign: the app signs URLs with STORAGE_SIGNING_KEY (>= 32 chars)
      private: new LocalDisk({
        root: `${root}/private`,
        signedUrls: {
          baseUrl: `${appUrl}/files`,
          keys: [config.getOrThrow<string>('storage.signingKey')],
        },
      }),
    },
  };
}
