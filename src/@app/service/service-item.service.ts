import { ItemDetailDto, ItemPopulateVo, ItemVo, OrgCodeNoDto, ServiceTypeVo, UserVo, SERVICE_TYPE_STATUS } from "aayam-clinic-core";
import serviceItemModel from "../model/service-item.model";
import serviceTypeModel from "../../@app/model/service-type.model";
import { MetaOrgService } from "../../@shared/service/meta-org.service";
import { OrgService } from "../../@shared/service/org.service";
import { PREFIX } from "../../@shared/const/prefix-suffix";

export class ServiceItemService {
  public serviceItem = serviceItemModel;
  public serviceType = serviceTypeModel;

  /* ************************************* Public Methods ******************************************** */
  public addUpdateServiceItem = async (
    serviceItemVo: ItemVo
  ): Promise<ItemVo | null> => {
    try {
      if (serviceItemVo.feeType.isPercent) {
        serviceItemVo.doctorFee = (serviceItemVo.fee / 100) * serviceItemVo.feeType.value;
      } else {
        serviceItemVo.doctorFee = serviceItemVo.feeType.value;
      }
      serviceItemVo.orgFee = serviceItemVo.fee - serviceItemVo.doctorFee;
      if (serviceItemVo._id) {
        return await serviceItemModel.findByIdAndUpdate(
          serviceItemVo._id,
          serviceItemVo,
          { new: true }
        );
      } else {
        const nextServiceItemNo = await this._getNextServiceItemNo(serviceItemVo);
        const orgDetails = await new OrgService().getOrgById(serviceItemVo.orgId);
        const serviceItemCode = await this._getNewServiceItemCode(nextServiceItemNo.serviceItemNo, orgDetails?.codeSuffix as string);
        serviceItemVo.code = serviceItemCode;
        await new MetaOrgService().updateCodeNo(serviceItemVo.orgId, nextServiceItemNo);
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
      return dto;
    }) as Array<ItemDetailDto>;
    return list;
  };


  public addUpdateServiceType = async (serviceType: ServiceTypeVo): Promise<ServiceTypeVo | null> => {
    try {
      if (serviceType._id) {
        return await serviceTypeModel.findByIdAndUpdate(serviceType._id, serviceType);
      } else {
        const serviceTypeExist = await this.serviceType.exists({ name: serviceType.name, orgId: serviceType.orgId, brId: serviceType.brId, departmentId: serviceType.departmentId });
        if (serviceTypeExist) {
          return null;
        }
        const nextServiceTypeNo = await this._getNextServiceTypeNo(serviceType);
        const orgDetails = await new OrgService().getOrgById(serviceType.orgId);
        const servcieTypeCode = await this._getNewServiceTypeCode(nextServiceTypeNo.serviceTypeNo, orgDetails?.codeSuffix as string);
        serviceType.code = servcieTypeCode;
        await new MetaOrgService().updateCodeNo(serviceType.orgId, nextServiceTypeNo);
        serviceType.del = false;
        serviceType.status = SERVICE_TYPE_STATUS.ACTIVE;
        if (serviceType?.doctorAssociated !== true) {
          serviceType.doctorAssociated = false;
        }
        return await serviceTypeModel.create(serviceType);
      }
    } catch (error) {
      throw error;
    }
  };

  public getServiceTypeListByOrgId = async (orgId: string): Promise<Array<ServiceTypeVo> | null> => {
    return (await this.serviceType.find({ orgId })) as Array<ServiceTypeVo>;
  };

  public getServiceTypeById = async (serviceTypeId: string): Promise<ServiceTypeVo | null> => {
    return await this.serviceType.findById(serviceTypeId) as ServiceTypeVo;
  }

  /* ************************************* Private Methods ******************************************** */
  private _getNextServiceTypeNo = async (serviceType: ServiceTypeVo): Promise<OrgCodeNoDto> => {
    const nextServiceTypeNo = {} as OrgCodeNoDto;
    const lastServiceTypeOrder = await new MetaOrgService().getLastCodeNo(serviceType.orgId);
    nextServiceTypeNo.serviceTypeNo = lastServiceTypeOrder.serviceTypeNo + 1;
    return nextServiceTypeNo;
  }

  private _getNewServiceTypeCode = async (nextServiceTypeNo: number, codeSuffix: string) => {
    const serviceTypeNo = String(nextServiceTypeNo).padStart(5, '0');
    const serviceTypePrefix = PREFIX.SERVICE_TYPE
    return serviceTypePrefix.concat(codeSuffix).concat(serviceTypeNo);
  }

  private _getNextServiceItemNo = async (serviceItem: ItemVo): Promise<OrgCodeNoDto> => {
    const nextServiceItemNo = {} as OrgCodeNoDto;
    const lastServiceItemOrder = await new MetaOrgService().getLastCodeNo(serviceItem.orgId);
    nextServiceItemNo.serviceItemNo = lastServiceItemOrder.serviceItemNo + 1;
    return nextServiceItemNo;
  }

  private _getNewServiceItemCode = async (nextServiceItemNo: number, codeSuffix: string) => {
    const serviceItemNo = String(nextServiceItemNo).padStart(5, '0');
    const serviceItemPrefix = PREFIX.SERVICE_ITEM
    return serviceItemPrefix.concat(codeSuffix).concat(serviceItemNo);
  }
}
