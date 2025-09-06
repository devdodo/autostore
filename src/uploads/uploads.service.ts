import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { BaseResponse } from '../common/base-response';

@Injectable()
export class UploadsService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(filePath: string): Promise<BaseResponse<{ url: string; publicId: string }>> {
    try {
      const res = await cloudinary.uploader.upload(filePath, { folder: 'auto-shop' });
      return { success: true, message: 'Uploaded', data: { url: res.secure_url, publicId: res.public_id } };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Upload failed', error: e };
    }
  }
}


