import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "../config/index.js";

class S3Service {
  constructor() {
    const s3Config = {
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    };

    if (env.AWS_S3_ENDPOINT) {
      s3Config.endpoint = env.AWS_S3_ENDPOINT;
    }

    if (env.AWS_S3_FORCE_PATH_STYLE) {
      s3Config.forcePathStyle = true;
    }

    this.s3Client = new S3Client(s3Config);
    this.bucketName = env.AWS_S3_BUCKET_NAME;
    this.useS3 = env.USE_S3;

    if (this.useS3) {
      if (!this.bucketName) {
        console.warn("USE_S3 is enabled but AWS_S3_BUCKET_NAME is not set.");
      }
      if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
        console.warn(
          "AWS credentials are not fully set in environment variables."
        );
      }
    }
  }

  /**
   * @description Generates the full S3 URL from the relative path
   * @param {string} key - Relative path in S3 bucket
   * @returns {string} Full S3 URL
   */
  getUrl(key) {
    if (!key) return null;
    return `https://${this.bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  /**
   * @description Uploads file to S3 bucket
   * @param {Buffer} fileBuffer - File content
   * @param {string} key - S3 object key (relative path)
   * @param {string} contentType - MIME type
   * @returns {Promise<string>} Relative path stored in DB
   */
  async uploadFile(fileBuffer, key, contentType) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      return key; // Return only the relative path
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * @description Deletes file from S3 bucket
   * @param {string} key - S3 object key (relative path)
   * @returns {Promise<void>}
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * @description Determines if S3 is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.useS3;
  }
}

export default new S3Service();
