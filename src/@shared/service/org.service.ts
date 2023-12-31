import orgModel from "../../@shared/model/org.model";
import departmentModel from "../../@shared/model/department.model";
import userTypeModel from "../../@shared/model/user-type.model";
import {
    OrgVo,
    DepartmentVo,
    OrgCodeNoDto,
    DEPT_STATUS,
    UserTypeVo,
    USER_TYPE_STATUS,
    UserTypePopulateVo,
    UserTypeDetailDto,
    AssetUploadDto,
    AssetPathUtility,
    UserVo,
    AclVo,
    ROLE,
    UserEmpDto
} from "aayam-clinic-core";
import { PREFIX } from '../const/prefix-suffix';
import { MetaOrgService } from "../../@shared/service/meta-org.service";
import { UserService } from "./user.service";
import { APP_CONST } from "../../@shared/const/app.const";

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
                const vo = await orgModel.create(org);
                await this._addAdmin(vo);
                return vo;
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
            department.name = department.name?.toUpperCase();
            if (department._id) {
                return await departmentModel.findByIdAndUpdate(department._id, department);
            } else {
                const departmentExist = await this.department.exists({ name: department.name, orgId: department.orgId, brId: department.brId });
                if (departmentExist) {
                    return null;
                }
                const nextDepartmentNo = await this._getNextDepartmentNo(department);
                const orgDetails = await this.getOrgById(department.orgId);
                const departmentCode = await this._getNewDepartmentCode(nextDepartmentNo.departmentNo, orgDetails?.codeSuffix as string);
                department.code = departmentCode;
                await new MetaOrgService().updateCodeNo(department.orgId, nextDepartmentNo);
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

    public getOrgDepartmentList = async (orgId: string | null, type: string | null): Promise<DepartmentVo[] | null> => {
        const criteria = {} as any;
        criteria['del'] = false;
        if (orgId) {
            criteria['orgId'] = orgId;
        }
        if (type) {
            criteria['type'] = type;
        }
        return await this.department.find(criteria) as DepartmentVo[];
    }

    public addUpdateUserType = async (userType: UserTypeVo): Promise<UserTypeVo | null> => {
        try {
            userType.name = userType.name?.toUpperCase();
            if (userType._id) {
                return await userTypeModel.findByIdAndUpdate(userType._id, userType);
            } else {
                const userTypeExist = await this.userType.exists({ name: userType.name, orgId: userType.orgId, brId: userType.brId, departmentId: userType.departmentId });
                if (userTypeExist) {
                    return null;
                }
                const nextUserTypeNo = await this._getNextUserTypeNo(userType);
                const orgDetails = await this.getOrgById(userType.orgId);
                const userTypeCode = await this._getNewUserTypeCode(nextUserTypeNo.userTypeNo, orgDetails?.codeSuffix as string,);
                userType.code = userTypeCode;
                await new MetaOrgService().updateCodeNo(userType.orgId, nextUserTypeNo);
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

    public updateOrgImgPath = async (uploadDto: AssetUploadDto, path: string): Promise<void> => {
        const condition = {} as any;
        switch (uploadDto.assetIdentity) {
            case AssetPathUtility.ASSET_IDENTITY.ORG_LOGO:
                condition.logo = path;
                break;
            case AssetPathUtility.ASSET_IDENTITY.ORG_COVER:
                condition.cover = path;
                break;
            default:
                break;
        }
        await this.org.findByIdAndUpdate(uploadDto.assetId, { $set: condition }, { new: true });
    };

    public getPathalogyDeptId = async (orgId: string): Promise<string> => { 
        const dept = await this.department.findOne({orgId, name: APP_CONST.PATHOLOGY}) as DepartmentVo;
        return dept?._id?.toString();
    }


    /* ************************************* Private Methods ******************************************** */
    private _getNextDepartmentNo = async (department: DepartmentVo): Promise<OrgCodeNoDto> => {
        const nextDepartmentNo = {} as OrgCodeNoDto;
        const lastDepartmentOrder = await new MetaOrgService().getLastCodeNo(department.orgId);
        nextDepartmentNo.departmentNo = lastDepartmentOrder.departmentNo + 1;
        return nextDepartmentNo;
    }

    private _getNewDepartmentCode = async (nextDepartmentNo: Number, codeSuffix: string) => {
        const departmentNo = String(nextDepartmentNo).padStart(5, '0');
        const depPrefix = PREFIX.DEPARTMENT
        return depPrefix.concat(codeSuffix).concat(departmentNo);
    }

    private _getNewOrgSuffix = async (orgName: String) => {
        return orgName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '').toUpperCase().substring(0, 3);
    }

    private _getNextUserTypeNo = async (userType: UserTypeVo): Promise<OrgCodeNoDto> => {
        const nextUserTypeNo = {} as OrgCodeNoDto;
        const lastUserTypeOrder = await new MetaOrgService().getLastCodeNo(userType.orgId);
        nextUserTypeNo.userTypeNo = lastUserTypeOrder.userTypeNo + 1;
        return nextUserTypeNo;
    }

    private _getNewUserTypeCode = async (nextUserTypeNo: Number, codeSuffix: string) => {
        const userTypeNo = String(nextUserTypeNo).padStart(5, '0');
        const userTypePrefix = PREFIX.USER_TYPE
        return userTypePrefix.concat(codeSuffix).concat(userTypeNo);
    }

    private _addAdmin = async (org: OrgVo): Promise<void> => {
        const user = {} as UserVo;
        const acl = {} as AclVo;
        const name = org.adminName?.split(' ');
        if (name && name?.length > 0) {
            user.nameF = name[0];
            if (name.length > 1) {
                user.nameL = name[1];
            }
        }
        if (org.adminCell) {
            user.cell = org.adminCell;
        }
        user.address = org.address;
        acl.orgId = org._id?.toString();
        acl.brId = acl.orgId;
        acl.role = ROLE.ADMIN;
        acl.subRole = org.adminDesignation;
        acl.departmentId = null;
        acl.userTypeId = null;
        acl.active = true;
        user.emp = {} as { [key: string]: AclVo };
        user.emp[acl.orgId] = acl;
        await new UserService().saveStaff(new UserEmpDto(user, acl));
    }

}

