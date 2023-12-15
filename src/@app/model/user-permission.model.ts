import { UserPermissionVo } from "aayam-clinic-core";
import * as mongoose from "mongoose";

const userPermissionSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Org" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    name: String,
    access: Boolean
  }
);

const userPermissionModel = mongoose.model<UserPermissionVo & mongoose.Document>(
  "UserPermission",
  userPermissionSchema
);

export default userPermissionModel;
