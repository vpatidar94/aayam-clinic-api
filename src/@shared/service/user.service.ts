import {
    UserVo
} from "aayam-clinic-core";
import userModel from '../model/users.model';
import { FirebaseUtility } from "../../@shared/utility/firebase.utiliy";
import { AuthService } from "./auth.service";

export class UserService {
    public user = userModel;

    /* ************************************* Public Methods ******************************************** */
    public saveUser = async (user: UserVo): Promise<UserVo | null> => {
        try {
            if (user._id) {
                if (user.email) {
                    delete user.email;
                }
                const vo = await userModel.findByIdAndUpdate(user._id, user);
                if (user.sub && user.email) {
                    await new AuthService().setFbCustomUserClaim(user.sub, user.email);
                }
                return vo;
            } else {
                const userExist = await this.user.exists({ email: user.email });
                if (userExist) {
                    return null;
                }
                user.email = user.email?.toLocaleLowerCase()?.trim();
                user.sub = await this._saveUserAuth(user);
                return await userModel.create(user);
            }
        } catch (error) {
            throw error;
        }
    };

    public userExistWithEmail = async (email: string): Promise<boolean> => { 
        const userExist = await this.user.exists({ email });
        return !!userExist; 
    }

    public getUserByEmail = async (email: string): Promise<UserVo | null> => { 
        return await this.user.findOne({ email }) as UserVo; 
    }

    /* ************************************* Private Methods ******************************************** */
    private _saveUserAuth = async (userVo: UserVo): Promise<string> => {
        const auth = FirebaseUtility.getApp().auth();
        let user = {
            email: userVo.email?.toLocaleLowerCase()?.trim(),
            password: userVo.cell.trim()
        } as any;
        user = await auth.createUser(user);
        await new AuthService().setFbCustomUserClaim(user.uid, user.email);
        return user.uid;
    }
}

