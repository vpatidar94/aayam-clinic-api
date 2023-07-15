import { JwtClaimDto, ROLE } from "aayam-clinic-core";

export class AuthUtility {

  public static hasOrgAccess(claim: JwtClaimDto, orgId: string | null | undefined): boolean {
    const userAccess = claim?.userAccess;
    const role = userAccess.role;
    if (!role || !orgId) {
      return false;
    }
    const addminAllowed = (AuthUtility.hasAdminAccess(role) && userAccess?.orgId === orgId);
    return AuthUtility.hasSuperAdminAccess(role) || addminAllowed;
  }

  public static hasSuperAdminAccess(role: string): boolean {
    return role === ROLE.SUPER_ADMIN;
  }

  public static hasAdminAccess(role: string): boolean {
    return role === ROLE.ADMIN;
  }

  public static isValidUser(userId: string | null | undefined, claim: JwtClaimDto): boolean {
    if (!userId) {
      return false;
    }
    return userId === claim.userId;
  }
}