
import { Twilio } from "twilio";
import * as dotenv from "dotenv";

export class SmsService {

    /* ************************************* static field ******************************************** */

    /* ************************************* Constructor ******************************************** */
    constructor() {
    }

    /* ************************************* Public Methods ******************************************** */
    public static sendSms = async (to: string, body: string): Promise<boolean> => {
        dotenv.config();
        const client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
        const res = await client.messages.create({
            from: process.env.TWILIO_CELL,
            to: '+916260687100',
            body: body
        });

        return (res.status != 'failed' && res.status != 'undelivered');
    }

    /* ************************************* Private Methods ******************************************** */
}