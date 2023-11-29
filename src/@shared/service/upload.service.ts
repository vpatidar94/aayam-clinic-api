import * as dotenv from "dotenv";
import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

export class UploadService {

    /* ************************************* static field ******************************************** */
    private s3!: S3Client;

    /* ************************************* Constructor ******************************************** */
    constructor() {
        dotenv.config();
        this.s3 = new S3Client({
            endpoint: process.env.BUCKET_ENDPOINT,
            forcePathStyle: false, // Configures to use subdomain/virtual calling format.
            credentials: {
                accessKeyId: process.env.BUCKET_KEY,
                secretAccessKey: process.env.BUCKET_SECRET
            } as any
        });
    }

    /* ************************************* Public Methods ******************************************** */
    public uploadMedia = async (path: string, buffer: Buffer): Promise<string> => {
        dotenv.config();
        const params = {
            Bucket: process.env.BUCKET_NAME ?? '',
            Key: `${path}`,
            Body: buffer,
            ACL: "public-read" // Defines ACL permissions, such as private or public.
        } as PutObjectCommandInput;
        await this.s3.send(new PutObjectCommand(params));
        return path;
    }

    /* ************************************* Private Methods ******************************************** */
}