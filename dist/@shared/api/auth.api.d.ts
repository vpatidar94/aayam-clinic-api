import { Route } from '../interface/route.interface';
declare class AuthApi implements Route {
    path: string;
    router: import("express-serve-static-core").Router;
    private authService;
    constructor();
    private initializeRoutes;
}
export default AuthApi;
