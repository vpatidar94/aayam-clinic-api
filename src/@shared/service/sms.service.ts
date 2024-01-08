
import fetch from 'cross-fetch';
import * as dotenv from "dotenv";

export class SmsService {

    /* ************************************* static field ******************************************** */

    /* ************************************* Constructor ******************************************** */
    constructor() {
    }

    /* ************************************* Public Methods ******************************************** */
    public static sendOtp = async (to: string, otp: number): Promise<any> => {
        try {
            dotenv.config();
            const apiUrl = process.env.SMS_API_URL;
            const apiKey = process.env.SMS_API_KEY;
            const body = `Your OTP is: ${otp}. Regards AAYAM`;
            const url = `${apiUrl}?APIKey=${apiKey}&senderid=AAYAMC&channel=2&DCS=0&flashsms=0&number=91${to}&text=${body}&route=31&EntityId=1301159531158036635&dlttemplateid=1307161797225449463`;
            const data = await fetch(url);
            return data.json();
        } catch (error) {
            throw error;
        }
    }
}

    /* ************************************* Private Methods ******************************************** */