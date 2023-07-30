import investigationModel from "@app/model/investigation.model";
import { InvestigationVo } from "aayam-clinic-core";

export class InvestigationService {
  public investigationModel = investigationModel;

  /* ************************************* Public Methods ******************************************** */
  public getUserInvestigation = async (userId: string): Promise<Array<InvestigationVo> | null> => {
    const list = [] as Array<InvestigationVo>;
    return await this.investigationModel.find({ patientId: userId }) as Array<InvestigationVo>;
  };

  /* ************************************* Private Methods ******************************************** */
}
