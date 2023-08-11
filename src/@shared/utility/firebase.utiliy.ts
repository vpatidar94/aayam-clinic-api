import * as admin from 'firebase-admin';
import * as dotenv from "dotenv";

export class FirebaseUtility {
    public static getApp() {
        let app;
        try {
            if (admin.apps?.length > 0) {
                app = admin.app();
            } else {
                dotenv.config();
                const serviceAccount = {
                    projectId: process.env.FB_PROJECT_ID,
                    clientEmail: process.env.FB_CLIENT_EMAIL,
                    privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n')
                } as admin.ServiceAccount;
                app = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            }
        } catch (error) {
            console.log('FIREBASE error ', error);
            app = admin.app();
        }
        return app;
    }
}