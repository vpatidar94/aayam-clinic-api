import { Route } from '../interface/route.interface';
declare class OrgApi implements Route {
    path: string;
    router: import("express-serve-static-core").Router;
    private orgService;
    constructor();
    private initializeRoutes;
}
export default OrgApi;
