import { ItemDetailDto, ItemPopulateVo, ItemVo, UserVo } from "aayam-clinic-core";
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
          serviceItemVo,
          { new: true }
        );
      } else {
        return await this.serviceItem.create(serviceItemVo);
      }
    } catch (error) {
      throw error;
    }
  };

  public getListByOrgId = async (orgId: string): Promise<Array<ItemDetailDto> | null> => {
    const items = (await this.serviceItem.find({ orgId }).populate("user")) as Array<ItemPopulateVo>;
    const list = items?.map((item: ItemPopulateVo) => {
      const record = JSON.parse(JSON.stringify(item));
      const user = item.user as UserVo;
      delete record.user;
      const dto = {} as ItemDetailDto;
      dto.user = user;
      dto.item = record;
      console.log('xx xx ', dto);
      return dto;
    }) as Array<ItemDetailDto>;
    return list;
  };

  /* ************************************* Private Methods ******************************************** */
}
