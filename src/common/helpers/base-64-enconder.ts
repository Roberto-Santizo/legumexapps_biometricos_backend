import { BadRequestException } from '@nestjs/common';

export function imageToBase64(file: any, withPrefix = false): string {
  if (!file?.buffer?.length) throw new BadRequestException('Image file is empty or missing');
  if (!file.mimetype?.startsWith('image/')) throw new BadRequestException(`File must be an image, got '${file.mimetype}'`);

  const base64 = file.buffer.toString('base64');
  return withPrefix ? `data:${file.mimetype};base64,${base64}` : base64;
}

export function imageBufferToBase64(file: any): string {
  const base64 = file.toString('base64');
  return base64;
}