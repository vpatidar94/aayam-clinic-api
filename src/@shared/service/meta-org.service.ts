import orgModel from "../../@shared/model/org.model";
import {
    MetadataOrgVo,
    OrgOrderNoDto,
    OrgVo
} from "aayam-clinic-core";
import userModel from '../model/users.model';
import metaOrgModel from "@shared/model/metadata-org.model";

export class MetaOrgService {
    public metaOrgModel = metaOrgModel;

    /* ************************************* Public Methods ******************************************** */
    public updateOrderNo = async (orgId: string, no: number, patientNo: number): Promise<void> => {
        try {
            const field = {} as { [key: string]: number };
            field['no'] = no;
            field['no'] = patientNo;
            await userModel.findByIdAndUpdate({ orgId }, { $set: field }, { new: true });
        } catch (error) {
            throw error;
        }
    };

    public getLastOrderNo = async (orgId: string): Promise<OrgOrderNoDto> => {
        const dto = {} as OrgOrderNoDto;
        dto.no = 0;
        dto.patientNo = 0;
        const meta: MetadataOrgVo = await userModel.findOne({ orgId: orgId }) as MetadataOrgVo;
        if (meta) {
            if (meta?.no > 0) {
                dto.no = meta.no;
            }
            if (meta?.patientNo > 0) {
                dto.patientNo = meta.patientNo;
            }
        }
        return dto;
    }

    /* ************************************* Private Methods ******************************************** */
}

