import metaOrgModel from "../../@shared/model/metadata-org.model";
import {
    MetadataOrgVo,
    OrgOrderNoDto
} from "aayam-clinic-core";

export class MetaOrgService {
    public metaOrgModel = metaOrgModel;

    /* ************************************* Public Methods ******************************************** */
    public updateOrderNo = async (orgId: string, no: number, patientNo: number, departmentNo: number, userTypeNo : number, serviceTypeNo : number): Promise<void> => {
        try {
            const field = {} as { [key: string]: number };
            if (no > 0) {
                field['no'] = no;
            }
            if (patientNo > 0) {
                field['patientNo'] = patientNo;
            }
            if (departmentNo > 0) {
                field['departmentNo'] = departmentNo;
            }
            if (userTypeNo > 0) {
                field['userTypeNo'] = userTypeNo;
            }
            if (serviceTypeNo > 0) {
                field['serviceTypeNo'] = serviceTypeNo;
            }

            const meta = await metaOrgModel.findOne({ orgId }) as MetadataOrgVo | null;
            if (!meta) {
                const vo = {} as MetadataOrgVo;
                vo.no = no;
                vo.patientNo = patientNo;
                vo.departmentNo = departmentNo;
                vo.userTypeNo = userTypeNo;
                vo.serviceTypeNo = serviceTypeNo;
                vo.orgId = orgId;
                await metaOrgModel.create(vo);
            } else {
                await metaOrgModel.findByIdAndUpdate(meta._id, { $set: field }, { new: true });
            }

        } catch (error) {
            throw error;
        }
    };

    public getLastOrderNo = async (orgId: string): Promise<OrgOrderNoDto> => {
        const dto = {} as OrgOrderNoDto;
        dto.no = 0;
        dto.patientNo = 0;
        dto.departmentNo = 0;
        dto.userTypeNo = 0
        dto.serviceTypeNo = 0
        const meta: MetadataOrgVo = await metaOrgModel.findOne({ orgId: orgId }) as MetadataOrgVo;
        if (meta) {
            if (meta?.no > 0) {
                dto.no = meta.no;
            }
            if (meta?.patientNo > 0) {
                dto.patientNo = meta.patientNo;
            }
            if (meta?.departmentNo > 0) {
                dto.departmentNo = meta.departmentNo;
            }
            if (meta?.userTypeNo > 0) {
                dto.userTypeNo = meta.userTypeNo;
            }
            if (meta?.serviceTypeNo > 0) {
                dto.serviceTypeNo = meta.serviceTypeNo;
            }
        }
        return dto;
    }

    /* ************************************* Private Methods ******************************************** */
}

