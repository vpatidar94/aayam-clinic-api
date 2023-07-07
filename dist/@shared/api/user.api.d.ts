import { Route } from '../interface/route.interface';
declare class UserApi implements Route {
    path: string;
    router: import("express-serve-static-core").Router;
    private userService;
    constructor();
    private initializeRoutes;
}
export default UserApi;
