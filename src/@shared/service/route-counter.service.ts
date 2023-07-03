import { RouteCounterVo } from "aayam-clinic-core";
import routeCounterModel from "../model/route-counter.model";

export class RouteCounterService {
    public model = routeCounterModel;

    /* ************************************* Public Methods ******************************************** */
    public addUpdateRouteCounter = async (vo: RouteCounterVo): Promise<RouteCounterVo | null> => {
        try {
            if (vo._id) {
                return await this.model.findByIdAndUpdate(vo._id, vo);
            } else {
                const exist = await this.model.exists({ name: vo.name, type: vo.type });
                if (exist) {
                    return null;
                }
                return await this.model.create(vo);
            }
        } catch (error) {
            throw error;
        }
    };

    public getRouteCounterList = async (type: string = ''): Promise<RouteCounterVo[]> => {
        try {
            const criteria = type ? { type } : {};
            return await this.model.find(criteria) as RouteCounterVo[];
        } catch (e) {
            throw e;
        }
    }

    /* ************************************* Private Methods ******************************************** */
}