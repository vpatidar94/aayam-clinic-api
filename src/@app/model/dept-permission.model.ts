import { DepartmentPermissionVo } from "aayam-clinic-core";
import * as mongoose from "mongoose";

const deptPermissionSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    name: String,
    access: Boolean
  }
);

const deptPermissionModel = mongoose.model<DepartmentPermissionVo & mongoose.Document>(
  "DepartmentPermission",
  deptPermissionSchema
);

export default deptPermissionModel;
