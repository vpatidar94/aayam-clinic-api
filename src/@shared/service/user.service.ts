import {
    AclCustVo,
    AclVo,
    AssetPathUtility,
    AssetUploadDto,
    FnUtility,
    JwtClaimDto,
    OrgCodeNoDto,
    OrgVo,
    ROLE,
    UserAccessDetailDto,
    UserAccessDto,
    UserAccountVo,
    UserCustDto,
    UserEmpDto,
    UserIncomeVo,
    UserTypePopulateVo,
    UserTypeVo,
    UserVo
} from "aayam-clinic-core";
import userModel from '../model/users.model';
import { FirebaseUtility } from "../../@shared/utility/firebase.utiliy";
import { AuthService } from "./auth.service";
import { OrgService } from "./org.service";
import userAccountModel from "../../@shared/model/users-account.model";
import { PREFIX, SUFFIX } from "../const/prefix-suffix";
import { MetaOrgService } from "../../@shared/service/meta-org.service";
import userTypeModel from "../../@shared/model/user-type.model";
import { APP_CONST } from "../../@shared/const/app.const";
import { SmsService } from "./sms.service";
import { UserOtpService } from "./user-otp.service";

export class UserService {
    public user = userModel;
    public userTypeModel = userTypeModel;
    public userAccount = userAccountModel;

    /* ************************************* Public Methods ******************************************** */
    // Not used 
    // public saveUser = async (user: UserVo): Promise<UserVo | null> => {
    //     try {
    //         if (user._id) {
    //             if (user.email) {
    //                 delete user.email;
    //             }
    //             const vo = await userModel.findByIdAndUpdate(user._id, user);
    //             if (user.sub && user.email) {
    //                 await new AuthService().setFbCustomUserClaim(user.sub, user.email,);
    //             }
    //             return vo;
    //         } else {
    //             const userExist = await this.user.exists({ email: user.email });
    //             if (userExist) {
    //                 return null;
    //             }
    //             user.sub = await this._saveUserAuth(user);
    //             return await userModel.create(user);
    //         }
    //     } catch (error) {
    //         throw error;
    //     }
    // };

    public saveStaff = async (staff: UserEmpDto): Promise<UserVo | null> => {
        try {
            let user = staff.user;
            const email = user.email;
            const acl = staff.acl;
            if (!acl || !acl.orgId) {
                return null;
            }
            if (user?._id) {
                if (user.email) {
                    delete user.email;
                }
                const aclList = user.emp;
                if (!aclList || FnUtility.isEmpty(aclList)) {
                    user.emp = {} as {
                        [key: string]: AclVo;
                    };
                    user.emp[acl.orgId] = acl;
                } else {
                    aclList[acl.orgId] = acl;
                    user.emp = aclList;
                }
                const vo = await userModel.findByIdAndUpdate(user._id, user, { new: true });
                if (user.sub && user.email) {
                    await new AuthService().setFbCustomUserClaim(user.sub, user.email);
                }
                // const auth = FirebaseUtility.getApp().auth();
                // if (email) {
                //     const link = await auth.generatePasswordResetLink(email);
                //     await SmsService.sendSms('', link);
                // }
                return vo;
            } else {
                // New user
                user.emp = {} as {
                    [key: string]: AclVo;
                };
                user.emp[acl.orgId] = acl;
                user.created = new Date();
                const nextUserNo = await this._getNextUserNo(acl.orgId);
                user = await this._generateUserCodeAndEmail(acl.orgId, user, nextUserNo);
                user.sub = await this._saveUserAuth(user);
                const vo = await userModel.create(user) as UserVo;
                console.log(nextUserNo);

                await new MetaOrgService().updateCodeNo(acl.orgId, nextUserNo);

                if (user.sub && user.email) {
                    await new AuthService().setFbCustomUserClaim(user.sub, user.email);
                }
                return vo;
            }
        } catch (error) {
            throw error;
        }
    };

    public saveBookingCust = async (user: UserVo, orgId: string): Promise<UserVo | null> => {
        const aclCust = {} as AclCustVo;
        aclCust.enrollAt = new Date();
        aclCust.orgId = orgId;
        aclCust.brId = orgId;
        aclCust.active = true;
        aclCust.role = ROLE.CUST;
        const cust = new UserCustDto(user, aclCust);
        return await this.saveCust(cust);
    }

