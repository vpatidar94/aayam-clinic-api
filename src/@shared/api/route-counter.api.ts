import {URL} from '../const/url';
import {ResponseUtility} from '../utility/response.utility';
import {Request, Response, Router} from 'express';
import {Route} from '../interface/route.interface';
import authMiddleware from "../middleware/auth.middleware";
import {RouteCounterService} from "../service/route-counter.service";
import { RouteCounterVo } from 'aayam-clinic-core';

class RouteCounterApi implements Route {
    public path = URL.MJR_ROUTE_COUNTER;
    public router = Router();

    private service = new RouteCounterService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // /api/core/v1/route-counter/app-update
        this.router.post(`${this.path}${URL.ADD_UPDATE}`, authMiddleware, async (req: Request, res: Response) => {
            try {
                const vo = await this.service.addUpdateRouteCounter(req.body as RouteCounterVo);
                if (!vo) {
                    ResponseUtility.sendFailResponse(res, null, 'Route/Counter already exists');
                    return;
                }
                ResponseUtility.sendSuccess(res, vo);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });

        // /api/core/v1/route-counter/list
        this.router.get(`${this.path}${URL.LIST}`, authMiddleware, async (req: Request, res: Response) => {
            try {
                const list = await this.service.getRouteCounterList(req.query.type as string);
                if (!list) {
                    ResponseUtility.sendFailResponse(res, null);
                    return;
                }
                ResponseUtility.sendSuccess(res, list);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });
    }
}

export default RouteCounterApi;
