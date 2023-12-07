
import * as dotenv from "dotenv";
import { Twilio } from "twilio";
import fetch from 'cross-fetch';

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

    public static sendWhatAppMessage = async (): Promise<void> => {
        try {
            dotenv.config();
            const payload = {
                "to": '918989529107',
                "recipient_type": "individual",
                "type": "template",
                "template": {
                    "language": {
                        "policy": "deterministic",
                        "code": "en"
                    },
                    "name": "aayam_start_makrs",
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": "vvvv vvvv test"
                                },
                                {
                                    "type": "text",
                                    "text": 'vvvvvv  vvvvv 1'
                                },
                                {
                                    "type": "text",
                                    "text": 'vvvvvv  vvvvv 4'
                                },
                                {
                                    "type": "text",
                                    "text": 'vvvvvv  vvvvv 5'
                                },
                                {
                                    "type": "text",
                                    "text": 'vvvvvv  vvvvv 6'
                                }
                            ]
                        }
                    ]
                }
            };
            const response = await fetch(process.env.API_WHATSAPP_URL as string, {
                method: "POST", // or 'PUT'
                headers: {
                    "Content-Type": "application/json",
                    "API-KEY": atob(process.env.API_WHATSAPP_KEY as string)
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log("Success:", result);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    public sentWhatsAppOtp = async (cell: string, otp: number, msg: string) => {
        try {
            dotenv.config();
            const payload = {
                "to": '91' + cell,
                "recipient_type": "individual",
                "type": "template",
                "template": {
                    "language": {
                        "policy": "deterministic",
                        "code": "en"
                    },
                    "name": "otp",
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": "OTP"
                                },
                                {
                                    "type": "text",
                                    "text": msg
                                },
                                {
                                    "type": "text",
                                    "text": otp
                                }
                            ]
                        }
                    ]
                }
            };

            const response = await fetch(process.env.API_WHATSAPP_URL as string, {
                method: "POST", // or 'PUT'
                headers: {
                    "Content-Type": "application/json",
                    "API-KEY": atob(process.env.API_WHATSAPP_KEY as string)
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log("Success:", result);
            return true;
        } catch (error) {
            console.error("Error:", error);
            return false;
        }
    }
}

    /* ************************************* Private Methods ******************************************** */