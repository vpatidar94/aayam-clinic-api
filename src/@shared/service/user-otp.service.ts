import {
    UserOtpVo, UserVo
} from "aayam-clinic-core";
import userOtpModel from "../../@shared/model/user-otp.model";
import { SmsService } from "./sms.service";

export class UserOtpService {
    public otpModel = userOtpModel;

    /* ************************************* Public Methods ******************************************** */
    public addUserOtp = async (user: UserVo): Promise<boolean> => {
        try {
            await this.otpModel.findOneAndRemove({ empCode: user.code });
            const userOtp = {} as UserOtpVo;
            userOtp.cell = user.cell;
            userOtp.otp = this._generateOtp();
            userOtp.empCode = user.code;
            userOtp.userId = user._id?.toString();
            await this.otpModel.create(userOtp);
            await new SmsService().sentWhatsAppOtp('7898118503', userOtp.otp, 'Aayam Clinic App');
            return true;
        } catch (error) {
            console.log('xxx xx xerror ', error);
            throw error;
        }
    };

    public isValidUserOtp = async (empCOde: string, otp: string): Promise<boolean> => {
        try {
            const userOtpVo: UserOtpVo | null  = await this.otpModel.findOne({ empCode: empCOde, otp: Number(otp) });
            return !!userOtpVo;
        } catch (error) {
            throw error;
        }
    };


    /* ************************************* Private Methods ******************************************** */
    private _generateOtp = (): number => {
        // Generate a random number between 100000 and 999999
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Convert the number to a string
        const otpString = otp.toString();

        // Ensure the string has exactly 6 digits by padding with zeros if needed
        const sixDigitOtp = otpString.padStart(6, '0');

        return Number(sixDigitOtp);
    }

}

