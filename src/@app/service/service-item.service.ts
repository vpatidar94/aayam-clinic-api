import { ItemVo, UserVo } from "aayam-clinic-core";
import serviceItemModel from "../model/service-item.model";

export class ServiceItemService {
  public serviceItem = serviceItemModel;

  /* ************************************* Public Methods ******************************************** */
  public addUpdateServiceItem = async (
    serviceItemVo: ItemVo
  ): Promise<ItemVo | null> => {
    try {
      if (serviceItemVo._id) {
        return await serviceItemModel.findByIdAndUpdate(
          serviceItemVo._id,
          serviceItemVo
        );
      } else {
        return await this.serviceItem.create(serviceItemVo);
      }
    } catch (error) {
      throw error;
    }
  };

  public getListByOrgId = async (
    orgId: string
  ): Promise<Array<ItemVo> | null> => {
    return (await this.serviceItem
      .find({ org: orgId })
      .populate("user")) as Array<ItemVo>;
  };

  /* ************************************* Private Methods ******************************************** */
}
