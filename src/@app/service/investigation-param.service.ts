import { InvestigationParamVo } from "aayam-clinic-core";
import investigationParamModel from "../../@app/model/investigation-param.model";

export class InvestigationParamService {
  public investigationParamModel = investigationParamModel;

  /* ************************************* Public Methods ******************************************** */
  public addUpdateInvestigationParam = async (param: InvestigationParamVo): Promise<InvestigationParamVo | null> => {
    try {
      if (param._id) {
        return await investigationParamModel.findByIdAndUpdate(param._id, param);
      } else {
        return await investigationParamModel.create(param);
      }
    } catch (error) {
      throw error;
    }
  };

  /* ************************************* Private Methods ******************************************** */
}