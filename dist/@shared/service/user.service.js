"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const users_model_1 = __importDefault(require("../model/users.model"));
const firebase_utiliy_1 = require("../../@shared/utility/firebase.utiliy");
const auth_service_1 = require("./auth.service");
class UserService {
    constructor() {
        this.user = users_model_1.default;
        /* ************************************* Public Methods ******************************************** */
        this.saveUser = async (user) => {
            var _a, _b;
            try {
                if (user._id) {
                    if (user.email) {
                        delete user.email;
                    }
                    const vo = await users_model_1.default.findByIdAndUpdate(user._id, user);
                    if (user.sub && user.email) {
                        await new auth_service_1.AuthService().setFbCustomUserClaim(user.sub, user.email);
                    }
                    return vo;
                }
                else {
                    const userExist = await this.user.exists({ email: user.email });
                    if (userExist) {
                        return null;
                    }
                    user.email = (_b = (_a = user.email) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === null || _b === void 0 ? void 0 : _b.trim();
                    user.sub = await this._saveUserAuth(user);
                    return await users_model_1.default.create(user);
                }
            }
            catch (error) {
                throw error;
            }
        };
        this.userExistWithEmail = async (email) => {
            const userExist = await this.user.exists({ email });
            return !!userExist;
        };
        this.getUserByEmail = async (email) => {
            return await this.user.findOne({ email });
        };
        /* ************************************* Private Methods ******************************************** */
        this._saveUserAuth = async (userVo) => {
            var _a, _b;
            const auth = firebase_utiliy_1.FirebaseUtility.getApp().auth();
            let user = {
                email: (_b = (_a = userVo.email) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === null || _b === void 0 ? void 0 : _b.trim(),
                password: userVo.cell.trim()
            };
            user = await auth.createUser(user);
            await new auth_service_1.AuthService().setFbCustomUserClaim(user.uid, user.email);
            return user.uid;
        };
    }
}
exports.UserService = UserService;
