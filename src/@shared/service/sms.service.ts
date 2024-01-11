
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

    public static sendThanksMsg = async (to: string, orgPh: string): Promise<any> => {
        try {
            dotenv.config();
            const apiUrl = process.env.SMS_API_URL;
            const apiKey = process.env.SMS_API_KEY;
            const body = `Thank you for choosing AAYAM. We wish you a good health. For any other query you can contact at ${orgPh}. Regards AAYAM`;
            const url = `${apiUrl}?APIKey=${apiKey}&senderid=AAYAMC&channel=2&DCS=0&flashsms=0&number=91${to}&text=${body}&route=31&EntityId=1301159531158036635&dlttemplateid=1307170487227032299`;
            const data = await fetch(url);
            return data.json();
        } catch (error) {
            throw error;
        }
    }

    public static sendAppointmentConfirmation = async (to: string, date: string, time: string): Promise<any> => {
        try {
            dotenv.config();
            const apiUrl = process.env.SMS_API_URL;
            const apiKey = process.env.SMS_API_KEY;
            const body = `Thank you for choosing AAYAM. Your Appointment timing will be ${time} on ${date}. Regards AAYAM`;
            const url = `${apiUrl}?APIKey=${apiKey}&senderid=AAYAMC&channel=2&DCS=0&flashsms=0&number=91${to}&text=${body}&route=31&EntityId=1301159531158036635&dlttemplateid=1307170487204019861`;
            const data = await fetch(url);
            return data.json();
        } catch (error) {
            throw error;
        }
    }

    public static sendCredential = async (to: string, name: string, username: string, password: string): Promise<any> => {
        try {
            dotenv.config();
            const apiUrl = process.env.SMS_API_URL;
            const apiKey = process.env.SMS_API_KEY;
            const body = `Hello ${name}, you are successfully registered in our AAYAM service portal. Your Iogin ID is ${username} and password is ${password}. Regards AAYAM`;
            const url = `${apiUrl}?APIKey=${apiKey}&senderid=AAYAMC&channel=2&DCS=0&flashsms=0&number=91${to}&text=${body}&route=31&EntityId=1301159531158036635&dlttemplateid=1307170487213297026`;
            console.log(url);
            const data = await fetch(url);
            return data.json();
        } catch (error) {
            throw error;
        }
    }
}

    /* ************************************* Private Methods ******************************************** */