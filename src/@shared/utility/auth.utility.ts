import { JwtClaimDto, ROLE } from "aayam-clinic-core";

export class AuthUtility {

  public static hasOrgAccess(claim: JwtClaimDto, orgId: string | null | undefined): boolean {
    const userAccess = claim?.userAccess;
    const role = userAccess.role;
    if (!role || !orgId) {
      return false;
    }
    const addminAllowed = (AuthUtility.hasAdminAccess(role) && userAccess?.orgId === orgId);
    let hasAccess = AuthUtility.hasSuperAdminAccess(role) || addminAllowed;
    if (!hasAccess) {
      if (claim?.userAccessList?.length > 0) {
        const claimFromList = claim.userAccessList.find(it => it.orgId === orgId);
        if (claimFromList) {
          hasAccess = (AuthUtility.hasAdminAccess(claimFromList.role) && claimFromList?.orgId === orgId);
        }
      }
    }
    return hasAccess;
  }

  public static hasOrgEmpAccess(claim: JwtClaimDto, orgId: string | null | undefined): boolean {
    const userAccess = claim?.userAccess;
    const role = userAccess.role;
    if (!role || !orgId) {
      return false;
    }
    const addminAllowed = ((AuthUtility.hasAdminAccess(role) || AuthUtility.hasEmpAccess(role)) && userAccess?.orgId === orgId);
    let hasAccess = AuthUtility.hasSuperAdminAccess(role) || addminAllowed;
    if (!hasAccess) {
      if (claim?.userAccessList?.length > 0) {
        const claimFromList = claim.userAccessList.find(it => it.orgId === orgId);
        if (claimFromList) {
          hasAccess = ((AuthUtility.hasAdminAccess(role) || AuthUtility.hasEmpAccess(role)) && claimFromList?.orgId === orgId);
        }
      }
    }
    return hasAccess;
  }

  public static hasSuperAdminAccess(role: string | null | undefined): boolean {
    return role === ROLE.SUPER_ADMIN;
  }

  public static hasAdminAccess(role: string | null | undefined): boolean {
    return role === ROLE.ADMIN;
  }

  public static hasEmpAccess(role: string | null | undefined): boolean {
    return role === ROLE.ADMIN;
  }

  public static isValidUser(userId: string | null | undefined, claim: JwtClaimDto): boolean {
    if (!userId) {
      return false;
    }
    return userId === claim.userId;
  }
}