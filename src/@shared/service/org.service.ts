import orgModel from "../../@shared/model/org.model";
import departmentModel from "../../@shared/model/department.model";
import {
    OrgVo, 
    DepartmentVo,
    OrgOrderNoDto
} from "aayam-clinic-core";
import { MetaOrgService } from "../../@shared/service/meta-org.service";

export class OrgService {
    public org = orgModel;
    public department = departmentModel;

    /* ************************************* Public Methods ******************************************** */
    public addUpdateOrg = async (org: OrgVo): Promise<OrgVo | null> => {
        try {
            org.codeSuffix = await this._getNewOrgSuffix(org.name);
            if (org._id) {
                return await orgModel.findByIdAndUpdate(org._id, org);
            } else {
                const orgExist = await this.org.exists({ name: org.name });
                if (orgExist) {
                    return null;
                }
                return await orgModel.create(org);
            }
        } catch (error) {
            throw error;
        }
    };

    public getOrgById = async (orgId: string): Promise<OrgVo | null> => {
        return await this.org.findById(orgId) as OrgVo;
    }

    public getOrgNameByIdList = async (orgIdList: Array<string>): Promise<{ [key: string]: string }> => {
        const nameList = {} as { [key: string]: string };
        const orgList = await orgModel.find({ _id: { $in: orgIdList } }) as Array<OrgVo>;
        if (orgList && orgList.length > 0) {
            orgList?.forEach((org: OrgVo) => {
                nameList[org._id] = org.name ?? '';
            });
        }
        return nameList;
    }

    public getAll = async (): Promise<Array<OrgVo>> => {
        return await orgModel.find() as Array<OrgVo>;
    };

    public getOrgListByOrgIds = async (orgIdList: Array<string>): Promise<Array<OrgVo>> => {
        if (!orgIdList || orgIdList.length <= 0) {
            return [] as Array<OrgVo>;
        }
        const orgList = await orgModel.find({ _id: { $in: orgIdList } }) as Array<OrgVo>;
        return orgList;
    };

    public addUpdateDepartment = async (department: DepartmentVo): Promise<DepartmentVo | null> => {
        try {
            if (department._id) {
                return await departmentModel.findByIdAndUpdate(department._id, department);
            } else {
                const departmentExist = await this.department.exists({ name: department.name , orgId : department.orgId, brId : department.brId });
                if (departmentExist) {
                    return null;
                }
                const nextDepartmentNo = await this._getNextDepartmentNo(department);
                const orgDetails =  await this.getOrgById(department.orgId);
                const departmentCode = await this._getNewDepartmentCode(nextDepartmentNo.departmentNo, orgDetails?.codeSuffix as String);
                department.code = departmentCode;
                console.log(department);
                
                await new MetaOrgService().updateOrderNo(department.orgId, nextDepartmentNo.no, nextDepartmentNo.patientNo, nextDepartmentNo.departmentNo);
                return await departmentModel.create(department);
            }
        } catch (error) {
            throw error;
        }
    };
    
    /* ************************************* Private Methods ******************************************** */
    private _getNextDepartmentNo = async (department: DepartmentVo): Promise<OrgOrderNoDto> => {
        const nextDepartmentNo = {} as OrgOrderNoDto;
        const lastDepartmentOrder = await new MetaOrgService().getLastOrderNo(department.orgId);
        nextDepartmentNo.departmentNo = lastDepartmentOrder.departmentNo + 1;
        return nextDepartmentNo;
    }

    private _getNewDepartmentCode = async (nextDepartmentNo:Number, codeSuffix:String) => {
        const departmentNo = String(nextDepartmentNo).padStart(5, '0');
        return codeSuffix.concat(departmentNo);
    }

    private _getNewOrgSuffix = async (orgName:String) => {
        return orgName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '').toUpperCase().substring(0, 3);
    }

}

