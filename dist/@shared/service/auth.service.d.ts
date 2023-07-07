import { OrgService } from "./org.service";
import { UserService } from "./user.service";
export declare class AuthService {
    orgService: OrgService;
    userService: UserService;
    authenticate: (email: string, password: string) => Promise<string | null>;
    setFbCustomUserClaim: (uid: string, email: string) => Promise<void>;
    private getJwtClaimDto;
    private getUserAccessDto;
}
