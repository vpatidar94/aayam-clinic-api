import {
    AclVo,
    FnUtility,
    JwtClaimDto,
    ROLE,
    StringUtility,
    UserAccessDto
} from "aayam-clinic-core";
import { FirebaseUtility } from "../../@shared/utility/firebase.utiliy";
import { OrgService } from "./org.service";
import { UserService } from "./user.service";

export class AuthService {

    public orgService = new OrgService();
    public userService = new UserService();


    /* ************************************* Public Methods ******************************************** */
    public authenticate = async (email: string, password: string): Promise<string | null> => {
        try {
            if (!FnUtility.isEmpty(email) && !FnUtility.isEmpty(password)) {
                // const auth: UserAuthVo | null = await this.userAuth.findOne({ email });
                const auth = FirebaseUtility.getApp().auth();
                const userExist = await this.userService.userExistWithEmail(email);
                const userFb = await auth.getUserByEmail(email);
                if (userExist && userFb?.uid) {
                    const claim = await this.getJwtClaimDto(userFb?.uid, email);
                    await auth.setCustomUserClaims(userFb.uid, claim);
                    return 'xx';
                    // if (!FnUtility.isEmpty(token)) {
                    //     return token;
                    // } else {
                    //     return null;
                    // }
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    };

    public setFbCustomUserClaim = async (uid: string, email: string): Promise<void> => {
        const auth = FirebaseUtility.getApp().auth();
        const claim = await this.getJwtClaimDto(uid, email);
        await auth.setCustomUserClaims(uid, claim);
    }

    /* ************************************* Private Methods ******************************************** */
    private getJwtClaimDto = async (userFbId: string, email: string): Promise<JwtClaimDto> => {
        const claim = {} as JwtClaimDto;
        const parentOrg = 'CLINIC';
        const user = await this.userService.getUserByEmail(email);
        claim.cuid = userFbId;
        if (user) {
            claim.name = StringUtility.getFullName(user);
            claim.userId = user._id?.toString();
            claim.userEmail = user.email ?? '';
            claim.userCell = user.cell;
        }
        let orgIds: Array<string> = [];
        if (user?.emp) {
            const orgIdList = Object.keys(user.emp);

            if (orgIdList?.length > 0) {
                orgIds = orgIdList?.filter(orgId => orgId != parentOrg);
            }

            const accessList: Array<AclVo> = Object.values(user?.emp);

            let superAdminAccess: AclVo = {} as AclVo;
            const adminAccessList: Array<AclVo> = [] as Array<AclVo>;
            const otherAccessList: Array<AclVo> = [] as Array<AclVo>;

            if (accessList?.length > 0) {
                accessList.forEach((acl: AclVo) => {
                    if (acl.role == ROLE.SUPER_ADMIN) {
                        superAdminAccess = acl;
                    } else if (acl.role == ROLE.ADMIN) {
                        if (acl.orgId) {
                            adminAccessList.push(acl);
                        }
                    } else {
                        if (acl.orgId) {
                            otherAccessList.push(acl);
                        }
                    }
                });
            }
            const userAccessList = [] as Array<AclVo>;
            if (superAdminAccess && superAdminAccess.orgId) {
                userAccessList.push(superAdminAccess);
            }
            if (adminAccessList && adminAccessList.length > 0) {
                userAccessList.push(...adminAccessList);
            }
            if (otherAccessList && otherAccessList.length > 0) {
                userAccessList.push(...otherAccessList);
            }
            claim.userAccess = userAccessList[0];
        }
        return claim;
    }

    private getUserAccessDto(acl: AclVo, orgName: string) {
        return {
            orgId: acl.orgId,
            brId: acl.brId,
            role: acl.role,
            subRole: acl.subRole,
            orgName: orgName
        } as UserAccessDto;
    }
}

