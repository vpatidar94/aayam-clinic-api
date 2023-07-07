"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const aayam_clinic_core_1 = require("aayam-clinic-core");
const firebase_utiliy_1 = require("../../@shared/utility/firebase.utiliy");
const org_service_1 = require("./org.service");
const user_service_1 = require("./user.service");
class AuthService {
    constructor() {
        this.orgService = new org_service_1.OrgService();
        this.userService = new user_service_1.UserService();
        /* ************************************* Public Methods ******************************************** */
        this.authenticate = async (email, password) => {
            try {
                if (!aayam_clinic_core_1.FnUtility.isEmpty(email) && !aayam_clinic_core_1.FnUtility.isEmpty(password)) {
                    // const auth: UserAuthVo | null = await this.userAuth.findOne({ email });
                    const auth = firebase_utiliy_1.FirebaseUtility.getApp().auth();
                    const userExist = await this.userService.userExistWithEmail(email);
                    const userFb = await auth.getUserByEmail(email);
                    if (userExist && (userFb === null || userFb === void 0 ? void 0 : userFb.uid)) {
                        const claim = await this.getJwtClaimDto(userFb === null || userFb === void 0 ? void 0 : userFb.uid, email);
                        await auth.setCustomUserClaims(userFb.uid, claim);
                        return 'xx';
                        // if (!FnUtility.isEmpty(token)) {
                        //     return token;
                        // } else {
                        //     return null;
                        // }
                    }
                    else {
                        return null;
                    }
                }
                else {
                    return null;
                }
            }
            catch (error) {
                throw error;
            }
        };
        this.setFbCustomUserClaim = async (uid, email) => {
            const auth = firebase_utiliy_1.FirebaseUtility.getApp().auth();
            const claim = await this.getJwtClaimDto(uid, email);
            await auth.setCustomUserClaims(uid, claim);
        };
        /* ************************************* Private Methods ******************************************** */
        this.getJwtClaimDto = async (userFbId, email) => {
            var _a, _b;
            const claim = {};
            const parentOrg = 'CLINIC';
            const user = await this.userService.getUserByEmail(email);
            claim.cuid = userFbId;
            if (user) {
                claim.name = aayam_clinic_core_1.StringUtility.getFullName(user);
                claim.userId = (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString();
                claim.userEmail = (_b = user.email) !== null && _b !== void 0 ? _b : '';
                claim.userCell = user.cell;
            }
            let orgIds = [];
            if (user === null || user === void 0 ? void 0 : user.emp) {
                const orgIdList = Object.keys(user.emp);
                if ((orgIdList === null || orgIdList === void 0 ? void 0 : orgIdList.length) > 0) {
                    orgIds = orgIdList === null || orgIdList === void 0 ? void 0 : orgIdList.filter(orgId => orgId != parentOrg);
                }
                const accessList = Object.values(user === null || user === void 0 ? void 0 : user.emp);
                let superAdminAccess = {};
                const adminAccessList = [];
                const otherAccessList = [];
                if ((accessList === null || accessList === void 0 ? void 0 : accessList.length) > 0) {
                    accessList.forEach((acl) => {
                        if (acl.role == aayam_clinic_core_1.ROLE.SUPER_ADMIN) {
                            superAdminAccess = acl;
                        }
                        else if (acl.role == aayam_clinic_core_1.ROLE.ADMIN) {
                            if (acl.orgId) {
                                adminAccessList.push(acl);
                            }
                        }
                        else {
                            if (acl.orgId) {
                                otherAccessList.push(acl);
                            }
                        }
                    });
                }
                const userAccessList = [];
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
        };
    }
    getUserAccessDto(acl, orgName) {
        return {
            orgId: acl.orgId,
            brId: acl.brId,
            role: acl.role,
            subRole: acl.subRole,
            orgName: orgName
        };
    }
}
exports.AuthService = AuthService;
