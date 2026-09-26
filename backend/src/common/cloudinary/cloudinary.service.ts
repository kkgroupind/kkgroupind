import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.logger.log(`Cloudinary configured successfully for cloud: ${cloudName}`);
    } else {
      this.logger.warn('Cloudinary credentials missing or partially configured');
    }
  }

  /**
   * Returns public parameters required for unsigned client-side uploads
   */
  getPublicConfig() {
    return {
      cloudName: this.configService.get<string>('cloudinary.cloudName') || '',
      uploadPreset: this.configService.get<string>('cloudinary.uploadPreset') || '',
    };
  }

  /**
   * Upload an image buffer or base64 data string to Cloudinary
   */
  async uploadImage(
    fileStr: string,
    folder: string = 'kk-group/profiles',
  ): Promise<UploadApiResponse> {
    return cloudinary.uploader.upload(fileStr, {
      folder,
      resource_type: 'image',
    });
  }

  /**
   * Remove an image by public ID
   */
  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
}
