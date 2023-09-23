import metaOrgModel from "../../@shared/model/metadata-org.model";
import {
    MetadataOrgVo,
    OrgOrderNoDto
} from "aayam-clinic-core";

export class MetaOrgService {
    public metaOrgModel = metaOrgModel;

    /* ************************************* Public Methods ******************************************** */
    public updateOrderNo = async ( orgId: string, OrgOrderNoDto: OrgOrderNoDto): Promise<void> => {
        try {
            const field = {} as { [key: string]: number };
            if (OrgOrderNoDto.no > 0) {
                field['no'] = OrgOrderNoDto.no;
            }
            if (OrgOrderNoDto.patientNo > 0) {
                field['patientNo'] = OrgOrderNoDto.patientNo;
            }
            if (OrgOrderNoDto.departmentNo > 0) {
                field['departmentNo'] = OrgOrderNoDto.departmentNo;
            }
            if (OrgOrderNoDto.userTypeNo > 0) {
                field['userTypeNo'] = OrgOrderNoDto.userTypeNo;
            }
            if (OrgOrderNoDto.serviceTypeNo > 0) {
                field['serviceTypeNo'] = OrgOrderNoDto.serviceTypeNo;
            }
            if (OrgOrderNoDto.serviceItemNo > 0) {
                field['serviceItemNo'] = OrgOrderNoDto.serviceItemNo;
            }
            if (OrgOrderNoDto.userNo > 0) {
                field['userNo'] = OrgOrderNoDto.userNo;
            }
            if (OrgOrderNoDto.productNo > 0) {
                field['productNo'] = OrgOrderNoDto.productNo;
            }
            if (OrgOrderNoDto.pharmacyOrderNo > 0) {
                field['pharmacyOrderNo'] = OrgOrderNoDto.pharmacyOrderNo;
            }

            const meta = await metaOrgModel.findOne({ orgId }) as MetadataOrgVo | null;
            if (!meta) {
                const vo = {} as MetadataOrgVo;
                vo.no = OrgOrderNoDto.no;
                vo.patientNo = OrgOrderNoDto.patientNo;
                vo.departmentNo = OrgOrderNoDto.departmentNo;
                vo.userTypeNo = OrgOrderNoDto.userTypeNo;
                vo.serviceTypeNo = OrgOrderNoDto.serviceTypeNo;
                vo.serviceItemNo = OrgOrderNoDto.serviceItemNo;
                vo.userNo = OrgOrderNoDto.userNo;
                vo.productNo = OrgOrderNoDto.productNo;
                vo.pharmacyOrderNo = OrgOrderNoDto.pharmacyOrderNo;
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
        dto.userTypeNo = 0;
        dto.serviceTypeNo = 0;
        dto.userNo = 0;
        dto.productNo = 0;
        dto.serviceItemNo = 0;
        dto.pharmacyOrderNo = 0;
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
        }
        return dto;
    }

    /* ************************************* Private Methods ******************************************** */
}

