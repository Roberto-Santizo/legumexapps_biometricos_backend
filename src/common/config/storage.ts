// `||` instead of `??`: an empty variable in .env (`STORAGE_ROOT=`) falls back to the default too
export default () => ({
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  storage: {
    // 's3' uploads to AWS S3; 'local' keeps files on disk (development without AWS)
    driver: process.env.STORAGE_DRIVER || 's3',
    root: process.env.STORAGE_ROOT || 'storage',
    signingKey: process.env.STORAGE_SIGNING_KEY,
    s3: {
      region: process.env.AWS_REGION || undefined,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || undefined,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || undefined,
      // Only for S3-compatible stores (MinIO, R2); AWS uses its regional endpoint
      endpoint: process.env.S3_ENDPOINT || undefined,
      photosBucket: process.env.S3_PHOTOS_BUCKET || undefined,
      privateBucket: process.env.S3_PRIVATE_BUCKET || undefined,
      // Public base URL of the photos (CloudFront or a public bucket). Without it, use signedUrl()
      photosUrl: process.env.PHOTOS_CDN_URL || undefined,
    },
  },
});
