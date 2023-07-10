import orgModel from "../../@shared/model/org.model";
import {
    OrgVo
} from "aayam-clinic-core";
import userModel from '../model/users.model';

export class OrgService {
    public org = orgModel;

    /* ************************************* Public Methods ******************************************** */
    public addUpdateOrg = async (org: OrgVo): Promise<OrgVo | null> => {
        try {
            if (org._id) {
                return await userModel.findByIdAndUpdate(org._id, org);
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

    /* ************************************* Private Methods ******************************************** */
}

