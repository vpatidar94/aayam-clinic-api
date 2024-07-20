import * as dotenv from "dotenv";
import { S3Client, ListObjectsV2Command, ListObjectsV2CommandInput, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class GetImageService {

    /* ************************************* static field ******************************************** */
    private s3!: S3Client;
    private spacesEndpoint!: string;

    /* ************************************* Constructor ******************************************** */
    constructor() {
        dotenv.config();
        this.spacesEndpoint = 'blr1.digitaloceanspaces.com'; // Change to your region
        this.s3 = new S3Client({
            region: 'blr1',
            endpoint: process.env.BUCKET_ENDPOINT,
            forcePathStyle: false, // Configures to use subdomain/virtual calling format.
            credentials: {
                accessKeyId: process.env.BUCKET_KEY,
                secretAccessKey: process.env.BUCKET_SECRET
            } as any
        });
    }

    /* ************************************* Public Methods ******************************************** */
    // 

    public listImages = async (folder: string): Promise<string[]> => {
        const params = {
            Bucket: process.env.BUCKET_NAME ?? '',
            Prefix: folder,
        } as ListObjectsV2CommandInput;
        try {
            const data = await this.s3.send(new ListObjectsV2Command(params));
            return data.Contents ? data.Contents.map((item: any) => `https://${params.Bucket}.${this.spacesEndpoint}/${item.Key}`) : [];
        } catch (err) {
            console.error(err);
            return [];
        }
    }


    public async deleteImage(key: string): Promise<void> {
        const params = {
            Bucket: process.env.BUCKET_NAME ?? '',
            Key: key
        };
        await this.s3.send(new DeleteObjectCommand(params));
    }   

}
