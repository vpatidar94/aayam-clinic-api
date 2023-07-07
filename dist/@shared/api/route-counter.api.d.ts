import { Route } from '../interface/route.interface';
declare class RouteCounterApi implements Route {
    path: string;
    router: import("express-serve-static-core").Router;
    private service;
    constructor();
    private initializeRoutes;
}
export default RouteCounterApi;
