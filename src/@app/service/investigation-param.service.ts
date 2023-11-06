import { InvestigationParamVo, OrgCodeNoDto } from "aayam-clinic-core";
import investigationParamModel from "../../@app/model/investigation-param.model";
import { PREFIX } from "../../@shared/const/prefix-suffix";
import { MetaOrgService } from "../../@shared/service/meta-org.service";
import { OrgService } from "../../@shared/service/org.service";

export class InvestigationParamService {
  public investigationParamModel = investigationParamModel;

  /* ************************************* Public Methods ******************************************** */
  public addUpdateInvestigationParam = async (param: InvestigationParamVo): Promise<InvestigationParamVo | null> => {
    try {
      if (param._id) {
        return await investigationParamModel.findByIdAndUpdate(param._id, param);
      } else {
        const nextTestNo = await this._getNextTestNo(param);
        const orgDetails = await new OrgService().getOrgById(param.orgId);
        const testCode = await this._getNewTestCode(nextTestNo.testNo, orgDetails?.codeSuffix as string);
        param.testCode = testCode;
        await new MetaOrgService().updateCodeNo(param.orgId, nextTestNo);
        return await investigationParamModel.create(param);
      }
    } catch (error) {
      throw error;
    }
  };

  public getInvestigationParam = async (orgId: string): Promise<InvestigationParamVo[] | null> => {
    try {
      if (!orgId) {
        return null;
      }
      return await investigationParamModel.find({ orgId: orgId }) as InvestigationParamVo[];
    } catch (error) {
      throw error;
    }
  };

  /* ************************************* Private Methods ******************************************** */
  private _getNewTestCode = async (no: number, codeSuffix: string) => {
    const testNo = String(no).padStart(5, '0');
    const testPrefix = PREFIX.INVESTIGATION;
    return testPrefix.concat(codeSuffix).concat(testNo);
  }

  private _getNextTestNo = async (param: InvestigationParamVo): Promise<OrgCodeNoDto> => {
    const codeNo = {} as OrgCodeNoDto;
    const lastCodeOrder = await new MetaOrgService().getLastCodeNo(param.orgId);
    codeNo.testNo = lastCodeOrder.testNo + 1;
    return codeNo;
  }
}
