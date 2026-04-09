import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') || '';
    
    // Railway S3-compatible configuration
    this.s3Client = new S3Client({
      region: this.configService.get<string>('S3_REGION') || 'auto',
      endpoint: this.configService.get<string>('S3_ENDPOINT_URL'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY') || '',
      },
      // Force path style is often required for S3-compatible alternatives
      forcePathStyle: true,
    });
  }

  async generatePresignedUrl(fileName: string, mimeType: string, registrationId: string, docType: string): Promise<{ url: string, key: string }> {
    try {
      const extension = fileName.split('.').pop();
      const uniqueKey = `registrations/${registrationId}/${docType}_${Date.now()}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueKey,
        ContentType: mimeType,
      });

      // URL valid for 15 minutes
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

      return { url, key: uniqueKey };
    } catch (error) {
      throw new InternalServerErrorException('Gagal menghasilkan signed URL untuk upload dokumen.');
    }
  }
}