    public saveCust = async (cust: UserCustDto): Promise<UserVo | null> => {
        try {
            let user = cust.user;
            const acl = cust.acl;
            if (!acl || !acl.orgId) {
                return null;
            }
            if (user._id) {
                if (user.email) {
                    delete user.email;
                }
                const aclList = user.cust;
                if (!aclList || FnUtility.isEmpty(aclList)) {
                    user.cust = {} as {
                        [key: string]: AclCustVo;
                    };
                    user.cust[acl.orgId] = acl;
                } else {
                    aclList[acl.orgId] = acl;
                    user.cust = aclList;
                }
                const vo = await userModel.findByIdAndUpdate(user._id, user);
                if (user.sub && user.email) {
                    await new AuthService().setFbCustomUserClaim(user.sub, user.email);
                }
                return vo;
            } else {
                // New user
                user.cust = {} as {
                    [key: string]: AclCustVo;
                };
                user.cust[acl.orgId] = acl;
                acl.enrollAt = new Date();
                user.created = new Date();
                const nextUserNo = await this._getNextUserNo(acl.orgId);
                user = await this._generateUserCodeAndEmail(acl.orgId, user, nextUserNo);
                user.sub = await this._saveUserAuth(user);
                const vo = await userModel.create(user) as UserVo;
                await new MetaOrgService().updateCodeNo(acl.orgId, nextUserNo);
                if (user.sub && user.email) {
                    await new AuthService().setFbCustomUserClaim(user.sub, user.email);
                }
                return vo;
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

    public getUserById = async (id: string): Promise<UserVo | null> => {
        return await this.user.findById(id) as UserVo;
    }

    public getOrgUserList = async (orgId: string): Promise<UserVo[] | null> => {
        const criteria = {} as any;
        const key = `emp.${orgId}.active`;
        criteria[key] = true;
        return await this.user.find(criteria) as UserVo[];
    }

    public getOrgUserListBySubRole = async (orgId: string, subRole: string): Promise<UserVo[] | null> => {
        const criteria = {} as any;
        const key = `emp.${orgId}`;
        criteria[`${key}.active`] = true;
        criteria[`${key}.role`] = ROLE.EMP;
        criteria[`${key}.subRole`] = subRole;
        return await this.user.find(criteria) as UserVo[];
    }

    public getOrgDeptDocList = async (orgId: string, departmentId: string): Promise<UserVo[] | null> => {
        const userType: UserTypeVo | null = await this.userTypeModel.findOne({ name: APP_CONST.DOCTOR, departmentId });
        const criteria = {} as any;
        const key = `emp.${orgId}`;
        criteria[`${key}.active`] = true;
        criteria[`${key}.role`] = ROLE.EMP;
        criteria[`${key}.departmentId`] = departmentId;
        criteria[`${key}.userTypeId`] = userType?._id.toString();
        return await this.user.find(criteria) as UserVo[];
    }

    public getUserAllAccessList = async (claim: JwtClaimDto): Promise<UserAccessDetailDto> => {
        const dto = {} as UserAccessDetailDto;
        dto.all = [] as Array<UserAccessDto>;
        dto.current = {} as UserAccessDto;
        const orgIdList = claim?.userAccessList?.map((acl: AclVo) => {
            if (acl.orgId != 'CLINIC') {
                return acl.orgId;
            }
        }) as Array<string>;
        if (orgIdList?.length > 0) {
            const orgList = await new OrgService().getOrgListByOrgIds(orgIdList);
            const mapOrgListByOrgId = {} as { [key: string]: OrgVo };
            orgList?.forEach((org: OrgVo) => {
                mapOrgListByOrgId[org._id] = org;
            });
            claim?.userAccessList?.forEach((acl: AclVo) => {
                dto.all.push(this._getUserAccessDto(acl, mapOrgListByOrgId));
            });
            dto.current = this._getUserAccessDto(claim.userAccess, mapOrgListByOrgId)
        }
        return dto;
    }


    public saveUserAccount = async (userAccount: UserAccountVo): Promise<UserAccountVo | null> => {
        try {
            userAccount.income = await this._calculateTotalIncome(userAccount.income as UserIncomeVo);
            if (userAccount._id) {
                return await this.userAccount.findByIdAndUpdate(userAccount._id, userAccount);
            } else {
                const userAccountExist = await this.userAccount.exists({ userId: userAccount.userId });
                if (userAccountExist) {
                    return null;
                }
                return await userAccountModel.create(userAccount);
            }
        } catch (error) {
            throw error;
        }
    };

    public getUserAccountDetail = async (userId: string): Promise<UserAccountVo | null> => {
        return await this.userAccount.findOne({ userId: userId }) as UserAccountVo;
    }

    public updateUserImgPath = async (uploadDto: AssetUploadDto, path: string): Promise<void> => { 
        const condition = {} as any;
        switch (uploadDto.assetIdentity) {
            case AssetPathUtility.ASSET_IDENTITY.EMP_PHOTO:
                condition.img = path;
                break;
            case AssetPathUtility.ASSET_IDENTITY.EMP_ID_PROOF:
                condition.imgIdProof = path;
                break;
            default:
                break; 
        }
        await this.user.findByIdAndUpdate(uploadDto.assetId, { $set: condition }, { new: true });
    };

    public getUserByEmpCode = async (empCode: string): Promise<UserVo | null> => {
        return await this.user.findOne({ code: empCode }) as UserVo;
    }

    public sendOtp = async (empCode: string): Promise<boolean> => { 
        const user = await this.getUserByEmpCode(empCode);
        if (!user || !user?.cell) {
            return false;
        }
        return await new UserOtpService().addUserOtp(user);
    }

    public getPasswordResetLink = async (empCode: string, otp: string): Promise<string | null> => {
        const otpValid = await new UserOtpService().isValidUserOtp(empCode, otp);
        if (otpValid === true) {
            const user = await this.getUserByEmpCode(empCode);
            const auth = FirebaseUtility.getApp().auth();
            return await auth.generatePasswordResetLink(user?.email ?? '');
            return '';
        } else {
            return null;
        }
    }

    /* ************************************* Private Methods ******************************************** */
    private _saveUserAuth = async (userVo: UserVo): Promise<string> => {
        const auth = FirebaseUtility.getApp().auth();
        let user = {
            email: userVo.email?.toLocaleLowerCase()?.trim(),
            password: userVo.cell.trim()
        } as any;
        const password = user.password;
        user = await auth.createUser(user);
        await SmsService.sendCredential(userVo.cell, userVo.nameF ?? '', userVo.code, password);
        return user.uid;
    }

    private _getUserAccessDto(acl: AclVo, mapOrgListByOrgId: { [key: string]: OrgVo }): UserAccessDto {
        const userAccessDto = {} as UserAccessDto;
        userAccessDto.active = acl.active;
        userAccessDto.brId = acl.brId;
        userAccessDto.orgId = acl.orgId;
        userAccessDto.subRole = acl.subRole;
        userAccessDto.role = acl.role;
        if (acl.orgId && acl.role != ROLE.SUPER_ADMIN) {
            userAccessDto.org = mapOrgListByOrgId[acl.orgId];
        }
        return userAccessDto;
    }

    private _calculateTotalIncome(userIncome: UserIncomeVo): UserIncomeVo {
        userIncome.total = userIncome?.basicSalary + userIncome?.da + userIncome?.hra + userIncome?.others;
        return userIncome;
    }

    private _getNextUserNo = async (orgId: string): Promise<OrgCodeNoDto> => {
        const nextUserNo = {} as OrgCodeNoDto;
        const lastUserOrder = await new MetaOrgService().getLastCodeNo(orgId);
        nextUserNo.userNo = lastUserOrder.userNo + 1;
        return nextUserNo;
    }

    private _getNewUserCode = async (nextUserNo: Number, codeSuffix: string) => {
        const userNo = String(nextUserNo).padStart(5, '0');
        const depPrefix = PREFIX.USER
        return depPrefix.concat(codeSuffix).concat(userNo);
    }

    private _generateUserEmail = async (code: string) => {
        const emailSuffix = SUFFIX.EMAIL;
        return code.concat(emailSuffix);
    }

    private _generateUserCodeAndEmail = async (orgId: string, user: UserVo, nextUserNo: OrgCodeNoDto) => {
        const orgDetails = await new OrgService().getOrgById(orgId);
        user.code = await this._getNewUserCode(nextUserNo.userNo, orgDetails?.codeSuffix as string)
        user.email = await this._generateUserEmail(user.code);
        return user;
    }
}

