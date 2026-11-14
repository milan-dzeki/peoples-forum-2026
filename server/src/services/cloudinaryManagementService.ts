import { v2 as cloudinary } from 'cloudinary';
import type { ResourceType } from '@/constants/cloudinary';
import type { CloudinaryFile } from '@/types/common';
import AppError from '@/utils/appError';

class CloudinaryManagementService {
  constructor() {
    const {
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET
    } = process.env;

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      throw new Error('Missing Cloudinary environment variables.');
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true
    });
  }
  async uploadSingleFile (params: {
    file: File & { path: string } | undefined;
    resourceType: ResourceType;
  }): Promise<CloudinaryFile> {
    const { file, resourceType } = params;

    if (!file || !('path' in file)) {
      throw new AppError(500, `Invalid ${resourceType} provided for upload.`);
    }

    try {
      const uploadedFile = await cloudinary.uploader.upload(file.path, {
        resource_type: resourceType
      });
      
      return {
        secure_url: uploadedFile.secure_url,
        public_id: uploadedFile.public_id
      };
    } catch {
      throw new AppError(
        500, 
        `Unable to upload the ${resourceType}. Maybe servers are down. Refresh the page and try again.`
      );
    }
  }

  async deleteSingleFile (params: {
    publicId: string;
    resourceType: ResourceType;
    shouldThrowError?: boolean;
  }): Promise<void> {
    const {
      publicId,
      resourceType,
      shouldThrowError = false
    } = params;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch {
      if (shouldThrowError) {
        throw new AppError(500, 'Server error. Failed to remove file.');
      }
    }
  }
}

export default CloudinaryManagementService;