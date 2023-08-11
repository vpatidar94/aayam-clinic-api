import orgModel from "../../@shared/model/org.model";
import departmentModel from "../../@shared/model/department.model";
import userTypeModel from "../../@shared/model/user-type.model";
import {
    OrgVo, 
    DepartmentVo,
    OrgOrderNoDto,
    DEPT_STATUS,
    UserTypeVo,
    USER_TYPE_STATUS,
    UserTypePopulateVo,
    UserTypeDetailDto
} from "aayam-clinic-core";
import { PREFIX } from '../const/prefix';
import { MetaOrgService } from "../../@shared/service/meta-org.service";

export class OrgService {
    public org = orgModel;
    public department = departmentModel;
    public userType = userTypeModel;

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
                const departmentCode = await this._getNewDepartmentCode(nextDepartmentNo.departmentNo, orgDetails?.codeSuffix as string);
                department.code = departmentCode;
                await new MetaOrgService().updateOrderNo(department.orgId, nextDepartmentNo.no, nextDepartmentNo.patientNo, nextDepartmentNo.departmentNo, nextDepartmentNo.userTypeNo);
                department.del = false;
                department.status = DEPT_STATUS.ACTIVE;
                return await departmentModel.create(department);
            }
        } catch (error) {
            throw error;
        }
    };

    public getDepartmentById = async (depId: string): Promise<DepartmentVo | null> => {
        return await this.department.findById(depId) as DepartmentVo;
    }

    public getOrgDepartmentList = async (orgId: string): Promise<DepartmentVo[] | null> => {
        const criteria = {} as any;
        criteria['del'] = false;
        return await this.department.find(criteria) as DepartmentVo[];
    }

    public addUpdateUserType = async (userType: UserTypeVo): Promise<DepartmentVo | null> => {
        try {
            if (userType._id) {
                return await userTypeModel.findByIdAndUpdate(userType._id, userType);
            } else {
                const userTypeExist = await this.userType.exists({ name: userType.name , orgId : userType.orgId, brId : userType.brId, departmentId : userType.departmentId });
                if (userTypeExist) {
                    return null;
                }
                const nextUserTypetNo = await this._getNextUserTypeNo(userType);
                const orgDetails =  await this.getOrgById(userType.orgId);
                const userTypeCode = await this._getNewUserTypeCode(nextUserTypetNo.userTypeNo, orgDetails?.codeSuffix as string,);
                userType.code = userTypeCode;
                await new MetaOrgService().updateOrderNo(userType.orgId, nextUserTypetNo.no, nextUserTypetNo.patientNo, nextUserTypetNo.departmentNo, nextUserTypetNo.userTypeNo);
                userType.del = false;
                userType.status = USER_TYPE_STATUS.ACTIVE;
                return await userTypeModel.create(userType);
            }
        } catch (error) {
            throw error;
        }
    };

    public getOrgUserTypeList = async (orgId: string): Promise<UserTypeDetailDto[]> => {
        const criteria = {} as any;
        criteria['orgId'] = orgId;
        criteria['del'] = false;
        const populatedData = (await this.userType.find(criteria).populate("Department")) as Array<UserTypePopulateVo>;
        const list = populatedData?.map((item: UserTypePopulateVo) => {
            const record = JSON.parse(JSON.stringify(item));
            const department = item.Department as DepartmentVo;
            const dto = {} as UserTypeDetailDto;
            dto.departmentName = department.name;
            delete record.Department;
            dto.userType = record as UserTypeVo;
            return dto;
          }) as Array<UserTypeDetailDto>;
          
          return list;
    }

    public getUserTypeById = async (userTypeId: string): Promise<UserTypeVo | null> => {
        return await this.userType.findById(userTypeId) as UserTypeVo;
    }

    
    /* ************************************* Private Methods ******************************************** */
    private _getNextDepartmentNo = async (department: DepartmentVo): Promise<OrgOrderNoDto> => {
        const nextDepartmentNo = {} as OrgOrderNoDto;
        const lastDepartmentOrder = await new MetaOrgService().getLastOrderNo(department.orgId);
        nextDepartmentNo.departmentNo = lastDepartmentOrder.departmentNo + 1;
        return nextDepartmentNo;
    }

    private _getNewDepartmentCode = async (nextDepartmentNo:Number, codeSuffix:string) => {
        const departmentNo = String(nextDepartmentNo).padStart(5, '0');
        const depPrefix = PREFIX.DEPARTMENT
        return depPrefix.concat(codeSuffix).concat(departmentNo);
    }

    private _getNewOrgSuffix = async (orgName:String) => {
        return orgName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '').toUpperCase().substring(0, 3);
    }

    private _getNextUserTypeNo = async (userType: UserTypeVo): Promise<OrgOrderNoDto> => {
        const nextUserTypeNo = {} as OrgOrderNoDto;
        const lastUserTypeOrder = await new MetaOrgService().getLastOrderNo(userType.orgId);
        nextUserTypeNo.userTypeNo = lastUserTypeOrder.userTypeNo + 1;
        return nextUserTypeNo;
    }

    private _getNewUserTypeCode = async (nextUserTypeNo:Number, codeSuffix:string) => {
        const userTypeNo = String(nextUserTypeNo).padStart(5, '0');
        const userTypePrefix = PREFIX.USER_TYPE
        return userTypePrefix.concat(codeSuffix).concat(userTypeNo);
    }

}

