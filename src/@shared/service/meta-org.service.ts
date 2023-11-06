import metaOrgModel from "../../@shared/model/metadata-org.model";
import {
    MetadataOrgVo,
    OrgCodeNoDto
} from "aayam-clinic-core";

export class MetaOrgService {
    public metaOrgModel = metaOrgModel;

    /* ************************************* Public Methods ******************************************** */
    public updateCodeNo = async (orgId: string, orgCodeNoDto: OrgCodeNoDto): Promise<void> => {
        try {
            const field = {} as { [key: string]: number };
            if (orgCodeNoDto.no > 0) {
                field['no'] = orgCodeNoDto.no;
            }
            if (orgCodeNoDto.patientNo > 0) {
                field['patientNo'] = orgCodeNoDto.patientNo;
            }
            if (orgCodeNoDto.departmentNo > 0) {
                field['departmentNo'] = orgCodeNoDto.departmentNo;
            }
            if (orgCodeNoDto.userTypeNo > 0) {
                field['userTypeNo'] = orgCodeNoDto.userTypeNo;
            }
            if (orgCodeNoDto.serviceTypeNo > 0) {
                field['serviceTypeNo'] = orgCodeNoDto.serviceTypeNo;
            }
            if (orgCodeNoDto.serviceItemNo > 0) {
                field['serviceItemNo'] = orgCodeNoDto.serviceItemNo;
            }
            if (orgCodeNoDto.userNo > 0) {
                field['userNo'] = orgCodeNoDto.userNo;
            }
            if (orgCodeNoDto.productNo > 0) {
                field['productNo'] = orgCodeNoDto.productNo;
            }
            if (orgCodeNoDto.pharmacyOrderNo > 0) {
                field['pharmacyOrderNo'] = orgCodeNoDto.pharmacyOrderNo;
            }

            const meta = await metaOrgModel.findOne({ orgId }) as MetadataOrgVo | null;
            if (!meta) {
                const vo = {} as MetadataOrgVo;
                vo.no = orgCodeNoDto.no;
                vo.patientNo = orgCodeNoDto.patientNo;
                vo.departmentNo = orgCodeNoDto.departmentNo;
                vo.userTypeNo = orgCodeNoDto.userTypeNo;
                vo.serviceTypeNo = orgCodeNoDto.serviceTypeNo;
                vo.serviceItemNo = orgCodeNoDto.serviceItemNo;
                vo.userNo = orgCodeNoDto.userNo;
                vo.productNo = orgCodeNoDto.productNo;
                vo.pharmacyOrderNo = orgCodeNoDto.pharmacyOrderNo;
                vo.orgId = orgId;
                await metaOrgModel.create(vo);
            } else {
                await metaOrgModel.findByIdAndUpdate(meta._id, { $set: field }, { new: true });
            }

        } catch (error) {
            throw error;
        }
    };

    public getLastCodeNo = async (orgId: string): Promise<OrgCodeNoDto> => {
        const dto = {} as OrgCodeNoDto;
        dto.no = 0;
        dto.patientNo = 0;
        dto.departmentNo = 0;
        dto.userTypeNo = 0;
        dto.serviceTypeNo = 0;
        dto.userNo = 0;
        dto.productNo = 0;
        dto.serviceItemNo = 0;
        dto.pharmacyOrderNo = 0;
        dto.testNo = 0;
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
            if (meta?.serviceItemNo > 0) {
                dto.serviceItemNo = meta.serviceItemNo;
            }
            if (meta?.userNo > 0) {
                dto.userNo = meta.userNo;
            }
            if (meta?.productNo > 0) {
                dto.productNo = meta.productNo;
            }
            if (meta?.pharmacyOrderNo > 0) {
                dto.pharmacyOrderNo = meta.pharmacyOrderNo;
            }
            if (meta?.testNo > 0) {
                dto.testNo = meta.testNo;
            }
        }
        return dto;
    }

    /* ************************************* Private Methods ******************************************** */
}

