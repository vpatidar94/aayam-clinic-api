import { Route } from '../../@shared/interface/route.interface';
declare class IndexApi implements Route {
    path: string;
    router: import("express-serve-static-core").Router;
    constructor();
    private initializeRoutes;
}
export default IndexApi;
