import {
    AclCustVo,
    AclVo,
    FnUtility,
    JwtClaimDto,
    OrgVo,
    ROLE,
    UserAccessDetailDto,
    UserAccessDto,
    UserAccountVo,
    UserCustDto,
    UserEmpDto,
    UserVo
} from "aayam-clinic-core";
import userModel from '../model/users.model';
import { FirebaseUtility } from "../../@shared/utility/firebase.utiliy";
import { AuthService } from "./auth.service";
import { OrgService } from "./org.service";
import userAccountModel from "../../@shared/model/users-account.model";

export class UserService {
    public user = userModel;
    public userAccount = userAccountModel;

    /* ************************************* Public Methods ******************************************** */
    public saveUser = async (user: UserVo): Promise<UserVo | null> => {
        try {
            if (user._id) {
                if (user.email) {
                    delete user.email;
                }
                const vo = await userModel.findByIdAndUpdate(user._id, user);
                if (user.sub && user.email) {
                    await new AuthService().setFbCustomUserClaim(user.sub, user.email,);
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

    public saveStaff = async (staff: UserEmpDto): Promise<UserVo | null> => {
        try {
            const user = staff.user;
            const acl = staff.acl;
            if (!acl || !acl.orgId) {
                return null;
            }
            if (user._id) {
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
                const vo = await userModel.findByIdAndUpdate(user._id, user);
                if (user.sub && user.email) {
                    await new AuthService().setFbCustomUserClaim(user.sub, user.email);
                }
                return vo;
            } else {
                // New user
                user.emp = {} as {
                    [key: string]: AclVo;
                };
                user.emp[acl.orgId] = acl;
                user.created = new Date();
                user.email = user.email?.toLocaleLowerCase()?.trim();
                user.sub = await this._saveUserAuth(user);
                const vo = await userModel.create(user) as UserVo;
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
            const user = cust.user;
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
                user.email = user.email?.toLocaleLowerCase()?.trim();
                user.sub = await this._saveUserAuth(user);
                const vo = await userModel.create(user) as UserVo;
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
            if (userAccount._id) {
                return await this.userAccount.findByIdAndUpdate(userAccount._id, userAccount);
            } else {
                const userAccountExist = await this.userAccount.exists({ uid: userAccount.uid});
                if (userAccountExist) {
                    return null;
                }
                return await userAccountModel.create(userAccount);
            }
        } catch (error) {
            throw error;
        }
    };
    
    public getUserAccountDetail = async (uid: string): Promise<UserAccountVo | null> => {
        return await this.userAccount.findOne({uid : uid}) as UserAccountVo;
    }
    /* ************************************* Private Methods ******************************************** */
    private _saveUserAuth = async (userVo: UserVo): Promise<string> => {
        const auth = FirebaseUtility.getApp().auth();
        let user = {
            email: userVo.email?.toLocaleLowerCase()?.trim(),
            password: userVo.cell.trim()
        } as any;
        user = await auth.createUser(user);
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
}

