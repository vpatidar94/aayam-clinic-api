import { AuthService } from '../../@shared/service/auth.service';
import { UserAuthDto } from 'aayam-clinic-core';
import { Request, Response, Router } from 'express';
import { URL } from '../const/url';
import { Route } from '../interface/route.interface';
import { ResponseUtility } from '../utility/response.utility';

class AuthApi implements Route {
    public path = URL.MJR_AUTH;
    public router = Router();

    private authService = new AuthService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // /api/core/v1/user/app-update
        this.router.post(`${this.path}${URL.LOGIN}`, async (req: Request, res: Response) => {
            try {
                const body = await req.body as UserAuthDto;
                const user = await this.authService.authenticate(body.email, body.password);
                if (!user) {
                    ResponseUtility.sendFailResponse(res, null, 'User already exists');
                    return;
                }
                ResponseUtility.sendSuccess(res, user);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });
    }
}
export default AuthApi;
